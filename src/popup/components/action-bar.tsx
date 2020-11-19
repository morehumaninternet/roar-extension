import * as React from 'react'
import { ActionButton } from './action-button'
import { ImagePicker } from './image-picker'

type ActionBarProps = {
  clickPost: Dispatchers<UserAction>['clickPost']
  togglePickingEmoji: Dispatchers<UserAction>['togglePickingEmoji']
  clickTakeScreenshot: Dispatchers<UserAction>['clickTakeScreenshot']
  imageUpload: Dispatchers<UserAction>['imageUpload']
  toggleHelp: Dispatchers<UserAction>['toggleHelp']
  addImageDisabled: boolean
}

export const ActionBar = ({ clickPost, togglePickingEmoji, clickTakeScreenshot, imageUpload, toggleHelp, addImageDisabled }: ActionBarProps) => {
  return (
    <div className="action-bar">
      <div className="action-buttons">
        <ActionButton kind="TakeScreenshot" onClick={clickTakeScreenshot} disabled={addImageDisabled} />
        <ImagePicker
          onSelect={(file: any) => {
            imageUpload({ file })
          }}
        />
        <ActionButton kind="AddEmoji" onClick={togglePickingEmoji} />
        <ActionButton kind="Help" onClick={toggleHelp} />
      </div>
      <button className="post-btn" onClick={clickPost}>
        Post
      </button>
    </div>
  )
}
