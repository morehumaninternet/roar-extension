import * as React from 'react'
import { RoarLogo } from './roar-logo'

export function Tweeting({ at }: { at: string }): JSX.Element {
  return (
    <div className="tweeting">
      <div className="tweeting-logo-container">
        <RoarLogo />
      </div>
      <div className="tweet-in-progress">Tweeting your feedback to {at}</div>
      <div className="tweeting-spinner"></div>
    </div>
  )
}
