import * as React from 'react'

export function Tweeting({ at }: { at: string }): JSX.Element {
  return <p className="tweet-in-progress">Tweeting your feedback to {at}</p>
}
