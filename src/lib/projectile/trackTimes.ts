import * as request from 'request-promise-native'
import {ProjectileConfigWithCredentials} from '../../models/projectileConfig'

import {Day, Entry} from '../../parser'
import {logger} from '../log'
import {authenticate} from './authenticate'

export async function trackTimesInProjectile(week: Array<Day>, config: ProjectileConfigWithCredentials): Promise<void> {
  logger.trace('Projectile :: track times :: Requesting authentication token')

  const token = await authenticate(config)

  logger.trace('Projectile :: track times :: Starting iterating days')

  for (const day of week) {
    logger.trace(`Projectile :: track times :: Day (${day.date}) :: Starting iterating entries`)

    for (const [index, entry] of day.entries.entries()) {
      logger.trace(`Projectile :: track times :: Day (${day.date}) :: Starting tracking entry ${index + 1}`)

      await trackTime(entry, token, config.api)

      logger.trace(`Projectile :: track times :: Day (${day.date}) :: Done tracking entry ${index + 1}`)
    }

    logger.trace(`Projectile :: track times :: Day (${day.date}) :: Done iterating entries`)
  }

  logger.trace('Projectile :: track times :: Done')
}

async function trackTime(entry: Entry, token: string, config: ProjectileConfigWithCredentials['api']): Promise<void> {
  const payload = {
    date: entry.start.toISOString().substr(0, 10),
    duration: entry.duration,
    job: entry.package,
    note: entry.summary,
    type: 'JOBS',
  }

  logger.trace('Projectile :: track times :: Sending request to Projectile')
  logger.debug(payload)

  await request({
    uri: `${config.restUri}/api/json/${config.app}/timebits`,
    method: 'POST',
    json: true,
    headers: {
      authorization: `Bearer ${token}`,
      contentType: 'application/json',
    },
    body: payload,
  }).catch(error => {
    const message = `Error tracking entry in Projectile: ${error.statusCode} – ${error.response.statusMessage}`

    logger.trace(`Projectile :: track times :: Request error: ${message}`)

    throw new Error(message)
  })

  logger.trace('Projectile :: track times :: Successfully request to Projectile')
}
