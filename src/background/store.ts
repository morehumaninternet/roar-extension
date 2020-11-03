import * as redux from 'redux'
import { responders } from './responders'

const emptyState: AppState = {
  popupConnected: false,
  focusedWindowId: -1,
  tabs: new Map(),
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
  const nextState = {
    ...state,
    ...stateUpdates,
    mostRecentAction: action
  }

  if (action.type.startsWith('chrome')) {
    console.log(action.type, (action as any).payload, nextState.focusedWindowId, nextState.tabs)
  }

  return nextState
}

export function createStore(): redux.Store<AppState, Action> {
  return redux.createStore(reducer)
}
