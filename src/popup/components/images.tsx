import * as React from 'react'
import { range } from 'lodash'
import { CloseButton } from './close-button'

type ImagesProps = {
  feedback: FeedbackState
  startEditingImage(payload: { imageIndex: number }): void
  clickDeleteImage(payload: { imageIndex: number }): void
}

type ImageThumbnailProps = {
  image: Image
  startEditingImage(): void
  clickDeleteImage(): void
}

export function ImageThumbnail({ image, startEditingImage, clickDeleteImage }: ImageThumbnailProps): JSX.Element {
  return (
    <div className="image-thumbnail">
      <img className="image-image" src={image.uri} />
      {<CloseButton onClick={clickDeleteImage} />}
      {/* <button className="edit-btn" onClick={startEditingImage}>
        Edit
      </button> */}
    </div>
  )
}

function ImageSpinner(): JSX.Element {
  return (
    <div className="image-thumbnail">
      <div className="image-spinner">
        <div className="spinner-container">
          <div className="spinner" />
        </div>
      </div>
    </div>
  )
}

export function Images({ feedback, startEditingImage, clickDeleteImage }: ImagesProps): null | JSX.Element {
  if (!feedback.images.length && !feedback.addingImages) return null

  return (
    <div className="images">
      {feedback.images.map((image, index) => (
        <ImageThumbnail
          key={`${image.uri}_${index}`}
          image={image}
          startEditingImage={() => startEditingImage({ imageIndex: index })}
          clickDeleteImage={() => clickDeleteImage({ imageIndex: index })}
        />
      ))}
      {range(feedback.addingImages).map(n => (
        <ImageSpinner key={n} />
      ))}
    </div>
  )
}
