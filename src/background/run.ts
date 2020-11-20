import { monitorTabs } from './monitorTabs'
import { AppStore, create } from './store'
import { takeScreenshot, imageUpload } from './images'
import { fetchTwitterHandle, postTweet } from './api'
import { ensureActiveFeedbackTarget, ensureActiveTab, addImageDisabled } from '../selectors'

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
    const target = ensureActiveFeedbackTarget(state)
    if (target.feedbackState.isTweeting) return

    if (target.feedbackTargetType === 'tab') {
      const tab = target
      if (!tab.domain) return
      // it the handle wasn't fetched before and the tab domain exists,
      // start the fetch process
      if (tab.feedbackState.twitterHandle.status === 'NEW') {
        fetchTwitterHandle(tab.id, tab.domain, store.dispatchers)
      }
    }

    // Take a screenshot if no images currently present for the current feedback target
    if (!target.feedbackState.images.length) {
      takeScreenshot(target, browser.tabs, store.dispatchers)
    }
  })

  store.on('clickTakeScreenshot', state => {
    const target = ensureActiveFeedbackTarget(state)
    takeScreenshot(target, browser.tabs, store.dispatchers)
  })

  store.on('imageUpload', state => {
    const target = ensureActiveFeedbackTarget(state)
    const { file } = state.mostRecentAction.payload
    imageUpload(target.id, file, store.dispatchers)
  })

  store.on('clickPost', state => {
    postTweet(ensureActiveTab(state), chrome, store.dispatchers)
  })

  monitorTabs(store.dispatchers, chrome)
}
