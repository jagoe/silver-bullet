import * as pino from 'pino'

export const logger: pino.Logger = pino({level: process.env.LOG_LEVEL || 'info', prettyPrint: true})
