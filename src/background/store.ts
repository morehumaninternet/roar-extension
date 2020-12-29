import { Store, createStore } from 'redux'
import { newStoreState } from './state'
import { responders } from './responders'
import * as reduxUtils from '../redux-utils'

export type AppStore = Store<StoreState, Action> & {
  dispatchers: Dispatchers<Action>
  on<T extends Action['type']>(type: T, callback: (nextState: StoreState & { mostRecentAction: Action & { type: T } }) => void): () => void
  whenState(predicate: (state: StoreState) => boolean, timeoutMillis?: number): Promise<StoreState>
}

function reducer(state: StoreState, action: Action): StoreState {
  // Redux initially sends a @@redux/INIT action
  if (action.type.startsWith('@@redux/INIT')) return state

  const responder = responders[action.type]
  const stateUpdates: Partial<StoreState> = responder(state, (action as any).payload as any)

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

// Save a reference to a singleton store.
// The actual extension will only ever have one, but these will be created anew during integration tests.
let store: AppStore

export function create(): AppStore {
  store = createStore(reducer, newStoreState())

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

  store.whenState = (callback, timeoutMillis) => reduxUtils.whenState(store, callback, timeoutMillis)

  return store
}

export function getStore(): AppStore {
  return store
}

// dispatch has two type signatures, one for actions with payloads one for actions without
export function dispatch<A extends Action, T extends A['type']>(type: T, payload: A extends { type: T; payload: any } ? A['payload'] : never): void
export function dispatch<A extends Action, T extends A['type']>(type: A extends { type: T; payload: any } ? never : T, payload?: undefined): void

export function dispatch(type, payload): void {
  store.dispatchers[type](payload)
}

export function whenState(predicate: (state: StoreState) => boolean, timeoutMillis?: number): Promise<StoreState> {
  return store.whenState(predicate, timeoutMillis)
}
