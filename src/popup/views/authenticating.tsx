import * as React from 'react'

export function Authenticating({ browser, authenticationSuccess, authenticationFailure }: AuthenticatingState): JSX.Element {
  return <div className="authenticating-spinner" />
}
