import { Store } from 'redux'
import { actions } from './actions'
import { takeScreenshot } from './screenshot'
import { fetchTwitterHandle, postTweet } from './api'
import { ensureActiveTab } from '../selectors'

export function subscribe(store: Store<AppState, Action>, chrome: typeof global.chrome, browser: typeof global.browser): Function {
  const dispatchBackgroundActions: DispatchBackgroundActions = actions(store.dispatch)

  let previousState: AppState = store.getState() // tslint:disable-line:no-let

  return store.subscribe(() => {
    const nextState: AppState = store.getState()
    const prevState = previousState
    previousState = nextState

    // Dispatch actions when the extension was clicked
    if (nextState.popupConnected && !prevState.popupConnected && !nextState.tweeting) {
      const tab = ensureActiveTab(nextState)

      // Take a screenshot if no screenshots currently present for the active tab
      if (!tab.feedbackState.screenshots.length) {
        takeScreenshot(tab, browser.tabs, dispatchBackgroundActions)
      }

      // it the handle wasn't fetched before and the tab URL is valid,
      // start the fetch process
      if (tab.host && tab.feedbackState.hostTwitterHandle.status === 'NEW') {
        fetchTwitterHandle(tab.id, tab.host, dispatchBackgroundActions)
      }
    }

    // Take a screenshot on request
    if (nextState.mostRecentAction.type === 'CLICK_TAKE_SCREENSHOT') {
      if (!nextState.popupConnected) throw new Error('Popup should be connected')
      takeScreenshot(ensureActiveTab(nextState), browser.tabs, dispatchBackgroundActions)
    }

    // The user clicked on the "post" button
    // send tweet to the server
    if (nextState.tweeting?.state === 'NEW') {
      postTweet(nextState.tweeting.tab, chrome, dispatchBackgroundActions)
    }
  })
}
