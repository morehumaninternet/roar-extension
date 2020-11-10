import * as React from 'react'
import { FeedbackEditor } from '../components/feedback-editor'
import { Screenshots } from '../components/screenshots'
import { ActionBar } from '../components/action-bar'
import { EmojiPicker } from '../components/emoji-picker'
import { Tweeting } from '../components/tweeting'

type AuthenticatedProps = {
  feedback: FeedbackState
  host: string
  user: User
  isTweeting: boolean
  pickingEmoji: boolean
  dispatchUserActions: DispatchUserActions
}

export function Authenticated({ feedback, host, isTweeting, user, pickingEmoji, dispatchUserActions }: AuthenticatedProps): JSX.Element | null {
  if (isTweeting) {
    return <Tweeting host={host} />
  }

  return (
    <>
      <EmojiPicker pickingEmoji={pickingEmoji} dispatchUserActions={dispatchUserActions} />
      <main>
        <img className="profile-img" src={user.photoUrl || '/img/default-avatar.png'} />
        <div className="twitter-interface">
          <FeedbackEditor editorState={feedback.editorState} updateEditorState={dispatchUserActions.updateEditorState} />
          <Screenshots feedback={feedback} />
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
