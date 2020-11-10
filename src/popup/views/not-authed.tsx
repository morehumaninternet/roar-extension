import * as React from 'react'

export function NotAuthed({ signInWithTwitter }: Pick<Dispatch<UserAction>, 'signInWithTwitter'>): JSX.Element {
  return <button onClick={signInWithTwitter}>Sign in with twitter</button>
}
