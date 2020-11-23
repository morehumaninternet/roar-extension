import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AppStore } from '../background/store'
import { darkMode } from './darkMode'
import { App } from './app'

function render(popupWindow: Window, dispatchUserActions: Dispatchers<UserAction>, storeState: StoreState, appContainer: HTMLElement) {
  return ReactDOM.render(<App popupWindow={popupWindow} storeState={storeState} dispatchUserActions={dispatchUserActions} />, appContainer)
}

export function mount(chrome: typeof global.chrome, popupWindow: Window) {
  const appContainer = popupWindow.document.getElementById('app-container')!
  const setDarkMode = darkMode(popupWindow)

  let dispatchUserActions: Dispatchers<UserAction>
  let unsubscribe: () => void

  chrome.runtime.getBackgroundPage(function (backgroundWindow: Window) {
    Object.assign(popupWindow, { backgroundWindow })
    const store: AppStore = backgroundWindow.store
    dispatchUserActions = store.dispatchers

    const onStateChange = () => {
      const state = store.getState()
      setDarkMode(state.darkModeOn)
      render(popupWindow, dispatchUserActions, store.getState(), appContainer)
    }

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
