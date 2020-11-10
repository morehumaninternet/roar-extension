import * as React from 'react'

type TweetingProps = {
  tweeting: Tweeting
  followTweetLink(): void
}

export function Tweeting({ tweeting, followTweetLink }: TweetingProps): JSX.Element {
  switch (tweeting.state) {
    case 'NEW':
    case 'IN_PROGRESS':
      return <p className="tweet-in-progress">Tweeting...</p>
    default:
      return (
        <a className="your-tweet" href={tweeting.tweetUrl} target="_blank" onClick={followTweetLink}>
          See your tweet
        </a>
      )
  }
}
