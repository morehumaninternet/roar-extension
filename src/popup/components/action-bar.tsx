import * as React from 'react'
import { ActionButton } from './action-button'

type ActionBarProps = {
  clickPost: Dispatchers<UserAction>['clickPost']
  togglePickingEmoji: Dispatchers<UserAction>['togglePickingEmoji']
  clickTakeScreenshot: Dispatchers<UserAction>['clickTakeScreenshot']
  takeScreenshotDisabled: boolean
}

export const ActionBar = ({ clickPost, togglePickingEmoji, clickTakeScreenshot, takeScreenshotDisabled }: ActionBarProps) => {
  return (
    <div className="action-bar">
      <div className="action-buttons">
        <ActionButton kind="TakeScreenshot" onClick={clickTakeScreenshot} disabled={takeScreenshotDisabled} />
        <ActionButton kind="AddImage" onClick={console.log} />
        <ActionButton kind="AddEmoji" onClick={togglePickingEmoji} />
      </div>
      <button className="post-btn" onClick={clickPost}>
        Post
      </button>
    </div>
  )
}
