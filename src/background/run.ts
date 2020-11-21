import { AppStore, create } from './store'
import { detectBrowser } from './browser-detection'
import * as listeners from './listeners'
import { detectLogin } from './api'
import { monitorTabs } from './monitorTabs'

declare global {
  interface Window {
    roarServerUrl: string
    store: AppStore
  }
}

export function run(backgroundWindow: Window, browser: typeof global.browser, chrome: typeof global.chrome, navigator: typeof window.navigator): void {
  // Attach the store to the window so the popup can access it
  // see src/popup/mount.tsx
  const store = (backgroundWindow.store = create(detectBrowser(navigator)))
  for (const listener of Object.values(listeners)) {
    listener(store, browser, chrome)
  }
  detectLogin(store.dispatchers)
  monitorTabs(store.dispatchers, chrome)
}
