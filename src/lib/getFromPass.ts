import {exec as execCb} from 'child_process'
import {promisify} from 'util'

const exec = promisify(execCb)

export async function getFromPass(name: string, line: number): Promise<string> {
  return await tryGetFromPass(name, line)
}

async function tryGetFromPass(name: string, line: number): Promise<string> {
  let output: string = ''
  let result: {stdout: string; stderr: string} | null = null
  const tries = 10

  while (!output && tries > 0) {
    result = await exec(`pass ${name} | sed -n ${line}p`)
    output = result.stdout.trim()
  }

  if (!output) {
    throw new Error(result?.stderr ?? '')
  }

  return output
}
