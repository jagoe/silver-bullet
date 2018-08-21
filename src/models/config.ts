import CredentialSettings from './credentialSettings'
import Mapping from './mapping'

export default interface Config {
  editor: string
  configPath: string
  path: string
  mappings: {[key: string]: Mapping}
  projectile?: {
    api: {
      host: string
      port: number,
    }
    credentials: CredentialSettings,
  }
  jira?: {
    restUri: string
    credentials: CredentialSettings
    ticketPatterns: Array<string>,
  }
  modes: {
    preview: boolean | string
    showAfterPreview: boolean
    export: boolean
    latestOnly: boolean
    editConfig: boolean,
  }
}
