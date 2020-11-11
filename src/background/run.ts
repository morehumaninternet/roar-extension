import { monitorTabs } from './monitorTabs'
import { AppStore, create } from './store'
import { takeScreenshot } from './screenshot'
import { fetchTwitterHandle, postTweet } from './api'
import { ensureActiveTab } from '../selectors'

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

  store.on('popupConnect', state => {
    const tab = ensureActiveTab(state)
    if (tab.isTweeting || !tab.host) return

    // Take a screenshot if no screenshots currently present for the active tab
    if (!tab.feedbackState.screenshots.length) {
      takeScreenshot(tab, browser.tabs, store.dispatchers)
    }

    // it the handle wasn't fetched before and the tab URL is valid,
    // start the fetch process
    if (tab.feedbackState.hostTwitterHandle.status === 'NEW') {
      fetchTwitterHandle(tab.id, tab.host, store.dispatchers)
    }
  })

  store.on('clickTakeScreenshot', state => {
    takeScreenshot(ensureActiveTab(state), browser.tabs, store.dispatchers)
  })

  store.on('clickPost', state => {
    postTweet(ensureActiveTab(state), chrome, store.dispatchers)
  })

  monitorTabs(store.dispatchers, chrome)
}
