import * as React from 'react'

export function Authenticating({ authenticatedViaTwitter }: Pick<Dispatch<UserAction>, 'authenticatedViaTwitter'>): JSX.Element {
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

  return <iframe src={`${window.roarServerUrl}/v1/auth/twitter`} allow="*" />
}
