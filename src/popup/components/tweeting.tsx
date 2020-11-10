import * as React from 'react'

type TweetingProps = {
  tweeting: Tweeting
  clickTweet(): void
}

export function Tweeting({ tweeting, clickTweet }: TweetingProps): JSX.Element {
  switch (tweeting.state) {
    case 'NEW':
    case 'IN_PROGRESS':
      return <p className="tweet-in-progress">Tweeting...</p>
    default:
      return (
        <a className="your-tweet" href={tweeting.tweetUrl} target="_blank" onClick={clickTweet}>
          See your tweet
        </a>
      )
  }
}
