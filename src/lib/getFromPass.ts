import {exec as execCb} from 'child_process'
import {promisify} from 'util'

const exec = promisify(execCb)

const _cache: Record<string, string> = {}

export async function getFromPass(name: string, line: number): Promise<string> {
  const cacheKey = `${name}_${line}`
  if (_cache[cacheKey]) {
    return _cache[cacheKey]
  }

  const result = await tryGetFromPass(name, line)
  _cache[cacheKey] = result

  return result
}

async function tryGetFromPass(name: string, line: number): Promise<string> {
  let output: string = ''
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
