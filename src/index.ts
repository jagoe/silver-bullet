import * as minimist from 'minimist'

import {exec} from 'child_process'
import {load as loadConfig} from './config'
import {exportJSON} from './exporters/json'
import {exportProjectile} from './exporters/projectile'
import {trackTimes} from './lib/jira'
import {logger} from './lib/log'
import {parse} from './parser'

const argv = minimist(process.argv)

export async function start() {
  const config = await loadConfig()

  // tracking mode
  if (Object.keys(argv).length === 1) {
    // no arguments - open tracker
    logger.debug('start :: Opening tracking file')
    exec(`${config.editor} ${config.path}`)
    return
  }

  // edit mode
  if (config.modes.editConfig) {
    logger.debug('start :: Opening config')
    exec(`${config.editor} ${config.configPath}`)
    return
  }

  logger.debug('start :: Parsing tracking file')
  const week = await parse(config)

  // preview mode
  if (config.modes.preview) {
    logger.debug('start :: Generating preview')
    const path = await exportJSON(config, week)
    exec(`${config.editor} ${path}`)
    return
  }

  if (config.modes.export) {
    logger.debug('start :: Exports starting...')
    if (config.projectile) {
      logger.debug('start :: Projectile export starting...')
      await exportProjectile(config, week)
      logger.debug('start :: Projectile export done')
    }

    if (config.jira && config.jira.length) {
      logger.debug('start :: Jira export starting...')
      await trackTimes(week)
      logger.debug('start :: Jira export done')
    }
  }

  logger.debug('start :: Done')
}
