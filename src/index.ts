import * as fs from 'fs'
import * as minimist from 'minimist'
import {homedir} from 'os'
import * as Path from 'path'
import {promisify} from 'util'
import {Config, load as loadConfig} from './config'
import {Day, parse} from './time'

const writeFile = promisify(fs.writeFile)
const exists = promisify(fs.exists)

let currentDay: number
const progress: {[key: number]: number} = {}

const {config: configPath, preview} = minimist(process.argv.slice(2), {
  alias: {
    c: 'config',
    p: 'preview',
  },
  default: {
    c: Path.join(homedir(), '.silverbullet.json'),
    p: false,
  },
})

async function start() {
  const config = await loadConfig(configPath)
  const week = await parse(config)

  if (preview) {
    return print(config.path, week)
  }

  currentDay = week[0].weekday
  await createHooks(config)
  console.log('You can now press any of the hotkeys to work with the parsed times. Press Ctrl+C to quit.')
}

async function createHooks(config: Config) {
  // TODO: Browser plugin OR Electron for global (or Browser-) hotkeys
}

async function pasteDay() {
  // TODO: robotjs (https://www.npmjs.com/package/robotjs) for native
}

async function print(inputPath: string, week: Array<Day>) {
  const total = week.reduce((sum, day) => sum + day.total, 0)
  let outputPath

  if (await exists(preview)) {
    outputPath = preview
  } else {
    const file = inputPath.slice(0, inputPath.lastIndexOf('.'))
    const ext = Path.extname(inputPath)

    outputPath = `${file}_parsed${ext}`
  }

  await writeFile(outputPath, JSON.stringify({week, total}, null, 2))
}

(async () => {
  await start()
})()
