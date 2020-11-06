import * as React from 'react'
import { Picker } from 'emoji-mart'
import { FeedbackEditor } from './components/feedback-editor'
import { Screenshots } from './components/screenshots'
import { activeTab } from '../selectors'
import { ActionBar } from './components/action-bar'
// import { EmojiPicker } from './components/emoji-picker'

type AppProps = {
  state: AppState
  dispatchUserActions: DispatchUserActions
}

type AuthenticatedProps = {
  feedback?: FeedbackState
  pickingEmoji: boolean
  dispatchUserActions: DispatchUserActions
}

function NotAuthed({ signInWithTwitter }: { signInWithTwitter(): void }): JSX.Element {
  return <button onClick={signInWithTwitter}>Sign in with twitter</button>
}

function Authenticated({ feedback, pickingEmoji, dispatchUserActions }: AuthenticatedProps): JSX.Element | null {
  if (!feedback) {
    return null
  }

  const editorState = feedback.editorState

  return (
    <div className="app">
      <div className={`emoji-picker-container ${pickingEmoji ? 'open' : 'closed'}`}>
        <Picker
          style={{ width: '100%', /* height: '100%', */ border: 'none', borderRadius: 0 }}
          title="Pick your emoji…"
          onSelect={(emoji: any) => dispatchUserActions.emojiPicked(emoji.native)}
        />
      </div>
      <main>
        <img className="profile-img" src="/img/avatar.png" />
        <div className="twitter-interface">
          <FeedbackEditor editorState={editorState} updateEditorState={dispatchUserActions.updateEditorState} />
          <Screenshots feedback={feedback} />
          <ActionBar
            clickPost={dispatchUserActions.clickPost}
            togglePickingEmoji={dispatchUserActions.togglePickingEmoji}
            clickTakeScreenshot={dispatchUserActions.clickTakeScreenshot}
          />
        </div>
      </main>
    </div>
  )
}

function Authenticating({ authenticatedViaTwitter }: { authenticatedViaTwitter(): void }): JSX.Element {
  React.useEffect(() => {
    function listener(event: any): any {
      if (event.origin !== window.roarServerUrl) {
        return
      }
      if (event.data.type === 'twitter-auth-success') {
        return authenticatedViaTwitter()
      }
      if (event.data.type === 'twitter-auth-failure') {
        throw new Error('TODO: handle this')
      }
      throw new Error(`Unexpected message: ${event.data}`)
    }

    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [])

  return <iframe src={`${window.roarServerUrl}/v1/auth/twitter`} allow="*" />
}

export function App({ state, dispatchUserActions }: AppProps): JSX.Element {
  switch (state.twitterAuth) {
    case 'not_authed': {
      return <NotAuthed signInWithTwitter={dispatchUserActions.signInWithTwitter} />
    }
    case 'authenticating': {
      return <Authenticating authenticatedViaTwitter={dispatchUserActions.authenticatedViaTwitter} />
    }
    case 'authenticated': {
      return <Authenticated feedback={activeTab(state)?.feedbackState} pickingEmoji={state.pickingEmoji} dispatchUserActions={dispatchUserActions} />
    }
  }
}
