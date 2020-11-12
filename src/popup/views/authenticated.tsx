import * as React from 'react'
import { FeedbackEditor } from '../components/feedback-editor'
import { Screenshots } from '../components/screenshots'
import { ActionBar } from '../components/action-bar'
import { EmojiPicker } from '../components/emoji-picker'
import { Tweeting } from '../components/tweeting'
import { EditingScreenshot } from '../components/editing-screenshot'

type AuthenticatedProps = {
  feedback: FeedbackState
  host: string
  user: User
  isTweeting: boolean
  pickingEmoji: boolean
  dispatchUserActions: Dispatchers<UserAction>
}

export function Authenticated({ feedback, host, isTweeting, user, pickingEmoji, dispatchUserActions }: AuthenticatedProps): JSX.Element | null {
  if (isTweeting) {
    return <Tweeting host={host} />
  }

  if (feedback.editingScreenshot) {
    return <EditingScreenshot color={feedback.editingScreenshot.color} screenshot={feedback.editingScreenshot.screenshot} />
  }

  return (
    <>
      <EmojiPicker pickingEmoji={pickingEmoji} dispatchUserActions={dispatchUserActions} />
      <main>
        <img className="profile-img" src={user.photoUrl || '/img/default-avatar.png'} />
        <div className="twitter-interface">
          <FeedbackEditor editorState={feedback.editorState} updateEditorState={dispatchUserActions.updateEditorState} />
          <Screenshots feedback={feedback} startEditingScreenshot={dispatchUserActions.startEditingScreenshot} />
          <ActionBar
            clickPost={dispatchUserActions.clickPost}
            togglePickingEmoji={dispatchUserActions.togglePickingEmoji}
            clickTakeScreenshot={dispatchUserActions.clickTakeScreenshot}
          />
        </div>
      </main>
    </>
  )
}
