import * as React from 'react'
import * as Sketch from 'react-sketch'

export function EditingScreenshot({ color, blob }: Pick<EditingScreenshotState, 'blob' | 'color'>): JSX.Element {
  const imageUrl = URL.createObjectURL(blob)

  return (
    <div>
      EDITING
      <img className="screenshot-thumbnail" src={imageUrl} />
      <p>Color {color}</p>
      <Sketch.SketchField width="1024px" height="768px" tool={Sketch.Tools.Pencil} lineColor="black" lineWidth={3} />
    </div>
  )
}
