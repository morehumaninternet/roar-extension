import * as React from 'react'

export function Tweeting({ at }: { at: string }): JSX.Element {
  return (
    <div className="tweeting">
      <div className="tweeting-logo-container">
        <img className="tweeting-logo" src="/img/roar_128.png"></img>
      </div>
      <div className="tweet-in-progress">Tweeting your feedback to {at}</div>
      <div className="tweeting-spinner"></div>
    </div>
  )
}
