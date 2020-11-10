import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AppStore } from '../background/store'
import { App } from './app'

function render(dispatchUserActions: Dispatchers<UserAction>, state: AppState, appContainer: HTMLElement) {
  return ReactDOM.render(<App state={state} dispatchUserActions={dispatchUserActions} />, appContainer)
}

export function mount(chrome: typeof global.chrome, popupWindow: Window) {
  const appContainer = popupWindow.document.getElementById('app-container')!

  let dispatchUserActions: Dispatchers<UserAction>
  let unsubscribe: () => void

  chrome.runtime.getBackgroundPage(function (backgroundWindow: Window) {
    Object.assign(popupWindow, { backgroundWindow })
    const store: AppStore = backgroundWindow.store
    dispatchUserActions = store.dispatchers

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
