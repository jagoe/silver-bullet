import * as request from 'request-promise-native'
import getCredentials from '../lib/getCredentials'
import Config from '../models/config'
import {Day, Entry} from '../parser'

export async function exportProjectile(config: Config, week: Array<Day>) {
  if (!config.projectile) {
    console.log('Projectile API configuration missing!')
    process.exit(1)
  }

  const uri = `${config.projectile!.api.host}:${config.projectile!.api.port}`
  const credentials = await getCredentials(config.projectile && config.projectile.credentials)

  const token = await login(uri, credentials)

  for (const day of week) {
    for (const entry of day.entries) {
      await saveEntry(uri, token, entry)
    }
  }
}

async function login(uri: string, credentials: any) {
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
    throw new Error(`Login unsuccessful: ${result}`)
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
