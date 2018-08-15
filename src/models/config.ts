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
    credentials?: {
      basic?: {
        username: string
        password: string,
      }
      pass?: {
        name: string
        usernameLine: number
        passwordLine: number,
      },
    },
  }
  modes: {
    preview: boolean | string
    showAfterPreview: boolean
    export: boolean
    latestOnly: boolean
    editConfig: boolean,
  }
}
