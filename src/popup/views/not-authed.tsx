import * as React from 'react'

export function NotAuthed({ signInWithTwitter }: Pick<DispatchUserActions, 'signInWithTwitter'>): JSX.Element {
  return <button onClick={signInWithTwitter}>Sign in with twitter</button>
}
