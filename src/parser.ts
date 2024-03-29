import * as Path from 'path'
import * as fs from 'fs'

import {Ticket, getTicketSummary} from './lib/jira'

import {Config} from './models/config'
import {getTickets} from './lib/jira/getTickets'
import {logger} from './lib/log'
import {promisify} from 'util'

const readFile = promisify(fs.readFile)
const exists = promisify(fs.exists)

export interface Entry {
  start: Date
  end: Date
  duration: number
  package: string
  comment: string
  tickets?: Array<Ticket>
  summary: string
  raw?: string
}

export interface Day {
  date: string
  weekday: number
  entries: Array<Entry>
  total: number
}

const dayPattern = /(?:\w+\/)?(\d\d)\.(\d\d)\.\s*((?:.+?\r?\n?)+\r?\n?)/g
export async function parse(config: Config): Promise<Day[]> {
  const {path} = config
  const {latestOnly} = config.modes

  if (!(await exists(path))) {
    throw new Error(`no time tracking file found at ${Path.normalize(Path.join(__dirname, path))}`)
  }

  logger.trace(`parser :: Reading tracking file content`)
  const fileContent = (await readFile(path)).toString()

  logger.trace(`parser :: Parsing days...`)
  const days = await loopRegex(dayPattern, fileContent, async m => await parseDay(m, config))
  logger.trace(`parser :: Parsing days done`)

  return latestOnly ? [days[days.length - 1]] : days
}

const entryPattern = /(?:\/\/ )?(\d\d)[:.](\d\d).+?(\d\d)[:.](\d\d) (.+)/g
async function parseDay(match: RegExpExecArray, config: Config): Promise<Day> {
  const month = parseInt(match[2], 10) - 1
  const day = parseInt(match[1], 10)
  const date = new Date(Date.UTC(new Date().getFullYear(), month, day))
  const entryBlock = match[3]

  logger.trace(`parser :: Day (${date.toLocaleDateString()}) :: Parsing entries...`)
  let entries = await loopRegex(entryPattern, entryBlock, async m => await parseEntry(m, date, config))

  logger.trace(`parser :: Day (${date.toLocaleDateString()}) :: Parsing entries done`)

  logger.trace(`parser :: Day (${date.toLocaleDateString()}) :: Validating timeline...`)
  validateTimeline(entries)
  logger.trace(`parser :: Day (${date.toLocaleDateString()}) :: Validating timeline done`)

  logger.trace(`parser :: Day (${date.toLocaleDateString()}) :: Combining entries...`)
  entries = combine(entries)
  logger.trace(`parser :: Day (${date.toLocaleDateString()}) :: Combining entries done`)
  entries = entries.sort((a, b) => a.package.localeCompare(b.package))

  return {
    weekday: date.getDay(),
    date: date.toISOString().substr(0, 10),
    entries,
    get total() {
      return entries.reduce((sum, e) => sum + e.duration, 0)
    },
  }
}

async function parseEntry(match: RegExpExecArray, date: Date, config: Config): Promise<Entry | null> {
  const raw = match[0]
  logger.trace(`parser :: Entry :: Parsing entry ${raw}...`)

  if (raw.startsWith('#') || raw.startsWith('//')) {
    logger.trace(`parser :: Entry :: Skipping entry ${raw}; is a comment.`)
    return null
  }

  const start = getTimeOfDay(date, match[1], match[2])
  const end = getTimeOfDay(date, match[3], match[4])
  const duration = end.getHours() - start.getHours() + (end.getMinutes() - start.getMinutes()) / 60

  const text = match[5].split(`:`)
  const shorthand = text[0]

  const configEntry = config.mappings[shorthand]
  if (!configEntry) {
    throw new Error(`No mapping found for entry ${raw}`)
  }

  const entryPackage = `${configEntry.projectNr}-${configEntry.packageNr}`

  if (!configEntry.comment && !text[1]) {
    throw new Error(`Comment missing for entry ${raw}`)
  }

  let comment: string
  if (configEntry.comment) {
    comment = `${configEntry.comment}${text[1] ? ` (${text[1].trim()})` : ''}`
  } else {
    comment = text[1]
  }

  comment = comment.trim()

  let tickets: Array<Ticket> | undefined
  if (config.jira && config.jira.length) {
    logger.trace(`parser :: Entry :: Retrieving ticket info...`)
    tickets = await getTickets(config.jira, comment)
    logger.trace(`parser :: Entry :: Retrieving ticket info done`)
  }

  logger.trace(`parser :: Entry :: Parsing entry ${raw} done.`)

  return {
    start,
    end,
    duration,
    package: entryPackage,
    comment,
    tickets,
    summary: tickets ? `${tickets.map(getTicketSummary).join(`, `)}` : comment,
    raw,
  }
}

function validateTimeline(entries: Array<Entry>) {
  let end = 0
  for (const entry of entries) {
    if (entry.start.getTime() < end) {
      throw new Error(`Entry starts before last entry ended: ${entry.raw}`)
    }

    if (entry.end < entry.start) {
      throw new Error(`Entry ends before it starts: ${entry.raw}`)
    }

    end = entry.end.getTime()
  }
}

function combine(entries: Array<Entry>) {
  const combined: {[key: string]: Entry} = entries
    .map(entry => ({key: `${entry.package}_${entry.comment}`, entry}))
    .reduce((map: {[key: string]: Entry}, value) => {
      if (!map[value.key]) {
        map[value.key] = value.entry
      } else {
        map[value.key].duration += value.entry.duration
      }

      delete map[value.key].raw

      return map
    }, {})

  return Object.values(combined)
}

async function loopRegex<T>(
  pattern: RegExp,
  text: string,
  fn: (match: RegExpExecArray) => Promise<T | null>,
): Promise<T[]> {
  const entries: Array<Promise<T | null>> = []
  let match: RegExpExecArray | null

  do {
    match = pattern.exec(text)
    if (!match) {
      break
    }

    entries.push(fn(match))
  } while (match)

  const allEntries = await Promise.all(entries)
  const validEntries = allEntries.filter(e => e !== null) as Array<T>
  return validEntries
}

function getTimeOfDay(date: Date, hour: string, minute: string) {
  date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

  date.setUTCHours(parseInt(hour, 10), parseInt(minute, 10))

  return date
}
