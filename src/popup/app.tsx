import * as React from 'react'
import { FeedbackEditor } from './components/feedback-editor'
import { Screenshots } from './components/screenshots'
import { ActionBar } from './components/action-bar'

type AppProps = {
  feedback: null | FeedbackState
  dispatchUserActions: DispatchUserActions
}

export function App({ feedback, dispatchUserActions }: AppProps): JSX.Element {
  return (
    <>
      {/* <header>
        <img className="main-logo" src="/img/roar_128.png" />
        <h1>ROAR!</h1>
      </header> */}
      <main>
        <img className="profile-img" src="/img/avatar.png" />
        <div className="twitter-interface">
          <FeedbackEditor />
          <Screenshots feedback={feedback} />
          <ActionBar />
        </div>
      </main>
    </>
  )
}
