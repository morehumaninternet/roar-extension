import browser from 'webextension-polyfill/dist/browser-polyfill.min.js'
import { run } from './run'

Object.assign(window, { browser })

run(window)
