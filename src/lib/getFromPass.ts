import {exec as execCb} from 'child_process'
import {promisify} from 'util'

const exec = promisify(execCb)

export async function getFromPass(name: string, line: number) {
  const result = await exec(`pass ${name} | sed -n ${line}p`)

  return result.stdout.trim()
}
