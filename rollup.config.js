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
      'ROAR_SERVER_URL': JSON.stringify(process.env.ROAR_SERVER_URL),
    }),
    typescript(),
    resolve(),
    commonjs(),
    json(),
  ],
}
