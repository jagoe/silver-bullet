import deepMerge = require('deep-merge')
import * as fs from 'fs'
import {homedir} from 'os'
import * as Path from 'path'
import {promisify} from 'util'

const readFile = promisify(fs.readFile)
const exists = promisify(fs.exists)

export interface Mapping {
  projectNr: number,
  packageNr: number,
  comment?: string
}

export interface Config {
  path: string,
  maxEntries: number,
  hotkeys: {
    insert: string,
    next: string,
    prev: string,
    reset: string,
    week: string,
  },
  mappings: {[key: string]: Mapping}
}

const defaultConfig: Config = {
  path: Path.join(homedir(), 'time.txt'),
  maxEntries: 7,
  hotkeys: {
    insert: 'alt+shift+i',
    next: 'alt+shift+n',
    prev: 'alt+shift+p',
    reset: 'alt+shift+r',
    week: 'alt+shift+w',
  },
  mappings: {},
}

/**
 * Loads the configuration, merging it with an optional user-defined config.json
 */
export async function load(configPath: string) {
  let config = defaultConfig

  const userConfig = await readConfig(configPath)
  if (userConfig) {
    const merge = deepMerge((_a, b) => b)
    config = merge(defaultConfig, userConfig)
    // config = Object.assign({}, defaultConfig, userConfig)
    if (config.path.startsWith('~/')) {
      config.path = config.path.replace('~', homedir())
    }
  }

  return config
}

async function readConfig(path: string) {
  if (!await exists(path)) {
    return null
  }

  const content = await readFile(path)
  try {
    return JSON.parse(content.toString())
  } catch {
    throw new Error('invalid config file - please make sure the config.json contains valid JSON')
  }
}
