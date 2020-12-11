import * as React from 'react'

const LaunchIcon = (): JSX.Element => {
  return (
    <svg viewBox="0 0 24 24" className="link-tooltip__launch-icon">
      <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
    </svg>
  )
}

const TwitterLink = ({ handle }: { handle: string }): JSX.Element => {
  const url = `twitter.com/${handle.slice(1)}`
  const withProtocol = `https://${url}`
  return (
    <a className="link-tooltip__anchor" href={withProtocol} target="_blank" rel="noopener noreferrer">
      {url}
      <LaunchIcon />
    </a>
  )
}

type ToolTipProps = {
  visible: boolean
  hovering: FeedbackState['hovering']
  twitterHandle: FeedbackState['twitterHandle']
}

const ToolTip = ({ visible, hovering, twitterHandle }: ToolTipProps): JSX.Element | null => {
  return visible ? (
    <div
      className="link-tooltip"
      style={{
        height: hovering.height,
        width: hovering.width,
        top: hovering.top,
        left: hovering.left,
      }}
    >
      {twitterHandle.handle ? (
        <TwitterLink handle={twitterHandle.handle} />
      ) : (
        <div className="link-tooltip__error">{twitterHandle.status === 'DONE' ? 'No twitter account could be found' : 'Searching for twitter account...'}</div>
      )}
    </div>
  ) : null
}

export default ToolTip
