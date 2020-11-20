import { AppStore, create } from './store'
import * as listeners from './listeners'
import { monitorTabs } from './monitorTabs'

declare global {
  interface Window {
    roarServerUrl: string
    store: AppStore
  }
}

export function run(backgroundWindow: Window, browser: typeof global.browser, chrome: typeof global.chrome): void {
  // Attach the store to the window so the popup can access it
  // see src/popup/mount.tsx
  const store = (backgroundWindow.store = create())
  for (const listener of Object.values(listeners)) {
    listener(store, browser, chrome)
  }
  monitorTabs(store.dispatchers, chrome)
}
