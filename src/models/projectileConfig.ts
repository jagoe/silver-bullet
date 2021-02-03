import CredentialSettings from './credentialSettings'

interface ProjectileConfigBase {
  api: {
    host: string
    port: number,
  }
}

export interface ProjectileConfig extends ProjectileConfigBase {
  credentials: CredentialSettings
}

export interface ProjectileConfigWithCredentials extends ProjectileConfigBase {
  credentials: {
    username: string
    password: string,
  }
}
