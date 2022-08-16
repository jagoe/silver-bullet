import * as request from 'request-promise-native'

import {Day, Entry} from '../../parser'
import {CreateWorklog, GetWorklog, isSameWorklog} from './Worklog'

export async function trackTimesInJira(week: Array<Day>): Promise<void> {
  for (const day of week) {
    for (const entry of day.entries) {
      await trackTime(entry)
    }
  }
}

async function trackTime(entry: Entry): Promise<void> {
  if (!entry.tickets || !entry.tickets.length) {
    return
  }

  // split duration among tickets with the first ticket getting the remainder
  const durationInMinutes = entry.duration * 60
  const durationPerTicket = Math.floor(durationInMinutes / entry.tickets.length)
  const durationRemainder = durationInMinutes % entry.tickets.length

  // get auth header value
  const basicAuth = Buffer.from(
    `${entry.tickets[0]._config.credentials.username}:${entry.tickets[0]._config.credentials.password}`,
  ).toString('base64')

  for (let i = 0; i < entry.tickets.length; i++) {
    const ticket = entry.tickets[i]

    // skip tracking time for projects that do not track time
    if (!ticket._config.trackTimes) {
      continue
    }

    const ticketDuration = i === 0 ? durationPerTicket + durationRemainder : durationPerTicket

    // get existing worklogs
    const {worklogs} = await request({
      uri: `${ticket._config.restUri}/api/2/issue/${ticket.nr}/worklog`,
      method: 'GET',
      json: true,
      headers: {
        authorization: `Basic ${basicAuth}`,
        contentType: 'application/json',
      },
    })

    // skip if this log already exists
    if (
      worklogs.some((worklog: GetWorklog) =>
        isSameWorklog(worklog, ticketDuration, ticket._config.credentials.username, ticket.description, entry.start),
      )
    ) {
      continue
    }

    // create worklog
    const payload: CreateWorklog = {
      timeSpent: `${ticketDuration}m`,
      started: entry.start.toISOString().replace('Z', '+0000'),
    }
    if (ticket.description) {
      payload.comment = ticket.description
    } else {
      payload.comment = ticket.nr
    }

    await request({
      uri: `${ticket._config.restUri}/api/2/issue/${ticket.nr}/worklog`,
      method: 'POST',
      json: true,
      headers: {
        authorization: `Basic ${basicAuth}`,
        contentType: 'application/json',
      },
      body: payload,
    })
  }
}
