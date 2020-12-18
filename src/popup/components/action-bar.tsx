import * as React from 'react'
import { ActionButton } from './action-button'
import { CharacterCountdown } from './character-countdown'

type ActionBarProps = {
  clickPost: Dispatchers<UserAction>['clickPost']
  togglePickingEmoji: Dispatchers<UserAction>['togglePickingEmoji']
  clickTakeScreenshot: Dispatchers<UserAction>['clickTakeScreenshot']
  imageUpload: Dispatchers<UserAction>['imageUpload']
  toggleDarkMode: Dispatchers<UserAction>['toggleDarkMode']
  pickingEmoji: boolean
  darkModeOn: boolean
  addImageDisabled: boolean
  characterLimit: CharacterLimit
  postTweetDisabled: boolean
}

export const ActionBar = ({
  clickPost,
  togglePickingEmoji,
  clickTakeScreenshot,
  imageUpload,
  toggleDarkMode,
  pickingEmoji,
  darkModeOn,
  addImageDisabled,
  characterLimit,
  postTweetDisabled,
}: ActionBarProps) => {
  const imageRef: React.MutableRefObject<HTMLInputElement> = React.useRef() as any

  return (
    <div className="action-bar">
      <div className="action-buttons">
        <ActionButton kind="TakeScreenshot" onClick={clickTakeScreenshot} disabled={addImageDisabled} />
        <ActionButton kind="AddImage" onClick={() => imageRef.current!.click()} disabled={addImageDisabled} />
        <ActionButton kind="AddEmoji" onClick={togglePickingEmoji} additionalClassNames={pickingEmoji ? 'on' : 'off'} />
        <ActionButton kind={darkModeOn ? 'DarkMode' : 'LightMode'} onClick={toggleDarkMode} />
      </div>
      <input ref={imageRef} type="file" accept=".png" onChange={evt => imageUpload({ file: evt.target.files![0] })} />
      <CharacterCountdown characterLimit={characterLimit} />
      <button className="post-btn" onClick={clickPost} disabled={postTweetDisabled}>
        Post
      </button>
    </div>
  )
}
