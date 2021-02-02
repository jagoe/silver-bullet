import {Ticket} from './Ticket'

export function getTicketSummary(ticket: Ticket): string {
  return `${ticket.nr} (${ticket.summary})${ticket.description ? ` [${ticket.description}]` : ''}`
}
