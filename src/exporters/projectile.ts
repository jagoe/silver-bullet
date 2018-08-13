import * as request from 'request-promise-native'
import {getFromPass} from '../lib/getFromPass'
import {getInput} from '../lib/getInput'
import Config from '../models/config'
import {Day, Entry} from '../parser'

export async function exportProjectile(config: Config, week: Array<Day>) {
  if (!config.projectile) {
    console.log('Projectile API configuration missing!')
    process.exit(1)
  }

  const uri = `${config.projectile!.api.host}:${config.projectile!.api.port}`
  const credentials = await getCredentials(config)

  const token = await login(uri, credentials)

  for (const day of week) {
    for (const entry of day.entries) {
      await saveEntry(uri, token, entry)
    }
  }
}

async function getCredentials(config: Config) {
  let username: string = ''
  let password: string = ''

  if (config.projectile && config.projectile.credentials) {
    const {basic, pass} = config.projectile.credentials
    if (basic) {
      username = basic.username
      password = basic.password
    } else if (pass) {
      username = await getFromPass(pass.name, pass.usernameLine)
      password = await getFromPass(pass.name, pass.passwordLine)
    }
  } else {
    username = process.env.PROJECTILE_USERNAME
      || await getInput('Username')
    password = process.env.PROJECTILE_PASSWORD
      || await getInput('Password', true)
  }

  if (!username || !password) {
    console.log(
      'Please provide username and password using any of the following methods:\n' +
      '1) via the config path projectile.credentials.basic' +
      '2) via the config path projectile.credentials.pass and the password management tool pass' +
      '3) via environment variables PROJECTILE_USERNAME & PROJECTILE_PASSWORD' +
      '4) by entering username and password when prompted',
    )
    process.exit(1)
  }

  return {username, password}
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
    note: entry.comment,
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
