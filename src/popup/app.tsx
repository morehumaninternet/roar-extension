import * as React from 'react'
import { FeedbackEditor } from './components/feedback-editor'
import { Screenshots } from './components/screenshots'

type AppProps = {
  feedback: null | FeedbackState
  dispatchUserActions: DispatchUserActions
}

export function App({ feedback, dispatchUserActions }: AppProps): JSX.Element {
  return (
    <>
      <header>
        <img className="main-logo" src="/img/roar_128.png" />
        <h1>ROAR!</h1>
      </header>
      <main>
        <FeedbackEditor />
        <Screenshots feedback={feedback} />
      </main>
    </>
  )
}
