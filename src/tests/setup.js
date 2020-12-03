require('ts-node').register({ compilerOptions: { module: 'commonjs' } })
require('chai').use(require('sinon-chai'))
global.atob = require('atob')
global.btoa = require('btoa')

process.on('unhandledRejection', error => {
  console.error(error)
  process.exit(1)
})