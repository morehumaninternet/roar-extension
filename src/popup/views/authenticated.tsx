import * as React from 'react'
import { FeedbackEditor } from '../components/feedback-editor'
import { Screenshots } from '../components/screenshots'
import { ActionBar } from '../components/action-bar'
import { EmojiPicker } from '../components/emoji-picker'
import { Tweeting } from '../components/tweeting'
import { EditingScreenshot } from '../components/editing-screenshot'

export function Authenticated({
  feedback,
  tweeting,
  user,
  pickingEmoji,
  takeScreenshotDisabled,
  deleteScreenshotDisabled,
  dispatchUserActions,
}: AuthenticatedState): JSX.Element | null {
  if (tweeting) {
    return <Tweeting at={tweeting.at} />
  }

  if (!feedback.exists) {
    if (feedback.reasonDisabledMessage) {
      return <p>{feedback.reasonDisabledMessage}</p>
    }
    return null
  }

  return (
    <div className="authenticated">
      <EmojiPicker pickingEmoji={pickingEmoji} dispatchUserActions={dispatchUserActions} />
      <main>
        <img className="profile-img" src={user.photoUrl || '/img/default-avatar.png'} />
        <div className="twitter-interface">
          <FeedbackEditor editorState={feedback.state.editorState} updateEditorState={dispatchUserActions.updateEditorState} />
          <Screenshots
            feedback={feedback.state}
            startEditingScreenshot={dispatchUserActions.startEditingScreenshot}
            clickDeleteScreenshot={dispatchUserActions.clickDeleteScreenshot}
            deleteScreenshotDisabled={deleteScreenshotDisabled}
          />
          <ActionBar
            clickPost={dispatchUserActions.clickPost}
            togglePickingEmoji={dispatchUserActions.togglePickingEmoji}
            clickTakeScreenshot={dispatchUserActions.clickTakeScreenshot}
            toggleHelp={dispatchUserActions.toggleHelp}
            takeScreenshotDisabled={takeScreenshotDisabled}
            imageUpload={dispatchUserActions.imageUpload}
          />
        </div>
      </main>
    </div>
  )
}
