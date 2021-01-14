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

function Expand({ onClick }: { onClick(): void }): JSX.Element {
  return (
    <button className="expand-btn" onClick={onClick} title="View Full Image">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8.46448 11.2929L11.2929 8.46447L9.17159 6.34315L11.2929 4.22183H4.22184V11.2929L6.34316 9.17157L8.46448 11.2929ZM8.46448 12.7071L6.34316 14.8284L4.22184 12.7071V19.7782H11.2929L9.17159 17.6569L11.2929 15.5355L8.46448 12.7071ZM19.7782 4.22183H12.7071L14.8284 6.34315L12.7071 8.46447L15.5355 11.2929L17.6569 9.17157L19.7782 11.2929V4.22183ZM15.5355 12.7071L12.7071 15.5355L14.8284 17.6569L12.7071 19.7782H19.7782V12.7071L17.6569 14.8284L15.5355 12.7071Z"
          fill="black"
        />
      </svg>
    </button>
  )
}

export function ImageThumbnail({ image, clickDeleteImage }: ImageThumbnailProps): JSX.Element {
  const createTabWithImage = () => chrome.tabs.create({ url: image.uri, active: true })

  return (
    <div className="image-thumbnail">
      <img className="image-image" src={image.uri} onClick={createTabWithImage} />
      {<CloseButton onClick={clickDeleteImage} />}
      <Expand onClick={createTabWithImage} />
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

export function Images({ feedback, startEditingImage, clickDeleteImage }: ImagesProps): JSX.Element {
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
