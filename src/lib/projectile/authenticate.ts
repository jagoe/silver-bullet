import * as request from 'request-promise-native'
import {ProjectileConfigWithCredentials} from '../../models/projectileConfig'
import {logger} from '../log'

export async function authenticate(config: ProjectileConfigWithCredentials): Promise<string> {
  logger.trace('Projectile :: authenticate :: Sending authentication request')

  const response = await request({
    uri: `${config.api.restUri}/token/${config.api.app}`,
    method: 'POST',
    json: true,
    headers: {
      contentType: 'application/json',
    },
    body: {
      username: config.credentials.username,
      password: config.credentials.password,
    },
  }).catch(error => {
    const message = `Error authenticating against Projectile: ${error.statusCode} – ${error.response.statusMessage}`

    logger.trace(`Projectile :: authenticate :: Authentication error: ${message}`)

    throw new Error(message)
  })

  logger.trace('Projectile :: authenticate :: Successful authentication')

  return response
}
