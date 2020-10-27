import * as redux from 'redux'
import { omit } from 'lodash'

const emptyState: AppState = {
  popup: {
    connected: false
  },
  feedbackByTabId: {},
  twitterAuthState: { state: 'not_authed' },
  alert: null,
  lastAction: null
}

function reducerNoLastAction(initialState: AppState = emptyState, action: Action): AppState {
  switch (action.type) {
    case 'POPUP_CONNECT': {
      return {
        ...initialState,
        popup: {
          connected: true,
          activeTab: null
        }
      }
    }
    case 'POPUP_DISCONNECT': {
      return {
        ...initialState,
        popup: { connected: false },
        alert: null // closing the popup dismisses any alert
      }
    }
    case 'SIGN_IN_WITH_TWITTER': {
      return {
        ...initialState,
        twitterAuthState: { state: 'authenticating' }
      }
    }
    case 'DISMISS_ALERT': {
      return {
        ...initialState,
        alert: null
      }
    }
    // Background Actions
    case 'ACTIVE_TAB_DETECTED': {
      if (!initialState.popup.connected) return initialState
      return {
        ...initialState,
        popup: {
          connected: true,
          activeTab: action.payload.activeTab,
          disabledForTab: action.payload.disabledForTab
        }
      }
    }
    case 'NO_ACTIVE_TAB_DETECTED': {
      return {
        ...initialState,
        alert: 'Could not connect with the active tab. Please retry.'
      }
    }
    case 'SCREENSHOT_CAPTURE_SUCCESS': {
      const { screenshot } = action.payload
      const tabId = screenshot.tab.id!
      const feedback = initialState.feedbackByTabId[tabId] || {
        screenshots: [],
        tweetTextBody: ''
      }
      const nextFeedback = {
        screenshots: feedback.screenshots.concat([screenshot]),
        tweetTextBody: feedback.tweetTextBody
      }
      return {
        ...initialState,
        feedbackByTabId: {
          ...initialState.feedbackByTabId,
          [tabId]: nextFeedback
        }
      }
    }
    case 'SCREENSHOT_CAPTURE_FAILURE': {
      return {
        ...initialState,
        alert: 'SCREENSHOT FAILURE'
      }
    }
    case 'TAB_CLOSED': {
      const { tabId } = action.payload
      return {
        ...initialState,
        feedbackByTabId: omit(initialState.feedbackByTabId, tabId)
      }
    }
    default: {
      const faultyAction: any = action
      if (!/^@@redux/.test(faultyAction.type)) {
        return {
          ...initialState,
          alert: `Unknown action type ${faultyAction.type}`
        }
      }
      return initialState
    }
  }
}

function reducer(initialState: AppState = emptyState, action: Action): AppState {
  return {
    ...reducerNoLastAction(initialState, action),
    lastAction: action
  }
}

export function createStore(): redux.Store<AppState, Action> {
  return redux.createStore(reducer)
}
