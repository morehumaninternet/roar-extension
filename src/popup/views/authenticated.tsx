import * as React from 'react'
import { FeedbackEditor } from '../components/feedback-editor'
import { Screenshots } from '../components/screenshots'
import { ActionBar } from '../components/action-bar'
import { EmojiPicker } from '../components/emoji-picker'

type AuthenticatedProps = {
  feedback?: FeedbackState
  user: User
  pickingEmoji: boolean
  dispatchUserActions: DispatchUserActions
}

export function Authenticated({ feedback, user, pickingEmoji, dispatchUserActions }: AuthenticatedProps): JSX.Element | null {
  if (!feedback) {
    return null
  }

  const editorState = feedback.editorState

  return (
    <div className="app">
      <EmojiPicker pickingEmoji={pickingEmoji} dispatchUserActions={dispatchUserActions} />
      <main>
        <img className="profile-img" src={user.photoUrl || '/img/default-avatar.png'} />
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
