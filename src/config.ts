import deepMerge = require('deep-merge')

import * as Path from 'path'
import * as fs from 'fs'
import * as minimist from 'minimist'

import {Config, ConfigWithoutCredentials} from './models/config'

import getCredentials from './lib/getCredentials'
import {homedir} from 'os'
import {promisify} from 'util'

const readFile = promisify(fs.readFile)
const exists = promisify(fs.exists)
let _config: Config

const {config: configPath, edit: editConfig, export: _export, preview, latest} = minimist(process.argv, {
  alias: {
    c: 'config',
    e: 'edit',
    p: 'preview',
    x: 'export',
    l: 'latest',
  },
  default: {
    c: Path.join(homedir(), '.silverbullet.json'),
    p: false,
    e: false,
    x: false,
    l: false,
  },
})

const defaultConfig: ConfigWithoutCredentials = {
  editor: getCommandLine(),
  path: Path.join(homedir(), 'time.txt'),
  configPath,
  mappings: {},
  modes: {
    preview,
    showAfterPreview: true,
    export: _export,
    editConfig,
    latestOnly: latest,
  },
}

function getCommandLine() {
  switch (process.platform) {
    case 'darwin':
      return 'open'
    case 'win32':
      return 'start'
    default:
      return 'xdg-open'
  }
}

/**
 * Loads the configuration, merging it with an optional user-defined config.json
 */
export async function load(): Promise<Config> {
  if (_config) {
    return _config
  }

  let config = defaultConfig

  const userConfig = await readConfig(configPath)
  if (userConfig) {
    const merge = deepMerge((_a, b) => b)
    config = merge(defaultConfig, userConfig) as ConfigWithoutCredentials

    if (config.path.startsWith('~/')) {
      config.path = config.path.replace('~', homedir())
    }
  }

  _config = {
    ...config,
    jira: config.jira
      ? await Promise.all(
          config.jira.map(async jiraConfig => ({
            ...jiraConfig,
            credentials: await getCredentials(jiraConfig.credentials),
          })),
        )
      : undefined,
    projectile: config.projectile
      ? {...config.projectile, credentials: await getCredentials(config.projectile.credentials)}
      : undefined,
  }

  return _config
}

async function readConfig(path: string) {
  if (!(await exists(path))) {
    return null
  }

  const content = await readFile(path)
  try {
    return JSON.parse(content.toString())
  } catch {
    throw new Error('invalid config file - please make sure the config.json contains valid JSON')
  }
}
