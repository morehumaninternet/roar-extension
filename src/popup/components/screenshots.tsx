import * as React from 'react'

type ScreenshotsProps = {
  feedback: FeedbackState
  startEditingScreenshot(payload: { screenshotIndex: number }): void
}

type ScreenshotThumbnailProps = {
  screenshot: Screenshot
  startEditingScreenshot(): void
}

export function ScreenshotThumbnail({ screenshot, startEditingScreenshot }: ScreenshotThumbnailProps) {
  return (
    <>
      <img className="screenshot-thumbnail" src={screenshot.uri} />
      <button onClick={startEditingScreenshot}>Edit</button>
    </>
  )
}

export function Screenshots({ feedback, startEditingScreenshot }: ScreenshotsProps): null | JSX.Element {
  if (!feedback.screenshots.length) return null

  return (
    <div className="screenshots">
      {feedback.screenshots.map((screenshot, index) => (
        <ScreenshotThumbnail key={screenshot.uri} screenshot={screenshot} startEditingScreenshot={() => startEditingScreenshot({ screenshotIndex: index })} />
      ))}
    </div>
  )
}
