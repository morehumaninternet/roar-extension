import * as React from 'react'
import { FeedbackEditor } from '../components/feedback-editor'
import { Images } from '../components/images'
import { ActionBar } from '../components/action-bar'
import { EmojiPicker } from '../components/emoji-picker'
import { Tweeting } from '../components/tweeting'
// import { EditingImage } from '../components/editing-image'

export function Authenticated({
  feedback,
  tweeting,
  user,
  pickingEmoji,
  helpOn,
  darkModeOn,
  addImageDisabled,
  deleteImageDisabled,
  dispatchUserActions,
  characterLimit,
  postTweetDisabled,
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
          <FeedbackEditor
            editorState={feedback.state.editorState}
            hovering={feedback.state.hovering}
            updateEditorState={dispatchUserActions.updateEditorState}
            hoverOver={dispatchUserActions.hoverOver}
          />
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
            toggleDarkMode={dispatchUserActions.toggleDarkMode}
            pickingEmoji={pickingEmoji}
            helpOn={helpOn}
            darkModeOn={darkModeOn}
            addImageDisabled={addImageDisabled}
            imageUpload={dispatchUserActions.imageUpload}
            characterLimit={characterLimit}
            postTweetDisabled={postTweetDisabled}
          />
        </div>
      </main>
    </div>
  )
}
