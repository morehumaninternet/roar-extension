import browser from 'webextension-polyfill/dist/browser-polyfill.min.js'
import { Store } from 'redux'
import { createStore } from './store'
import { subscribe } from './subscribe'

declare global {
  interface Window {
    roarServerUrl: string
    store: Store<AppState, Action>
  }
}
// Attach the store to the window so the popup can access it
const store = (window.store = createStore())

subscribe(store, browser, browser.tabs)

chrome.tabs.onRemoved.addListener(tabId => store.dispatch({ type: 'TAB_CLOSED', payload: { tabId } }))
