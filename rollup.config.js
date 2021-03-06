import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import replace from 'rollup-plugin-replace'

export default {
  output: {
    format: 'iife',
  },
  plugins: [
    replace({
      // Use a minified build for react for production
      'process.env.NODE_ENV': JSON.stringify(process.env.ENV === 'production' ? 'production' : 'development'),
      // Point to a ROAR_SERVER_URL that depends on the build
      'global.ROAR_SERVER_URL': JSON.stringify(process.env.ROAR_SERVER_URL),
      // Point to a ROAR_WELCOME_PAGE_URL that depends on the build
      'global.ROAR_WELCOME_PAGE_URL': JSON.stringify(process.env.ROAR_WELCOME_PAGE_URL),
      // Use the console for errors. In tests we use a stub, see src/tests/setup.js
      'global.CONSOLE_ERROR': 'console.error',
    }),
    typescript(),
    resolve(),
    commonjs(),
    json(),
  ],
}
