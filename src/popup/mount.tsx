import { Store } from 'redux'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App } from './app'
import { actions } from './actions'

function render(dispatchUserActions: DispatchUserActions, state: AppState, appContainer: HTMLElement) {
  return ReactDOM.render(<App state={state} dispatchUserActions={dispatchUserActions} />, appContainer)
}

export function mount(chrome: any, window: Window) {
  const appContainer = window.document.getElementById('app-container')!

  let dispatchUserActions: DispatchUserActions
  let unsubscribe: () => void

  chrome.runtime.getBackgroundPage(function(background: any) {
    Object.assign(window, { background })
    const store: Store<AppState> = background.store
    dispatchUserActions = actions(store.dispatch, store.getState)

    const onStateChange = () => render(dispatchUserActions, store.getState(), appContainer)

    onStateChange()
    unsubscribe = store.subscribe(onStateChange)

    dispatchUserActions.popupConnect()
  })

  window.addEventListener('unload', () => {
    if (unsubscribe) {
      unsubscribe()
      dispatchUserActions.popupDisconnect()
    }
  })
}
