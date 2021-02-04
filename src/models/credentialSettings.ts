import {Credentials} from './credentials'

export default interface CredentialSettings {
  basic?: Credentials
  pass?: {
    name: string
    usernameLine: number
    passwordLine: number
  }
}
