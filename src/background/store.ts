import * as redux from 'redux'
import { responders } from './responders'

export type AppStore = redux.Store<AppState, Action> & {
  dispatchers: Dispatch<Action>
}

const emptyState: AppState = {
  popupConnected: false,
  focusedWindowId: -1,
  tabs: new Map(),
  auth: { state: 'not_authed' },
  pickingEmoji: false,
  alert: null,
  mostRecentAction: { type: 'INITIALIZING' },
}

function reducer(state: AppState = emptyState, action: Action): AppState {
  // Redux initially sends a @@redux/INIT action
  if (action.type.startsWith('@@redux/INIT')) return state

  const responder: Responder<typeof action.type> = responders[action.type]
  const stateUpdates: Partial<AppState> = responder(state, action)
  const nextState = {
    ...state,
    ...stateUpdates,
    mostRecentAction: action,
  }

  // We are using rollup to replace process.env.NODE_ENV before TypeScript
  // runs, so it fail to compile - "This condition will always return 'true'"
  // @ts-ignore
  if (process.env.NODE_ENV === 'development') {
    console.log(action.type, (action as any).payload, nextState)
  }

  return nextState
}

export function createStore(): AppStore {
  const store: AppStore = redux.createStore(reducer)

  store.dispatchers = Object.keys(responders).reduce(
    (dis, type) => ({
      ...dis,
      [type]: (payload?: any) => {
        if (payload) {
          return store.dispatch({ type, payload } as any)
        }
        return store.dispatch({ type } as any)
      },
    }),
    {} as any
  )

  return store
}
