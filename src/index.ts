import {exec} from 'child_process'
import * as minimist from 'minimist'
import {load as loadConfig} from './config'
import {exportJSON} from './exporters/json'
import {exportProjectile} from './exporters/projectile'
import {parse} from './parser'

const argv = minimist(process.argv)

export async function start() {
  const config = await loadConfig()

  // tracking mode
  if (Object.keys(argv).length === 1) {
    // no arguments - open tracker
    exec(`${config.editor} ${config.path}`)
    return
  }

  // edit mode
  if (config.editConfig) {
    exec(`${config.editor} ${config.configPath}`)
    return
  }

  const week = await parse()

  // preview mode
  if (config.preview) {
    const path = await exportJSON(config, week)
    exec(`${config.editor} ${path}`)
    return
  }

  if (config.export) {
    await exportProjectile(config, week)
  }
}
