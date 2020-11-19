import { Store, createStore } from 'redux'
import { emptyExtensionFeedbackState } from './feedback-state'
import { responders } from './responders'

export type AppStore = Store<AppState, Action> & {
  dispatchers: Dispatchers<Action>
  on<T extends Action['type']>(type: T, callback: (nextState: AppState & { mostRecentAction: Action & { type: T } }) => void): () => void
}

export const emptyState = (): AppState => ({
  focusedWindowId: -1,
  tabs: new Map(),
  auth: { state: 'not_authed' },
  pickingEmoji: false,
  helpClicked: false,
  extensionFeedback: emptyExtensionFeedbackState(),
  alert: null,
  mostRecentAction: { type: 'INITIALIZING' },
})

function reducer(state: AppState = emptyState(), action: Action): AppState {
  // Redux initially sends a @@redux/INIT action
  if (action.type.startsWith('@@redux/INIT')) return state

  const responder = responders[action.type]
  const stateUpdates: Partial<AppState> = responder(state, (action as any).payload as any)

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

export function create(): AppStore {
  const store: AppStore = createStore(reducer)

  // Create dispatchers for each action type, one for each key in responders
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

  // Create a simple function that subscribes to events of a given type,
  // calling a callback if there was one. Note that this callback is called
  // after the next state has been calculated
  store.on = (type, cb) => {
    return store.subscribe(() => {
      const nextState = store.getState()
      if (nextState.mostRecentAction.type === type) {
        cb(nextState as any)
      }
    })
  }

  return store
}
