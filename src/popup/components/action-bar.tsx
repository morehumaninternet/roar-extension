import * as React from 'react'
import { ActionButton } from './action-button'

type ActionBarProps = {
  clickPost: Dispatchers<UserAction>['clickPost']
  togglePickingEmoji: Dispatchers<UserAction>['togglePickingEmoji']
  clickTakeScreenshot: Dispatchers<UserAction>['clickTakeScreenshot']
  imageUpload: Dispatchers<UserAction>['imageUpload']
  toggleHelp: Dispatchers<UserAction>['toggleHelp']
  addImageDisabled: boolean
}

export const ActionBar = ({ clickPost, togglePickingEmoji, clickTakeScreenshot, imageUpload, toggleHelp, addImageDisabled }: ActionBarProps) => {
  const imageRef: React.MutableRefObject<HTMLInputElement> = React.useRef() as any

  return (
    <div className="action-bar">
      <div className="action-buttons">
        <ActionButton kind="TakeScreenshot" onClick={clickTakeScreenshot} disabled={addImageDisabled} />
        <ActionButton kind="AddImage" onClick={() => imageRef.current!.click()} disabled={addImageDisabled} />
        <ActionButton kind="AddEmoji" onClick={togglePickingEmoji} />
        <ActionButton kind="Help" onClick={toggleHelp} />
      </div>
      <input ref={imageRef} type="file" accept=".png" onChange={evt => imageUpload({ file: evt.target.files![0] })} />
      <button className="post-btn" onClick={clickPost}>
        Post
      </button>
    </div>
  )
}
