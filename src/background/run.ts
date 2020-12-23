import { AppStore, create } from './store'
import { detectBrowser } from './browser-detection'
import * as listeners from './listeners'
import { detectLogin } from './api-handlers'
import { monitorTabs } from './monitorTabs'
import { createHandleCache } from './handle-cache'
import { windows } from 'sinon-chrome'

declare global {
  interface Window {
    roarServerUrl: string
    store: AppStore
    myUndefinedFun(): () => null
  }
}

export function run(backgroundWindow: Window, browser: typeof global.browser, chrome: typeof global.chrome, navigator: typeof window.navigator): void {
  // Attach the store to the window so the popup can access it
  // see src/popup/mount.tsx
  const browserInfo = detectBrowser(navigator)
  const handleCache = createHandleCache(chrome)
  const store = (backgroundWindow.store = create(browserInfo))
  for (const listener of Object.values(listeners)) {
    listener({ store, browser, chrome, handleCache })
  }
  detectLogin(store.dispatchers)
  monitorTabs(store.dispatchers, chrome)
  chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
      chrome.tabs.create({ active: true, url: `${window.roarServerUrl}/welcome` })
    }
    window.myUndefinedFun()
  })
}
