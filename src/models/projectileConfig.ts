import CredentialSettings from './credentialSettings'
import {Credentials} from './credentials'

interface ProjectileConfigBase {
  api: {
    host: string
    port: number
  }
}

export interface ProjectileConfig extends ProjectileConfigBase {
  credentials: CredentialSettings
}

export interface ProjectileConfigWithCredentials extends ProjectileConfigBase {
  credentials: Credentials
}
