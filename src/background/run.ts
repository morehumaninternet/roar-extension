import { Store } from 'redux'
import { monitorTabs } from './monitorTabs'
import { createStore } from './store'
import { subscribe } from './subscribe'

declare global {
  interface Window {
    roarServerUrl: string
    store: Store<AppState, Action>
  }
}

export function run(backgroundWindow: Window, browser: typeof global.browser, chrome: typeof global.chrome): void {
  // Attach the store to the window so the popup can access it
  // see src/popup/mount.tsx
  const store = (backgroundWindow.store = createStore())
  subscribe(store, browser, browser.tabs)
  monitorTabs(store, chrome)
}
