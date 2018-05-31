import * as fs from 'fs'
import * as Path from 'path'
import {promisify} from 'util'
import {load as loadConfig} from './config'
import Config from './models/config'

const readFile = promisify(fs.readFile)
const exists = promisify(fs.exists)

export interface Entry {
  start: Date,
  end: Date,
  duration: number,
  package: string,
  comment: string,
  raw?: string
}

export interface Day {
  weekday: number,
  entries: Array<Entry>,
  total: number,
}

const dayPattern = /(?:\w{2})\/(\d\d)\.(\d\d)\.\s*((?:.|\s)+?)(\r?\n){2}/g
export async function parse() {
  const config = await loadConfig()
  const {path} = config

  if (!await exists(path)) {
    throw new Error(`no time tracking file found at ${Path.normalize(Path.join(__dirname, path))}`)
  }

  const fileContent = (await readFile(path)).toString()

  const days = loopRegex(dayPattern, fileContent, m => parseDay(m, config))

  return days
}

const entryPattern = /(\d\d)[:\.](\d\d).+?(\d\d)[:\.](\d\d) (.+)/g
function parseDay(match: RegExpExecArray, config: Config): Day {
  const month = parseInt(match[2], 10) - 1
  const day = parseInt(match[1], 10)
  const date = new Date(Date.UTC(new Date().getFullYear(), month, day))
  const entryBlock = match[3]

  let entries = loopRegex(entryPattern, entryBlock, m => parseEntry(m, date, config))

  validateTimeline(entries)
  entries = combine(entries)
  entries = entries.sort((a, b) => a.package.localeCompare(b.package))

  return {
    weekday: date.getDay(),
    entries,
    get total() {return entries.reduce((sum, e) => sum + e.duration, 0)},
  }
}

function parseEntry(match: RegExpExecArray, date: Date, config: Config): Entry {
  const raw = match[0]

  const start = getTimeOfDay(date, match[1], match[2])
  const end = getTimeOfDay(date, match[3], match[4])
  const duration = (end.getHours() - start.getHours()) + (end.getMinutes() - start.getMinutes()) / 60

  const text = match[5].split(':')
  const shorthand = text[0]

  const configEntry = config.mappings[shorthand]
  if (!configEntry) {
    throw new Error(`No mapping found for entry ${raw}`)
  }

  const entryPackage = `${configEntry.projectNr}-${configEntry.packageNr}`

  const comment = text[1] || configEntry.comment
  if (!comment) {
    throw new Error(`Comment missing for entry ${raw}`)
  }

  return {
    start,
    end,
    duration,
    package: entryPackage,
    comment: comment.trim(),
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

function loopRegex<T>(pattern: RegExp, text: string, fn: (match: RegExpExecArray) => T) {
  const entries: Array<T> = []
  let match: RegExpExecArray | null

  do {
    match = pattern.exec(text)
    if (!match) {
      break
    }

    entries.push(fn(match))
  } while (match)

  return entries
}

function getTimeOfDay(date: Date, hour: string, minute: string) {
  date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))

  date.setUTCHours(parseInt(hour, 10), parseInt(minute, 10))

  return date
}
