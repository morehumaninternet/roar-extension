export function monitorTabs(dispatch: Dispatchers<BackgroundAction>, chrome: typeof global.chrome): void {
  chrome.windows.getAll(windows => dispatch['chrome.windows.getAll']({ windows }))
  chrome.tabs.query({}, tabs => dispatch['chrome.tabs.query']({ tabs }))
  chrome.tabs.onCreated.addListener(tab => dispatch['chrome.tabs.onCreated']({ tab }))
  chrome.tabs.onRemoved.addListener((tabId, removeInfo) => dispatch['chrome.tabs.onRemoved']({ tabId, removeInfo }))
  chrome.tabs.onUpdated.addListener((tabId, changeInfo) => changeInfo.url && dispatch['chrome.tabs.onUpdated']({ tabId, changeInfo }))
  chrome.tabs.onAttached.addListener((tabId, attachInfo) => dispatch['chrome.tabs.onAttached']({ tabId, attachInfo }))
  chrome.tabs.onActivated.addListener(activeInfo => dispatch['chrome.tabs.onActivated']({ activeInfo }))
  chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => dispatch['chrome.tabs.onReplaced']({ addedTabId, removedTabId }))
  chrome.windows.onCreated.addListener(win => dispatch['chrome.windows.onCreated']({ win }))
  chrome.windows.onRemoved.addListener(windowId => dispatch['chrome.windows.onRemoved']({ windowId }))
  chrome.windows.onFocusChanged.addListener(windowId => dispatch['chrome.windows.onFocusChanged']({ windowId }))
}
