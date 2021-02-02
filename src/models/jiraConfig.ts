import CredentialSettings from './credentialSettings'

interface JiraBaseConfig {
  restUri: string
  ticketPatterns: Array<string>
}

export interface JiraConfig extends JiraBaseConfig {
  credentials: CredentialSettings
}

export interface JiraCredentialConfig extends JiraBaseConfig {
  credentials: {
    username: string
    password: string
  }
}
