import * as React from 'react'

type TweetingProps = {
  tweeting: Tweeting
}

export function Tweeting({ tweeting }: TweetingProps): JSX.Element {
  return <p className="tweet-in-progress">Tweeting...</p>
}
