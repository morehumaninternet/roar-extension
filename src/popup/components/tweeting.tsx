import * as React from 'react'

export function Tweeting({ domain }: { domain: string }): JSX.Element {
  return <p className="tweet-in-progress">Tweeting your feedback for {domain}</p>
}
