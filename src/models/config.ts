import {JiraConfig, JiraCredentialConfig} from './jiraConfig'
import {ProjectileConfig, ProjectileConfigWithCredentials} from './projectileConfig'

import Mapping from './mapping'

interface ConfigBase {
  editor: string
  configPath: string
  path: string
  mappings: {[key: string]: Mapping}
  modes: {
    preview: boolean | string
    showAfterPreview: boolean
    export: boolean
    latestOnly: boolean
    editConfig: boolean,
  }
}

export interface ConfigWithoutCredentials extends ConfigBase {
  projectile?: ProjectileConfig
  jira?: Array<JiraConfig>
}

export interface Config extends ConfigBase {
  jira?: Array<JiraCredentialConfig>
  projectile?: ProjectileConfigWithCredentials
}
