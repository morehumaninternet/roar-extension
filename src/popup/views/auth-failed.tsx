import * as React from 'react'

// TODO: style this page
export function AuthFailed({ signInWithTwitter }: Pick<Dispatchers<UserAction>, 'signInWithTwitter'>): JSX.Element {
  return (
    <div>
      Auth Failed
      <button onClick={signInWithTwitter}>Sign in with twitter</button>
    </div>
  )
}