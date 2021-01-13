import * as React from 'react'
import { FeedbackEditor } from '../components/feedback-editor'
import { Images } from '../components/images'
import { ActionBar } from '../components/action-bar'
import { EmojiPicker } from '../components/emoji-picker'
import { UserAvatar } from '../components/user-avatar'

export function Authenticated({
  feedback,
  user,
  pickingEmoji,
  darkModeOn,
  addImageDisabled,
  dispatchUserActions,
  characterLimit,
  postTweetDisabled,
  websiteFetched,
}: AuthenticatedState): JSX.Element | null {
  if (!feedback) {
    return null
  }

  return (
    <div className="authenticated">
      <EmojiPicker pickingEmoji={pickingEmoji} dispatchUserActions={dispatchUserActions} />
      <main>
        <UserAvatar clickLogout={dispatchUserActions.clickLogout} src={user.photoUrl || '/img/default-avatar.png'} />

        <div className="twitter-interface">
          <FeedbackEditor
            editorState={feedback.editorState}
            hovering={feedback.hovering}
            updateEditorState={dispatchUserActions.updateEditorState}
            hoverOver={dispatchUserActions.hoverOver}
            twitterHandle={feedback.twitterHandle}
            websiteFetched={websiteFetched}
          />
          <Images feedback={feedback} startEditingImage={dispatchUserActions.startEditingImage} clickDeleteImage={dispatchUserActions.clickDeleteImage} />
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
            isTweeting={feedback.isTweeting}
          />
        </div>
      </main>
    </div>
  )
}
