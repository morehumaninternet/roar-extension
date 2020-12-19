import * as React from 'react'
import { FeedbackEditor } from '../components/feedback-editor'
import { Images } from '../components/images'
import { ActionBar } from '../components/action-bar'
import { EmojiPicker } from '../components/emoji-picker'
import { Tweeting } from '../components/tweeting'
import { UserAvatar } from '../components/user-avatar'
import { Alert } from '../components/alert'
// import { EditingImage } from '../components/editing-image'

export function Authenticated({
  feedback,
  tweeting,
  user,
  pickingEmoji,
  darkModeOn,
  addImageDisabled,
  dispatchUserActions,
  characterLimit,
  postTweetDisabled,
}: AuthenticatedState): JSX.Element | null {
  if (tweeting) {
    return <Tweeting at={tweeting.at} />
  }

  if (!feedback.exists) {
    if (feedback.reasonDisabledMessage) {
      return <Alert alertMessage={feedback.reasonDisabledMessage} contactSupport={false} onClose={window.close} />
    }
    return null
  }

  return (
    <div className="authenticated">
      <EmojiPicker pickingEmoji={pickingEmoji} dispatchUserActions={dispatchUserActions} />
      <main>
        <UserAvatar clickLogout={dispatchUserActions.clickLogout} src={user.photoUrl || '/img/default-avatar.png'} />

        <div className="twitter-interface">
          <FeedbackEditor
            editorState={feedback.state.editorState}
            hovering={feedback.state.hovering}
            updateEditorState={dispatchUserActions.updateEditorState}
            hoverOver={dispatchUserActions.hoverOver}
            twitterHandle={feedback.state.twitterHandle}
          />
          <Images feedback={feedback.state} startEditingImage={dispatchUserActions.startEditingImage} clickDeleteImage={dispatchUserActions.clickDeleteImage} />
          <ActionBar
            clickPost={dispatchUserActions.clickPost}
            togglePickingEmoji={dispatchUserActions.togglePickingEmoji}
            clickTakeScreenshot={dispatchUserActions.clickTakeScreenshot}
            toggleDarkMode={dispatchUserActions.toggleDarkMode}
            pickingEmoji={pickingEmoji}
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
