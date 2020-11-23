import * as React from 'react'

export function Authenticating({ browser, authenticatedViaTwitter }: AuthenticatingState): JSX.Element {
  const authTwitterUrl = `${window.roarServerUrl}/v1/auth/twitter`

  if (browser === 'Chrome') {
    React.useEffect(() => {
      function listener(event: any): any {
        if (event.origin !== window.roarServerUrl) {
          return
        }
        if (event.data.type === 'twitter-auth-success') {
          return authenticatedViaTwitter({ photoUrl: event.data.photoUrl })
        }
        if (event.data.type === 'twitter-auth-failure') {
          throw new Error('TODO: handle this')
        }
        throw new Error(`Unexpected message: ${event.data}`)
      }

      window.addEventListener('message', listener)
      return () => window.removeEventListener('message', listener)
    }, [])

    return <iframe src={authTwitterUrl} />
  } else {
    return <p></p>
  }
}
