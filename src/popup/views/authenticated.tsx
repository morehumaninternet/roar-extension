import * as React from 'react'
import { FeedbackEditor } from '../components/feedback-editor'
import { Images } from '../components/images'
import { ActionBar } from '../components/action-bar'
import { EmojiPicker } from '../components/emoji-picker'
import { Tweeting } from '../components/tweeting'
import { EditingImage } from '../components/editing-image'

export function Authenticated({
  feedback,
  tweeting,
  user,
  pickingEmoji,
  addImageDisabled,
  deleteImageDisabled,
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
          <Images
            feedback={feedback.state}
            startEditingImage={dispatchUserActions.startEditingImage}
            clickDeleteImage={dispatchUserActions.clickDeleteImage}
            deleteImageDisabled={deleteImageDisabled}
          />
          <ActionBar
            clickPost={dispatchUserActions.clickPost}
            togglePickingEmoji={dispatchUserActions.togglePickingEmoji}
            clickTakeScreenshot={dispatchUserActions.clickTakeScreenshot}
            toggleHelp={dispatchUserActions.toggleHelp}
            addImageDisabled={addImageDisabled}
            imageUpload={dispatchUserActions.imageUpload}
          />
        </div>
      </main>
    </div>
  )
}
