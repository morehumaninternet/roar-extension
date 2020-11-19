import * as React from 'react'
import { AddImage } from './action-svgs'

type ImagePickerProps = {
  onSelect: Dispatchers<UserAction>['imageUpload']
}

export function ImagePicker({ onSelect }: ImagePickerProps) {
  const onChange = async evt => {
    onSelect(evt.target.files[0])
  }
  console.log('image picker here!')
  return (
    <>
      <label className="svg-btn" htmlFor="files">
        {AddImage}
      </label>
      <input id="files" style={{ display: 'none' }} type="file" accept=".png" onChange={onChange} />
    </>
  )
}
