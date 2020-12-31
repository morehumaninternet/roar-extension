import * as React from 'react'
import views from './views'
import { Alert } from './components/alert'
import { toAppState } from '../selectors'

type AppProps = {
  popupWindow: Window
  storeState: StoreState
  dispatchUserActions: Dispatchers<UserAction>
}

export function AppContents(props: AppState): JSX.Element {
  switch (props.view) {
    case 'NotWebPage':
      return <views.NotWebPage />
    case 'Authenticating':
      return <views.Authenticating />
    case 'NotAuthed':
      return <views.NotAuthed {...props} />
    case 'Authenticated':
      return <views.Authenticated {...props} />
  }
}

export function App({ popupWindow, storeState, dispatchUserActions }: AppProps): JSX.Element {
  const appState = toAppState(popupWindow, storeState, dispatchUserActions)
  const theme = storeState.darkModeOn && appState.view !== 'NotAuthed' ? 'dark-theme' : ''
  return (
    <div className={`app ${theme}`}>
      <AppContents {...appState} />
      {storeState.alert && (
        <Alert alertMessage={storeState.alert.message} contactSupport={storeState.alert.contactSupport} onClose={dispatchUserActions.dismissAlert} />
      )}
    </div>
  )
}
