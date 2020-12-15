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

  const iframeRef = React.useRef<HTMLIFrameElement>()

  const authTwitterUrl = `${window.roarServerUrl}/v1/auth/twitter`

  let initialLoadComplete = false // tslint:disable-line:no-let
  let timeout // tslint:disable-line:no-let

  // Add a listener for events posted when twitter OAuth eventually calls back the roar server
  // https://github.com/morehumaninternet/roar-server/blob/3c89ed88fd31a9afea916b38371561c92c711a9f/src/handlers.ts#L94
  React.useEffect(() => {
    function listener(event: any): any {
      if (event.origin !== window.roarServerUrl) {
        return
      }
      if (event.data.type === 'twitter-auth-success') {
        clearTimeout(timeout)
        return authenticationSuccess({ photoUrl: event.data.photoUrl })
      }
      if (event.data.type === 'twitter-auth-failure') {
        return authenticationFailure({ error: { message: 'Login cancelled. Please try again' } })
      }
      throw new Error(`Unexpected message: ${event.data}`)
    }

    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [])

  // A total hack to account for how twitter handles invalid credentials.
  // Unfortunately, Twitter will navigate to a new page that doesn't load in an iframe due to its content security policy.
  // Doubly unfortunately, we can't inspect the location to detect when this has happened.
  // So, we listen for page loads to determine when a new page has loaded to hook into auth may have succeeded (or failed).
  // The first page load is the iframe initially rendering.
  // The next page load is when either we are on the twitter/auth/success page or on a page where auth has failed.
  // So we set a timeout so that if the above listener hasn't fired in 50ms then we consider authentication to have failed.
  function onNextPageLoad(): void {
    iframeRef.current!.style.display = 'none'
    timeout = setTimeout(() => {
      return authenticationFailure({ error: { message: 'Authentication failed. Please try again.' } })
    }, 50)
  }

  function onLoad(): void {
    if (initialLoadComplete) return onNextPageLoad()
    initialLoadComplete = true
  }

  return <iframe ref={iframeRef as any} src={authTwitterUrl} onLoad={onLoad} />
}
