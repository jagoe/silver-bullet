export async function getInput(prompt: string, mask = false): Promise<string> {
  return new Promise<string>(resolve => {
    const BACKSPACE = String.fromCharCode(127)
    process.stdout.write(`${prompt}: `)
    process.stdin.resume()
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')

    let input = ''

    const inputListener = (ch: string | Uint8Array) => {
      ch = ch.toString()
      switch (ch + '') {
        case '\n':
        case '\r':
        case '\u0004':
          // They've finished typing their password
          process.stdout.write('\n')
          process.stdin.setRawMode(false)
          process.stdin.pause()
          process.stdin.removeListener('data', inputListener)
          return resolve(input)
        case BACKSPACE:
          // Backspace
          input = input.slice(0, -1)
          process.stdout.clearLine(0)
          process.stdout.cursorTo(0)
          process.stdout.write(`${prompt}: `)
          process.stdout.write(
            input
              .split('')
              .map(() => (mask ? '*' : ch))
              .join(''),
          )
          break
        case '\u0003':
          // Ctrl-C
          process.exit(130)
          break
        default:
          // More passsword characters
          process.stdout.write(ch)
          input += ch
          break
      }
    }
    process.stdin.on('data', inputListener)
  })
}
