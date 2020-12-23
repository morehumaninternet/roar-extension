import * as React from 'react'

// Typescript complains about props: {}
export function Authenticating(_props: object): JSX.Element {
  return <div className="authenticating-spinner" />
}
