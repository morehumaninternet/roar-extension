import * as React from 'react'
import * as svgs from './action-svgs'
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
  isTweeting: boolean
}

const Separator = (): JSX.Element => (
  <div className="separator">
    <svg viewBox="0 0 2 100">
      <line x1="1" y1="0" x2="1" y2="100" />
    </svg>
  </div>
)

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
  isTweeting,
}: ActionBarProps) => {
  const imageRef: React.MutableRefObject<HTMLInputElement> = React.useRef() as any

  return (
    <div className="action-bar">
      <div className="action-buttons">
        <ActionButton kind="TakeScreenshot" onClick={clickTakeScreenshot} disabled={addImageDisabled} />
        <ActionButton kind="AddImage" onClick={() => imageRef.current!.click()} disabled={addImageDisabled} />
        <ActionButton kind="AddEmoji" onClick={togglePickingEmoji} additionalClassNames={pickingEmoji ? 'on' : 'off'} />
        <Separator />
        <ActionButton kind={darkModeOn ? 'DarkMode' : 'LightMode'} onClick={toggleDarkMode} />
        <a title="Get Help" className="svg-btn Help" role="button" href="mailto:support@morehumaninternet.org?subject=Roar! extension">
          {svgs.Help}
        </a>
      </div>
      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        onChange={event => {
          imageUpload({ file: event.target.files![0] })
          event.target.value = ''
        }}
      />
      <CharacterCountdown characterLimit={characterLimit} />
      <button className="post-btn" onClick={clickPost} disabled={isTweeting || postTweetDisabled} title="Post Feedback">
        {isTweeting ? 'Posting...' : 'Post'}
      </button>
    </div>
  )
}
