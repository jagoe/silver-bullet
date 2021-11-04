import * as minimist from 'minimist'

import {exec} from 'child_process'
import {exportJSON} from './exporters/json'
import {load as loadConfig} from './config'
import {logger} from './lib/log'
import {parse} from './parser'
import {trackTimesInJira} from './lib/jira'
import {trackTimesInProjectile} from './lib/projectile'

const argv = minimist(process.argv)

export async function start(): Promise<void> {
  const config = await loadConfig()

  // tracking mode
  if (Object.keys(argv).length === 1) {
    // no arguments - open tracker
    logger.trace('start :: Opening tracking file')
    exec(`${config.editor} ${config.path}`)
    return
  }

  // edit mode
  if (config.modes.editConfig) {
    logger.trace('start :: Opening config')
    exec(`${config.editor} ${config.configPath}`)
    return
  }

  logger.trace('start :: Parsing tracking file')
  const week = await parse(config)

  // preview mode
  if (config.modes.preview) {
    logger.trace('start :: Generating preview')
    const path = await exportJSON(config, week)
    exec(`${config.editor} ${path}`)
    return
  }

  if (config.modes.export) {
    logger.trace('start :: Exports starting...')
    if (config.projectile) {
      logger.trace('start :: Projectile export starting...')
      await trackTimesInProjectile(week, config.projectile)
      logger.trace('start :: Projectile export done')
    }

    if (config.jira && config.jira.length) {
      logger.trace('start :: Jira export starting...')
      await trackTimesInJira(week)
      logger.trace('start :: Jira export done')
    }
  }

  logger.trace('start :: Done')
}
