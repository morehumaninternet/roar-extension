import { Store } from 'redux'
import { actions } from './actions'
import { takeScreenshot } from './screenshot'
import { fetchTwitterHandle, postTweet } from './api'
import { ensureActiveTab } from '../selectors'

export function subscribe(store: Store<AppState, Action>, browser: typeof window.browser, tabs: typeof browser.tabs): Function {
  const dispatchBackgroundActions: DispatchBackgroundActions = actions(store.dispatch)

  let previousState: AppState = store.getState() // tslint:disable-line:no-let

  return store.subscribe(() => {
    const nextState: AppState = store.getState()
    const prevState = previousState
    previousState = nextState

    // Dispatch actions when the extension was clicked
    if (nextState.popupConnected && !prevState.popupConnected) {
      const tab = ensureActiveTab(nextState)

      // Take a screenshot if no screenshots currently present for the active tab
      if (!tab.feedbackState.screenshots.length) {
        takeScreenshot(tab, tabs, dispatchBackgroundActions)
      }

      // it the handle wasn't fetched before and the tab URL is valid,
      // start the fetch process
      if (tab.url && tab.feedbackState.hostTwitterHandle.status === 'NEW') {
        console.log('starting the process')
        dispatchBackgroundActions.startFetchHandle()
      }

      if (tab.url && tab.feedbackState.hostTwitterHandle.status === 'IN_PROGRESS') {
        console.log('fetching the handle')
        fetchTwitterHandle(tab.url, dispatchBackgroundActions)
      }
    }

    // Take a screenshot on request
    if (nextState.mostRecentAction.type === 'CLICK_TAKE_SCREENSHOT') {
      if (!nextState.popupConnected) throw new Error('Popup should be connected')
      takeScreenshot(ensureActiveTab(nextState), tabs, dispatchBackgroundActions)
    }

    if (nextState.toBeTweeted && !prevState.toBeTweeted) {
      // The user clicked on the "post" button
      // send tweet to the server
      postTweet(nextState.toBeTweeted, dispatchBackgroundActions)
    }
  })
}
