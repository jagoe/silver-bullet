import {exec} from 'child_process'
import * as fs from 'fs'
import * as minimist from 'minimist'
import {promisify} from 'util'
import {load as loadConfig} from './config'
import Config from './models/config'
import {Day, parse} from './parser'

const exists = promisify(fs.exists)
const writeFile = promisify(fs.writeFile)

const argv = minimist(process.argv)

export async function start() {
  const config = await loadConfig()
  if (Object.keys(argv).length === 1) {
    // no arguments - open tracker
    exec(`${config.editor} ${config.path}`)
    return
  }
  if (config.editConfig) {
    exec(`${config.editor} ${config.configPath}`)
    return
  }

  const week = await parse()

  if (config.preview) {
    const path = await print(config, week)
    exec(`${config.editor} ${path}`)
  }
}

async function print(config: Config, week: Array<Day>) {
  const total = week.reduce((sum, day) => sum + day.total, 0)
  let outputPath

  if (typeof config.preview === 'string' && await exists(config.preview)) {
    outputPath = config.preview
  } else {
    const file = config.path.slice(0, config.path.lastIndexOf('.'))
    const ext = '.json'

    outputPath = `${file}_parsed${ext}`
  }

  await writeFile(outputPath, JSON.stringify({week, total}, null, 2))

  return outputPath
}
