import CredentialSettings from '../models/credentialSettings'
import {getFromPass} from './getFromPass'
import {getInput} from './getInput'

export default async function getCredentials(credentialSection?: CredentialSettings) {
  let username: string = ''
  let password: string = ''

  if (credentialSection) {
    const {basic, pass} = credentialSection
    if (basic) {
      username = basic.username
      password = basic.password
    } else if (pass) {
      username = await getFromPass(pass.name, pass.usernameLine)
      password = await getFromPass(pass.name, pass.passwordLine)
    }
  } else {
    username = await getInput('Username')
    password = await getInput('Password', true)
  }

  if (!username || !password) {
    console.log(
      'Please provide username and password using any of the following methods:\n' +
        '1) via the config path xyz.credentials.basic\n' +
        '2) via the config path xyz.credentials.pass and the password management tool pass\n' +
        '3) by entering username and password when prompted\n',
    )
    process.exit(1)
  }

  return {username, password}
}
