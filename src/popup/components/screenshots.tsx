import * as React from 'react'

type ScreenshotsProps = {
  feedback: FeedbackState
  startEditingScreenshot(payload: { screenshotIndex: number }): void
  clickDeleteScreenshot(payload: { screenshotIndex: number }): void
  deleteScreenshotDisabled: boolean
}

type ScreenshotThumbnailProps = {
  screenshot: Screenshot
  startEditingScreenshot(): void
  clickDeleteScreenshot(): void
  deleteScreenshotDisabled: boolean
}

function CloseButton({ onClick }: { onClick: () => void }): JSX.Element {
  return (
    <button className="close-button" onClick={onClick}>
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Close Button">
          <circle id="Ellipse 1" cx="13" cy="13" r="13" fill="black" />
          <path
            id="Vector"
            d="M18.6386 6.23385L19.7662 7.36141C20.0779 7.6732 20.0779 8.17797 19.7662 8.48896L8.48896 19.7662C8.17717 20.0779 7.6724 20.0779 7.36141 19.7662L6.23385 18.6386C5.92205 18.3268 5.92205 17.822 6.23385 17.511L17.511 6.23385C17.822 5.92205 18.3276 5.92205 18.6386 6.23385Z"
            fill="white"
          />
          <path
            id="Vector_2"
            d="M19.7662 18.6386L18.6386 19.7662C18.3268 20.0779 17.822 20.0779 17.511 19.7662L6.23385 8.48896C5.92205 8.17717 5.92205 7.6724 6.23385 7.36141L7.36141 6.23385C7.6732 5.92205 8.17797 5.92205 8.48896 6.23385L19.7662 17.511C20.0779 17.822 20.0779 18.3276 19.7662 18.6386Z"
            fill="white"
          />
        </g>
      </svg>
    </button>
  )
}

export function ScreenshotThumbnail({
  screenshot,
  startEditingScreenshot,
  clickDeleteScreenshot,
  deleteScreenshotDisabled,
}: ScreenshotThumbnailProps): JSX.Element {
  return (
    <div className="screenshot-thumbnail">
      <img className="screenshot-image" src={screenshot.uri} />
      {!deleteScreenshotDisabled && <CloseButton onClick={clickDeleteScreenshot} />}
      <button className="edit-button" onClick={startEditingScreenshot}>
        Edit
      </button>
    </div>
  )
}

export function Screenshots({ feedback, startEditingScreenshot, clickDeleteScreenshot, deleteScreenshotDisabled }: ScreenshotsProps): null | JSX.Element {
  if (!feedback.screenshots.length) return null

  return (
    <div className="screenshots">
      {feedback.screenshots.map((screenshot, index) => (
        <ScreenshotThumbnail
          key={`${screenshot.uri}_${index}`}
          screenshot={screenshot}
          startEditingScreenshot={() => startEditingScreenshot({ screenshotIndex: index })}
          clickDeleteScreenshot={() => clickDeleteScreenshot({ screenshotIndex: index })}
          deleteScreenshotDisabled={deleteScreenshotDisabled}
        />
      ))}
    </div>
  )
}
