import * as request from 'request-promise-native'

import {Day, Entry} from '../parser'

import {Config} from '../models/config'
import {Credentials} from '../models/credentials'
import {inspect} from 'util'

export async function exportProjectile(config: Config, week: Array<Day>): Promise<void> {
  if (!config.projectile) {
    console.log('Projectile API configuration missing!')
    process.exit(1)
  }

  const uri = `${config.projectile.api.host}:${config.projectile.api.port}`

  const token = await login(uri, config.projectile.credentials)

  for (const day of week) {
    for (const entry of day.entries) {
      await saveEntry(uri, token, entry)
    }
  }
}

async function login(uri: string, credentials: Credentials) {
  const result = await request({
    uri: `${uri}/api/v1/login`,
    method: 'POST',
    json: true,
    body: credentials,
    headers: {
      cacheControl: 'no-cache',
      contentType: 'application/x-www-form-urlencoded',
    },
  })

  if (!result || result.status !== 'ok') {
    throw new Error(`Login unsuccessful: ${inspect(result)}`)
  }

  return result.token
}

async function saveEntry(uri: string, token: string, entry: Entry) {
  const projectileEntry = {
    date: entry.start.toISOString().substr(0, 10),
    duration: entry.duration,
    activity: entry.package,
    note: entry.summary,
  }

  try {
    await request({
      uri: `${uri}/api/v1/book`,
      method: 'POST',
      json: true,
      body: projectileEntry,
      headers: {
        Authorization: `Bearer ${token}`,
        cacheControl: 'no-cache',
        contentType: 'application/json',
      },
    })
  } catch (err) {
    console.log(err)
  }
}
