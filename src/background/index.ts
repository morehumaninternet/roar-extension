import browser from 'webextension-polyfill/dist/browser-polyfill.min.js'
import { run } from './run'

run(window, browser, chrome)
