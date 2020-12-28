require('ts-node').register({ compilerOptions: { module: 'commonjs' } })
require('chai').use(require('sinon-chai'))
global.ROAR_SERVER_URL = 'https://test-roar-server.com'
global.atob = require('atob')
global.btoa = require('btoa')

process.on('unhandledRejection', error => {
  console.error(error)
  process.exit(1)
})