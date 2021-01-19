export default interface CredentialSettings {
  basic?: {
    username: string
    password: string,
  }
  pass?: {
    name: string
    usernameLine: number
    passwordLine: number,
  }
}
