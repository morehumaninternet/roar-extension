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

chrome.windows.getAll(windows => store.dispatch({ type: 'chrome.windows.getAll', payload: { windows } }))
chrome.tabs.query({}, tabs => store.dispatch({ type: 'chrome.tabs.query', payload: { tabs } }))
chrome.tabs.onCreated.addListener(tab => store.dispatch({ type: 'chrome.tabs.onCreated', payload: { tab } }))
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => store.dispatch({ type: 'chrome.tabs.onRemoved', payload: { tabId, removeInfo } }))
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => store.dispatch({ type: 'chrome.tabs.onUpdated', payload: { tabId, changeInfo } }))
chrome.tabs.onAttached.addListener((tabId, attachInfo) => store.dispatch({ type: 'chrome.tabs.onAttached', payload: { tabId, attachInfo } }))
chrome.tabs.onActivated.addListener(activeInfo => store.dispatch({ type: 'chrome.tabs.onActivated', payload: { activeInfo } }))
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => store.dispatch({ type: 'chrome.tabs.onReplaced', payload: { addedTabId, removedTabId } }))
chrome.windows.onCreated.addListener(win => store.dispatch({ type: 'chrome.windows.onCreated', payload: { win } }))
chrome.windows.onRemoved.addListener(windowId => store.dispatch({ type: 'chrome.windows.onRemoved', payload: { windowId } }))
chrome.windows.onFocusChanged.addListener(windowId => store.dispatch({ type: 'chrome.windows.onFocusChanged', payload: { windowId } }))
