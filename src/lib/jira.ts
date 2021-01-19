import * as request from 'request-promise-native'
import {JiraCredentialConfig} from '../models/jiraConfig'

export async function getTicketSummary(
  jiraConfigs: Array<JiraCredentialConfig>,
  comment: string,
): Promise<string | undefined> {
  const ticketConfig = jiraConfigs.find(config => {
    const patterns = config.ticketPatterns.map(pattern => new RegExp(pattern, 'g'))

    return patterns.some(pattern => pattern.test(comment))
  })
  if (!ticketConfig) {
    return
  }

  const ticketPatterns = ticketConfig.ticketPatterns.map(pattern => new RegExp(pattern, 'g'))

  const ticketNrs: Array<string> = []
  for (let i = 0; i < ticketPatterns.length && !ticketNrs.length; i++) {
    let match: RegExpExecArray | null
    while (true) {
      match = ticketPatterns[i].exec(comment)
      if (!match) {
        break
      }

      ticketNrs.push(match[0])
    }
  }

  if (!ticketNrs.length) {
    return
  }

  const basicAuth = Buffer.from(`${ticketConfig.credentials.username}:${ticketConfig.credentials.password}`).toString(
    'base64',
  )

  const tickets = await Promise.all(
    ticketNrs.map(
      async ticketNr =>
        await request({
          uri: `${ticketConfig.restUri}/agile/1.0/issue/${ticketNr}?fields=summary,issuetype,parent`,
          method: 'GET',
          json: true,
          headers: {
            authorization: `Basic ${basicAuth}`,
            contentType: 'application/json',
          },
        }),
    ),
  )

  if (!tickets.length) {
    return
  }

  const ticketSummary = tickets
    .map(ticket => {
      // use story summary unless the story is Bug Lane or Fast Lane
      if (
        ticket.fields.issuetype.name !== 'Story' &&
        ticket.fields.parent &&
        !ticket.fields.parent.fields.summary.startsWith('Fast Lane:') &&
        !ticket.fields.parent.fields.summary.startsWith('Bug Lane:')
      ) {
        return ticket.fields.parent.fields.summary
      }

      return ticket.fields.summary
    })
    .join(', ')

  return ticketSummary
}
