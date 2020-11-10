import { monitorTabs } from './monitorTabs'
import { AppStore, createStore } from './store'
import { subscribe } from './subscribe'

declare global {
  interface Window {
    roarServerUrl: string
    store: AppStore
  }
}

export function run(backgroundWindow: Window, browser: typeof global.browser, chrome: typeof global.chrome): void {
  // Attach the store to the window so the popup can access it
  // see src/popup/mount.tsx
  const store = (backgroundWindow.store = createStore())
  subscribe(store, chrome, browser)
  monitorTabs(store.dispatchers, chrome)
}
