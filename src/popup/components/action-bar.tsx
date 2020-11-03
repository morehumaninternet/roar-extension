import * as React from 'react'
// import { EmojiPicker } from './emoji-picker'
import { ActionButton } from './action-button'

type ActionBarProps = {
  clickPost: DispatchUserActions['clickPost']
  togglePickingEmoji: DispatchUserActions['togglePickingEmoji']
  clickTakeScreenshot: DispatchUserActions['clickTakeScreenshot']
}

export const ActionBar = ({ clickPost, togglePickingEmoji, clickTakeScreenshot }: ActionBarProps) => {
  return (
    <div className="action-bar">
      <div className="action-buttons">
        <ActionButton kind="TakeSnapshot" onClick={clickTakeScreenshot} />
        <ActionButton kind="AddImage" onClick={console.log} />
        <ActionButton kind="AddEmoji" onClick={togglePickingEmoji} />
      </div>
      <button className="post-btn" onClick={clickPost}>
        Post
      </button>
    </div>
  )
}
