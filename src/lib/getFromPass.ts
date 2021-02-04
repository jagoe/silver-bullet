import {exec as execCb} from 'child_process'
import {promisify} from 'util'

const exec = promisify(execCb)

export async function getFromPass(name: string, line: number): Promise<string> {
  return tryGetFromPass(name, line)
}

async function tryGetFromPass(name: string, line: number): Promise<string> {
  let output = ''
  let result: {stdout: string; stderr: string} | null = null

  for (let tries = 0; !output && tries < 30; tries++) {
    result = await exec(`pass ${name} | sed -n ${line}p`)
    output = result.stdout.trim()
  }

  if (!output) {
    throw new Error(result?.stderr ?? '')
  }

  return output
}
