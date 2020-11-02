import * as redux from 'redux'
import { responders } from './responders'

const emptyState: AppState = {
  popup: { connected: false },
  feedbackByTabId: {},
  toBeTweeted: null,
  justTweeted: null,
  twitterAuth: 'not_authed',
  alert: null,
  mostRecentAction: { type: 'INITIALIZING' }
}

function reducer(state: AppState = emptyState, action: Action): AppState {
  // Redux initially sends a @@redux/INIT action
  if (action.type.startsWith('@@redux/INIT')) return state

  const responder: Responder<typeof action.type> = responders[action.type]
  const stateUpdates: Partial<AppState> = responder(state, action)
  return {
    ...state,
    ...stateUpdates,
    mostRecentAction: action
  }
}

export function createStore(): redux.Store<AppState, Action> {
  return redux.createStore(reducer)
}
