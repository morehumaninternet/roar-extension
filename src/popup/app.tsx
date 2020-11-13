import * as React from 'react'
import { Authenticated } from './views/authenticated'
import { Authenticating } from './views/authenticating'
import { NotAuthed } from './views/not-authed'
import { activeTab, deleteScreenshotDisabled, takeScreenshotDisabled } from '../selectors'

type AppProps = {
  state: AppState
  dispatchUserActions: Dispatchers<UserAction>
}

export function App({ state, dispatchUserActions }: AppProps): null | JSX.Element {
  console.log('state.auth.state', state.auth.state)

  switch (state.auth.state) {
    case 'not_authed': {
      return <NotAuthed signInWithTwitter={dispatchUserActions.signInWithTwitter} />
    }
    case 'authenticating': {
      return <Authenticating authenticatedViaTwitter={dispatchUserActions.authenticatedViaTwitter} />
    }
    case 'authenticated': {
      const tab = activeTab(state)
      if (!tab) return null
      if (tab.host) {
        return (
          <div className="app">
            <Authenticated
              feedback={tab.feedbackState}
              host={tab.host}
              isTweeting={tab.isTweeting}
              user={state.auth.user}
              pickingEmoji={state.pickingEmoji}
              takeScreenshotDisabled={takeScreenshotDisabled(state)}
              deleteScreenshotDisabled={deleteScreenshotDisabled(state)}
              dispatchUserActions={dispatchUserActions}
            />
          </div>
        )
      }
      return <p>Roar does not work on this tab because it is not a webpage. Please open Roar on a webpage to try again.</p>
    }
  }
}
