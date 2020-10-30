import * as React from 'react'
import { EditorState, ContentState } from 'draft-js'
import { FeedbackEditor } from './components/feedback-editor'
import { Screenshots } from './components/screenshots'
import { activeFeedback } from '../selectors'
import { ActionBar } from './components/action-bar'

type AppProps = {
  state: AppState
  dispatchUserActions: DispatchUserActions
}

type AuthenticatedProps = {
  feedback: FeedbackState
  dispatchUserActions: DispatchUserActions
}

function NotAuthed({ signInWithTwitter }: { signInWithTwitter(): void }): JSX.Element {
  return <button onClick={signInWithTwitter}>Sign in with twitter</button>
}

function Authenticated({ feedback, dispatchUserActions }: AuthenticatedProps): JSX.Element {
  console.log('In authenticated')
  const editorState = feedback.editorState
  console.log('editorState', editorState)
  return (
    <div className="app">
      <main>
        <img className="profile-img" src="/img/avatar.png" />
        <div className="twitter-interface">
          <FeedbackEditor editorState={editorState} updateEditorState={dispatchUserActions.updateEditorState} />
          <Screenshots feedback={feedback} />
          <ActionBar postTweet={dispatchUserActions.postTweet} />
        </div>
      </main>
    </div>
  )
}

function Authenticating({ authenticatedViaTwitter }: { authenticatedViaTwitter(cookie: string): void }): JSX.Element {
  React.useEffect(() => {
    function listener(event: any): any {
      if (event.origin !== 'https://localhost:5004' && event.origin !== 'https://roar-server.herokuapp.com') {
        return
      }
      if (event.data.type === 'twitter-auth-success') {
        if (!event.data.cookie) {
          throw new Error(`Expected cookie`)
        }
        return authenticatedViaTwitter(event.data.cookie)
      }
      if (event.data.type === 'twitter-auth-failure') {
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
      return <Authenticated feedback={activeFeedback(state)!} dispatchUserActions={dispatchUserActions} />
    }
  }
}
