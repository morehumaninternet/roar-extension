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

function Authenticating() {
  return <iframe src={`${window.roarServerUrl}/v1/login`} />
}

export function App({ state, dispatchUserActions }: AppProps): JSX.Element {
  switch (state.twitterAuthState.state) {
    case 'not_authed': {
      return <NotAuthed signInWithTwitter={dispatchUserActions.signInWithTwitter} />
    }
    case 'authenticating': {
      return <Authenticating />
    }
    case 'authenticated': {
      return <Authenticated feedback={activeFeedback(state)} dispatchUserActions={dispatchUserActions} />
    }
  }
}
