import * as fs from 'fs'

import {Config} from '../models/config'
import {Day} from '../parser'
import {promisify} from 'util'

const exists = promisify(fs.exists)
const writeFile = promisify(fs.writeFile)

export async function exportJSON(config: Config, week: Array<Day>): Promise<string> {
  const total = week.reduce((sum, day) => sum + day.total, 0)
  let outputPath

  if (typeof config.modes.preview === 'string' && (await exists(config.modes.preview))) {
    outputPath = config.modes.preview
  } else {
    const file = config.path.slice(0, config.path.lastIndexOf('.'))
    const ext = '.json'

    outputPath = `${file}_parsed${ext}`
  }

  await writeFile(
    outputPath,
    JSON.stringify({week, total}, (key, value) => (key.startsWith('_') ? undefined : value), 2),
  )

  return outputPath
}
