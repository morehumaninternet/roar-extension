import { Store } from 'redux'
import { actions } from './actions'
import { checkActiveTab } from './tab'
import { takeScreenshot } from './screenshot'
import { postTweet } from './api'

export function subscribe(store: Store<AppState, Action>, browser: typeof window.browser, tabs: typeof browser.tabs): Function {
  const dispatchBackgroundActions: DispatchBackgroundActions = actions(store.dispatch)

  let previousState: AppState = store.getState() // tslint:disable-line:no-let

  return store.subscribe(() => {
    const nextState: AppState = store.getState()
    const prevState = previousState
    previousState = nextState

    // Check the active tab if the user just connected
    if (nextState.popup.connected && !prevState.popup.connected) {
      checkActiveTab(tabs, dispatchBackgroundActions)
    }

    // Take a screenshot if no screenshots currently present for the active tab
    if (nextState.lastAction && nextState.lastAction.type === 'ACTIVE_TAB_DETECTED') {
      if (!nextState.popup.connected) throw new Error('Popup should be connected')
      const activeTabId = nextState.popup.activeTab!.id!
      const activeTabFeedback = nextState.feedbackByTabId[activeTabId] || { screenshots: [] }

      if (!activeTabFeedback.screenshots.length) {
        takeScreenshot((nextState.popup as ConnectedPopupState).activeTab!, tabs, dispatchBackgroundActions)
      }
    }

    if (nextState.toBeTweeted && !prevState.toBeTweeted) {
      // The user clicked on the "post" button
      // send tweet to the server
      postTweet(nextState.toBeTweeted, dispatchBackgroundActions)
    }
  })
}
