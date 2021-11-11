import CredentialSettings from './credentialSettings'
import {Credentials} from './credentials'

interface ProjectileConfigBase {
  api: {
    restUri: string
    app: number
  }
}

export interface ProjectileConfig extends ProjectileConfigBase {
  credentials: CredentialSettings
}

export interface ProjectileConfigWithCredentials extends ProjectileConfigBase {
  credentials: Credentials
}
