import * as React from 'react'

export function NotAuthed({ signInWithTwitter }: Pick<Dispatchers<UserAction>, 'signInWithTwitter'>): JSX.Element {
  return <button onClick={signInWithTwitter}>Sign in with twitter</button>
}
