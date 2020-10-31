import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import replace from 'rollup-plugin-replace'

export default {
  output: {
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'window.roarServerUrl': JSON.stringify(process.env.ROAR_SERVER_URL),
    }),
    typescript(),
    resolve(),
    commonjs(),
    json(),
  ]
}
