import * as React from 'react'

export function EditingScreenshot({ color, blob }: Pick<EditingScreenshotState, 'blob' | 'color'>) {
  const imageUrl = URL.createObjectURL(blob)

  return (
    <div>
      EDITING
      <img className="screenshot-thumbnail" src={imageUrl} />
      <p>Color {color}</p>
    </div>
  )
}
