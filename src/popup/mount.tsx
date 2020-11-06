import { Store } from 'redux'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App } from './app'
import { actions } from './actions'

function render(dispatchUserActions: DispatchUserActions, state: AppState, appContainer: HTMLElement) {
  return ReactDOM.render(<App state={state} dispatchUserActions={dispatchUserActions} />, appContainer)
}

export function mount(chrome: typeof global.chrome, popupWindow: Window) {
  const appContainer = popupWindow.document.getElementById('app-container')!

  let dispatchUserActions: DispatchUserActions
  let unsubscribe: () => void

  chrome.runtime.getBackgroundPage(function (backgroundWindow: Window) {
    Object.assign(popupWindow, { backgroundWindow })
    const store: Store<AppState> = backgroundWindow.store
    dispatchUserActions = actions(store.dispatch, store.getState)

    const onStateChange = () => render(dispatchUserActions, store.getState(), appContainer)

    onStateChange()
    unsubscribe = store.subscribe(onStateChange)

    dispatchUserActions.popupConnect()
  })

  popupWindow.addEventListener('unload', () => {
    if (unsubscribe) {
      unsubscribe()
      dispatchUserActions.popupDisconnect()
    }
  })
}
