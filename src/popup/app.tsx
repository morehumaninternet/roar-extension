import * as React from 'react'
import views from './views'
import { toAppState } from '../selectors'

type AppProps = {
  storeState: StoreState
  dispatchUserActions: Dispatchers<UserAction>
}

export function AppContents({ storeState, dispatchUserActions }: AppProps): JSX.Element {
  const appState = toAppState(storeState, dispatchUserActions)

  switch (appState.view) {
    case 'NotAuthed':
      return <views.NotAuthed {...appState} />
    case 'Authenticating':
      return <views.Authenticating {...appState} />
    case 'Authenticated':
      return <views.Authenticated {...appState} />
  }
}

export function App(props: AppProps): JSX.Element {
  return (
    <div className="app">
      <AppContents {...props} />
    </div>
  )
}
