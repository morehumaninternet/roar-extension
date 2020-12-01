import * as React from 'react'
import views from './views'
import { toAppState } from '../selectors'

type AppProps = {
  popupWindow: Window
  storeState: StoreState
  dispatchUserActions: Dispatchers<UserAction>
}

export function AppContents({ popupWindow, storeState, dispatchUserActions }: AppProps): JSX.Element {
  const appState = toAppState(popupWindow, storeState, dispatchUserActions)

  switch (appState.view) {
    case 'NotAuthed':
      return <views.NotAuthed {...appState} />
    case 'Authenticating':
      return <views.Authenticating {...appState} />
    case 'AuthFailed':
      return <views.AuthFailed {...appState} />
    case 'Authenticated':
      return <views.Authenticated {...appState} />
  }
}

export function App(props: AppProps): JSX.Element {
  const theme = props.storeState.darkModeOn ? 'dark-theme' : 'light-theme'
  return (
    <div className={`app ${theme}`}>
      <AppContents {...props} />
    </div>
  )
}
