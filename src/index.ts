import * as fs from 'fs'
import {promisify} from 'util'
import {load as loadConfig} from './config'
import Config from './models/config'
import {Day, parse} from './parser'

const exists = promisify(fs.exists)
const writeFile = promisify(fs.writeFile)

async function start() {
  const config = await loadConfig()
  const week = await parse()

  if (config.preview) {
    return print(config, week)
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
}

(async () => {
  await start()
})()
