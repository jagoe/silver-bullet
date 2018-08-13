import * as request from 'request-promise-native'
import {getFromPass} from '../lib/getFromPass'
import {getInput} from '../lib/getInput'
import Config from '../models/config'
import {Day, Entry} from '../parser'

export async function exportProjectile(config: Config, week: Array<Day>) {
  const token = await login(config)

  for (const day of week) {
    for (const entry of day.entries) {
      await saveEntry(token, entry)
    }
  }
}

async function login(config: Config) {
  // credentials
  let username: string = ''
  let password: string = ''

  if (config.projectileCredentials) {
    const {basic, pass} = config.projectileCredentials
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
      '1) via the config path projectileCredentials.basic' +
      '2) via the config path projectileCredentials.pass and the password management tool pass' +
      '3) via environment variables PROJECTILE_USERNAME & PROJECTILE_PASSWORD' +
      '4) by entering username and password when prompted',
    )
    process.exit(1)
  }

  const result = await request({
    uri: 'http://localhost:3000/api/v1/login',
    method: 'POST',
    json: true,
    body: {
      username,
      password,
    },
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

async function saveEntry(token: string, entry: Entry) {
  const projectileEntry = {
    date: entry.start.toISOString().substr(0, 10),
    duration: entry.duration,
    activity: entry.package,
    note: entry.comment,
  }

  try {
    await request({
      uri: 'http://localhost:3000/api/v1/book',
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
