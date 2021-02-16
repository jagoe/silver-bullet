import {JiraCredentialConfig} from '../../models/jiraConfig'

export interface Ticket {
  _config: JiraCredentialConfig
  nr: string
  summary: string
  description?: string
}
