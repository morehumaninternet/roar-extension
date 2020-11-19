import * as React from 'react'
import { ActionButton } from './action-button'

type ActionBarProps = {
  clickPost: Dispatchers<UserAction>['clickPost']
  togglePickingEmoji: Dispatchers<UserAction>['togglePickingEmoji']
  clickTakeScreenshot: Dispatchers<UserAction>['clickTakeScreenshot']
  toggleHelp: Dispatchers<UserAction>['toggleHelp']
  takeScreenshotDisabled: boolean
}

export const ActionBar = ({ clickPost, togglePickingEmoji, clickTakeScreenshot, toggleHelp, takeScreenshotDisabled }: ActionBarProps) => {
  return (
    <div className="action-bar">
      <div className="action-buttons">
        <ActionButton kind="TakeScreenshot" onClick={clickTakeScreenshot} disabled={takeScreenshotDisabled} />
        <ActionButton kind="AddImage" onClick={console.log} />
        <ActionButton kind="AddEmoji" onClick={togglePickingEmoji} />
        <ActionButton kind="Help" onClick={toggleHelp} />
      </div>
      <button className="post-btn" onClick={clickPost}>
        Post
      </button>
    </div>
  )
}
