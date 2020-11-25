import * as React from 'react'

export function Authenticating({ browser, authenticationSuccess, authenticationFailure }: AuthenticatingState): JSX.Element {
  // See src/background/api.ts and src/background/listeners.ts
  // On Firefox authentication takes place outside the popup, so this state occurs
  // when the extension is actively running detectLogin to determine whether the user
  // is logged in, which will transition them into either an authenticated state or an
  // auth_failed state.
  if (browser === 'Firefox') {
    return <div className="authenticating-spinner" />
  }

  const authTwitterUrl = `${window.roarServerUrl}/v1/auth/twitter`

  React.useEffect(() => {
    function listener(event: any): any {
      if (event.origin !== window.roarServerUrl) {
        return
      }
      if (event.data.type === 'twitter-auth-success') {
        return authenticationSuccess({ photoUrl: event.data.photoUrl })
      }
      if (event.data.type === 'twitter-auth-failure') {
        return authenticationFailure({ error: { message: 'Invalid credentials. Please try again.' } })
      }
      throw new Error(`Unexpected message: ${event.data}`)
    }

    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [])

  return <iframe src={authTwitterUrl} />
}
