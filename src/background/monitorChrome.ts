import { dispatch } from './store'

export function monitorChrome(): void {
  chrome.windows.getAll(windows => dispatch('chrome.windows.getAll', { windows }))
  chrome.tabs.query({}, tabs => dispatch('chrome.tabs.query', { tabs }))

  chrome.tabs.onCreated.addListener(tab => dispatch('chrome.tabs.onCreated', { tab }))
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => dispatch('chrome.tabs.onRemoved', { tabId, removeInfo }))
  // Tabs trigger onUpdate events constantly. We want to listen only when the URL changes.
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => changeInfo.url && dispatch('chrome.tabs.onUpdated', { tabId, changeInfo }))
  chrome.tabs.onAttached.addListener((tabId, attachInfo) => dispatch('chrome.tabs.onAttached', { tabId, attachInfo }))
  chrome.tabs.onActivated.addListener(activeInfo => dispatch('chrome.tabs.onActivated', { activeInfo }))
  chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => dispatch('chrome.tabs.onReplaced', { addedTabId, removedTabId }))

  chrome.windows.onCreated.addListener(win => dispatch('chrome.windows.onCreated', { win }))
  chrome.windows.onRemoved.addListener(windowId => dispatch('chrome.windows.onRemoved', { windowId }))
  chrome.windows.onFocusChanged.addListener(windowId => windowId !== -1 && dispatch('chrome.windows.onFocusChanged', { windowId }))

  chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
      dispatch('onInstall')
    }
  })

  chrome.webNavigation.onCommitted.addListener(details => {
    if (details.url === `${global.ROAR_SERVER_URL}/auth-success` && details.transitionQualifiers.includes('server_redirect')) {
      dispatch('authSuccess', { tabId: details.tabId })
    }
  })
}
