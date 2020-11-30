import * as React from 'react'

export function Tweeting({ at }: { at: string }): JSX.Element {
  return (
    <>
      <>
        <div className="tweeting-box">
          <img className="tweeting-roar" src="../../../img/roar_128.png"></img>
        </div>
        <p className="tweet-in-progress">Tweeting your feedback to {at}</p>
      </>
      <div className="tweeting-spinner"></div>
    </>
  )
}
