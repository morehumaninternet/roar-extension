import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AppStore } from '../background/store'
import { App } from './app'

function render(popupWindow: Window, dispatchUserActions: Dispatchers<UserAction>, storeState: StoreState, appContainer: HTMLElement): any {
  return ReactDOM.render(<App popupWindow={popupWindow} storeState={storeState} dispatchUserActions={dispatchUserActions} />, appContainer)
}

export function mount(chrome: typeof global.chrome, popupWindow: Window): void {
  const appContainer = popupWindow.document.getElementById('app-container')!

  let dispatchUserActions: Dispatchers<UserAction> // tslint:disable-line:no-let
  let unsubscribe: () => void // tslint:disable-line:no-let

  chrome.runtime.getBackgroundPage((backgroundWindow: Window) => {
    Object.assign(popupWindow, { backgroundWindow })
    const store: AppStore = backgroundWindow.store
    dispatchUserActions = store.dispatchers

    const onStateChange = () => render(popupWindow, dispatchUserActions, store.getState(), appContainer)

    onStateChange()
    unsubscribe = store.subscribe(onStateChange)

    dispatchUserActions.popupConnect()

    // Only allow one popup to be open at once. When another window is focused on, close this popup
    store.on('chrome.windows.onFocusChanged', () => {
      popupWindow.close()
    })
  })

  popupWindow.addEventListener('unload', () => {
    if (unsubscribe) {
      unsubscribe()
      dispatchUserActions.popupDisconnect()
    }
  })
}
