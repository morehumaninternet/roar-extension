import { Store } from 'redux'
import { actions } from './actions'
import { takeScreenshot } from './screenshot'
import { postTweet } from './api'
import { activeTab } from '../selectors'

export function subscribe(store: Store<AppState, Action>, browser: typeof window.browser, tabs: typeof browser.tabs): Function {
  const dispatchBackgroundActions: DispatchBackgroundActions = actions(store.dispatch)

  let previousState: AppState = store.getState() // tslint:disable-line:no-let

  return store.subscribe(() => {
    const nextState: AppState = store.getState()
    const prevState = previousState
    previousState = nextState

    // Take a screenshot if no screenshots currently present for the active tab
    if (nextState.popupConnected && !prevState.popupConnected) {
      const tab = activeTab(nextState)

      if (!tab.feedbackState.screenshots.length) {
        takeScreenshot(tab, tabs, dispatchBackgroundActions)
      }
    }

    // Take a screenshot on request
    if (nextState.mostRecentAction.type === 'CLICK_TAKE_SCREENSHOT') {
      if (!nextState.popupConnected) throw new Error('Popup should be connected')
      takeScreenshot(activeTab(nextState), tabs, dispatchBackgroundActions)
    }

    if (nextState.toBeTweeted && !prevState.toBeTweeted) {
      // The user clicked on the "post" button
      // send tweet to the server
      postTweet(nextState.toBeTweeted, dispatchBackgroundActions)
    }
  })
}
