import * as request from 'request-promise-native'

import {JiraCredentialConfig} from '../../models/jiraConfig'
import {Ticket} from './Ticket'
import {logger} from '../log'

export async function getTickets(
  jiraConfigs: Array<JiraCredentialConfig>,
  comment: string,
): Promise<Array<Ticket> | undefined> {
  const ticketConfig = jiraConfigs.find(config => {
    const patterns = config.ticketPatterns.map(pattern => new RegExp(pattern, 'g'))

    return patterns.some(pattern => pattern.test(comment))
  })
  if (!ticketConfig) {
    return
  }

  const tickets: Record<string, Ticket> = {}

  const ticketPatterns = ticketConfig.ticketPatterns.map(pattern => new RegExp(`(${pattern})(?: \\((.*?)\\))?`, 'g'))

  for (const pattern of ticketPatterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(comment))) {
      if (!match) {
        break
      }

      const nr = match[1]
      const description = match[2]

      tickets[nr] = {_config: ticketConfig, nr, description: description?.trim() ?? '', summary: ''}
    }
  }

  if (!Object.keys(tickets).length) {
    return
  }

  const basicAuth = Buffer.from(`${ticketConfig.credentials.username}:${ticketConfig.credentials.password}`).toString(
    'base64',
  )

  return Promise.all(
    Object.values(tickets).map(async ticket => {
      logger.trace(`Jira :: Retrieving ticket info ${ticket.nr}...`)
      const ticketInfo = await request({
        uri: `${ticketConfig.restUri}/agile/1.0/issue/${ticket.nr}?fields=summary,issuetype,parent`,
        method: 'GET',
        json: true,
        headers: {
          authorization: `Basic ${basicAuth}`,
          contentType: 'application/json',
        },
      })
      logger.trace(`Jira :: Retrieving ticket info ${ticket.nr} done`)

      if (
        ticketInfo.fields.issuetype.name !== 'Story' &&
        ticketInfo.fields.parent &&
        !ticketInfo.fields.parent.fields.summary.startsWith('Fast Lane:') &&
        !ticketInfo.fields.parent.fields.summary.startsWith('Bug Lane:')
      ) {
        ticket.summary = ticketInfo.fields.parent.fields.summary
      } else {
        ticket.summary = ticketInfo.fields.summary
      }

      return ticket
    }),
  )
}
