#! /usr/bin/env node
const chalk = require('chalk')
const tee = require('tee')
const stripAnsi = require('strip-ansi')
const { PassThrough } = require('stream')
const readline = require('readline')
const concurrently = require('concurrently')

// Parse build flags and environment variables
let watchMode = false
let pointToLocalServer = false
process.argv.slice(2).forEach(flag => {
  switch (flag) {
    case '--watch': return watchMode = true
    case '--local-server': return pointToLocalServer = true
    default: throw new Error(`Unrecognized flag "${flag}"`)
  }
})

const watchFlag = watchMode ? '--watch' : ''
const ENV = process.env.ENV || 'local'
const ROAR_SERVER_URL = pointToLocalServer ? 'https://localhost:5004' : 'https://roar-server.herokuapp.com'

// Colors!
const blue = chalk.hex('#164176')
const pink = chalk.hex('#fa759e')
const green = chalk.hex('#6FCF97')
const gold = chalk.hex('#FFCA00')
const lightBlue = chalk.hex('#4a81bc')
const normalText = blue
const emphasis = pink.bold

// The commands to run, give each a color so that they appear distinct in the terminal
const commands = [
  {
    name: green('scss'),
    command: `npm run scss -- ${watchFlag}`
  },
  {
    name: gold('bundle:popup'),
    command: `npm run rollup -- src/popup/index.tsx ${watchFlag} --file bundled/popup.js`,
    env: { ENV, ROAR_SERVER_URL }
  },
  {
    name: lightBlue('bundle:background'),
    command: `npm run rollup -- src/background/index.ts ${watchFlag} --file bundled/background.js`,
    env: { ENV, ROAR_SERVER_URL }
  },
]

// Create an output stream that writes to process.stdout
// and to a PassThrough stream that can be read from to determine command progress.
const passThrough = new PassThrough()
const outputStream = tee(process.stdout, passThrough)

// Log that the build is starting
console.log(
  '🛠  ' +
  normalText('Building a ') +
  emphasis(ENV) +
  normalText(' version of Roar! ') +
  (watchMode ? emphasis('in watch mode ') : '') +
  normalText('that points to ') +
  emphasis(ROAR_SERVER_URL) +
  '\n'
)

// Run the build. If any commands fail, kill the others
concurrently(commands, { outputStream, killOthers: ['failure'] })

// On a successful build, let the user know and destroy the passThrough as we no longer have any use for it
function onSuccessfulBuild() {
  const toLog = watchMode
    ? 'First build successful! Continuing to watch files...'
    : 'Build successful!'

  console.log(`\n🎉 ${emphasis(toLog)}\n`)
  passThrough.destroy()
}

// Keep track of how many commands are done and callback onSuccessfulBuild when they are all complete
let commandsDone = 0
const onCommandCompleted = () => {
  commandsDone++
  if (commandsDone === commands.length) {
    onSuccessfulBuild()
  }
}

// Read the passThrough stream line by line and call back onCommandCompleted when
// we detect that certain tasks completed successfully. In watch mode, commands
// are done when they read Compiled|created. Otherwise, they are only done with
// they exit with code 0
readline.createInterface(passThrough).on('line', line => {
  const commandCompletedRegex = watchMode
    ? /^\[.+\] Compiled|created/
    : /^\[.+\] .* exited with code 0/

  // const match = stripAnsi(line).match(/^\[(.+)\] (.*)$/)
  if (commandCompletedRegex.test(stripAnsi(line))) {
    onCommandCompleted()
  }
})
