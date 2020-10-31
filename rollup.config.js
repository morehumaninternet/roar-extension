import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import replace from 'rollup-plugin-replace'

export default {
	output: {
		format: 'iife',
		sourcemap: true
	},
	plugins: [
    replace({ 'process.env.NODE_ENV': JSON.stringify( 'production' ) }),
		typescript(),
		resolve(),
    commonjs(),
    json()
	]
}
