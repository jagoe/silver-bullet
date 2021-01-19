import CredentialSettings from './credentialSettings'

export interface JiraConfig {
  restUri: string
  credentials: CredentialSettings
  ticketPatterns: Array<string>
}

export interface JiraCredentialConfig {
  restUri: string
  credentials: {
    username: string
    password: string,
  }
  ticketPatterns: Array<string>
}
