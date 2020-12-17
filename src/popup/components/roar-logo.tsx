import * as React from 'react'

export function RoarLogo(): JSX.Element {
  return (
    <svg className="roar-logo" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        className="mouth"
        d="M11.6364 2.9406C11.6364 7.74314 9.03147 11.6364 5.81818 11.6364C2.60489 11.6364 0 7.74314 0 2.9406C0 -1.86193 2.42468 0.663665 5.63797 0.663665C8.85126 0.663665 11.6364 -1.86193 11.6364 2.9406Z"
      />
      <path
        className="tongue"
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M1.49316 8.76258C1.71286 7.10936 3.57295 5.81836 5.83509 5.81836C8.09722 5.81836 9.95732 7.10936 10.177 8.76258C9.11151 10.5262 7.56106 11.6366 5.83509 11.6366C4.10911 11.6366 2.55867 10.5262 1.49316 8.76258Z"
      />
    </svg>
  )
}
