import * as React from 'react'

export function Tweeting({ host }: { host: string }): JSX.Element {
  return <p className="tweet-in-progress">Tweeting your feedback for {host}</p>
}
