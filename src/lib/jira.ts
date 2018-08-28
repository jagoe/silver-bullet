import * as request from 'request-promise-native'

export async function getTicketSummary(
  uri: string,
  credentials: any,
  patterns: Array<string>,
  comment: string,
): Promise<string | undefined> {
  const basicAuth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')
  const ticketPatterns = patterns.map(pattern => new RegExp(pattern, 'g'))

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

  const tickets = await Promise.all(ticketNrs.map(async (ticketNr) => await request({
    uri: `${uri}/agile/1.0/issue/${ticketNr}?fields=summary,issuetype,parent`,
    method: 'GET',
    json: true,
    headers: {
      authorization: `Basic ${basicAuth}`,
      contentType: 'application/json',
    },
  })))

  if (!tickets.length) {
    return
  }

  const ticketSummary = tickets.map(ticket => {
    // use story summary unless the story is Bug Lane or Fast Lane
    if (ticket.fields.issuetype.name !== 'Story'
      && ticket.fields.parent
      && !ticket.fields.parent.fields.summary.startsWith('Fast Lane:')
      && !ticket.fields.parent.fields.summary.startsWith('Bug Lane:')
    ) {
      return ticket.fields.parent.fields.summary
    }

    return ticket.fields.summary
  }).join(', ')

  return ticketSummary
}
