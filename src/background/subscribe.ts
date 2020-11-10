import { AppStore } from './store'
import { takeScreenshot } from './screenshot'
import { fetchTwitterHandle, postTweet } from './api'
import { ensureActiveTab } from '../selectors'

export function subscribe(store: AppStore, chrome: typeof global.chrome, browser: typeof global.browser): Function {
  let previousState: AppState = store.getState() // tslint:disable-line:no-let

  return store.subscribe(() => {
    const nextState: AppState = store.getState()
    const prevState = previousState
    previousState = nextState

    // Dispatch actions when the extension was clicked
    if (nextState.popupConnected && !prevState.popupConnected) {
      const tab = ensureActiveTab(nextState)

      if (!tab.isTweeting) {
        // Take a screenshot if no screenshots currently present for the active tab
        if (!tab.feedbackState.screenshots.length) {
          takeScreenshot(tab, browser.tabs, store.dispatchers)
        }

        // it the handle wasn't fetched before and the tab URL is valid,
        // start the fetch process
        if (tab.host && tab.feedbackState.hostTwitterHandle.status === 'NEW') {
          fetchTwitterHandle(tab.id, tab.host, store.dispatchers)
        }
      }
    }

    // Take a screenshot on request
    if (nextState.mostRecentAction.type === 'clickTakeScreenshot') {
      if (!nextState.popupConnected) throw new Error('Popup should be connected')
      takeScreenshot(ensureActiveTab(nextState), browser.tabs, store.dispatchers)
    }

    // The user clicked on the "post" button
    // send tweet to the server
    if (nextState.mostRecentAction.type === 'clickPost') {
      const tab = ensureActiveTab(nextState)
      postTweet(tab, chrome, store.dispatchers)
    }
  })
}
