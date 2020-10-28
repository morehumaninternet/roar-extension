import * as React from 'react'
import { FeedbackEditor } from './components/feedback-editor'
import { Screenshots } from './components/screenshots'
import { activeFeedback } from '../selectors'
import { ActionBar } from './components/action-bar'

type AppProps = {
  state: AppState
  dispatchUserActions: DispatchUserActions
}

type AuthenticatedProps = {
  feedback: null | FeedbackState
  dispatchUserActions: DispatchUserActions
}

function NotAuthed({ signInWithTwitter }: { signInWithTwitter(): void }): JSX.Element {
  return <button onClick={signInWithTwitter}>Sign in with twitter</button>
}

function Authenticated({ feedback, dispatchUserActions }: AuthenticatedProps): JSX.Element {
  return (
    <div className="app">
      <main>
        <img className="profile-img" src="/img/avatar.png" />
        <div className="twitter-interface">
          <FeedbackEditor />
          <Screenshots feedback={feedback} />
          <ActionBar />
        </div>
      </main>
    </div>
  )
}

function Authenticating({ authenticatedViaTwitter }: { authenticatedViaTwitter(): void }) {
  React.useEffect(() => {
    function listener(event) {
      if (event.origin !== 'http://127.0.0.1:5004' && event.origin !== 'https://roar-server.herokuapp.com') {
        return
      }
      if (event.data === 'twitter-auth-success') {
        return authenticatedViaTwitter()
      }
      if (event.data === 'twitter-auth-failure') {
        throw new Error('TODO: handle this')
      }
      throw new Error(`Unexpected message: ${event.data}`)
    }

    addEventListener('message', listener)
    return () => removeEventListener('message', listener)
  }, [])

  return <iframe src={`${window.roarServerUrl}/v1/auth/twitter`} allow="*" />
}

export function App({ state, dispatchUserActions }: AppProps): JSX.Element {
  switch (state.twitterAuthState.state) {
    case 'not_authed': {
      return <NotAuthed signInWithTwitter={dispatchUserActions.signInWithTwitter} />
    }
    case 'authenticating': {
      return <Authenticating authenticatedViaTwitter={dispatchUserActions.authenticatedViaTwitter} />
    }
    case 'authenticated': {
      return <Authenticated feedback={activeFeedback(state)} dispatchUserActions={dispatchUserActions} />
    }
  }
}
