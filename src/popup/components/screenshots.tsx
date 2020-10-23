import * as React from 'react'

type ScreenshotThumbnailProps = {
  screenshot: Screenshot
}

// export class ScreenshotThumbnail extends React.Component<ScreenshotThumbnailProps> {
//   render(): JSX.Element {
//     return (
//       <div className="screenshot-thumbnail" style={{ backgroundImage: `url("${this.props.screenshot.uri}")` }}>
//       </div>
//     )
//   }
// }

export class ScreenshotThumbnail extends React.Component<ScreenshotThumbnailProps> {
  render(): JSX.Element {
    return <img className="screenshot-thumbnail" src={this.props.screenshot.uri} />
  }
}

export function Screenshots({ feedback }: { feedback: null | FeedbackState }): null | JSX.Element {
  if (!feedback || !feedback.screenshots.length) return null

  return (
    <div className="screenshots">
      {feedback.screenshots.map(screenshot => (
        <ScreenshotThumbnail key={screenshot.uri} screenshot={screenshot} />
      ))}
    </div>
  )
}
