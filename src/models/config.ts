import Mapping from './mapping'

export default interface Config {
  editor: string
  path: string
  showAfterPreview: boolean
  mappings: {[key: string]: Mapping}
  preview: boolean | string
  export: boolean
  editConfig: boolean
  configPath: boolean
  projectile?: {
    api: {
      host: string,
      port: number,
    },
    credentials?: {
      basic?: {
        username: string
        password: string,
      },
      pass?: {
        name: string
        usernameLine: number
        passwordLine: number,
      },
    },
  }
}
