import * as React from 'react'
import { Alert } from '../components/alert'

export function NotWebPage(): JSX.Element {
  return (
    <Alert
      additionalClassName="whole-page"
      alertMessage={['Roar does not work on this tab because it is not a web page.', 'Please open Roar on a web page to try again.']}
      onClose={window.close}
    />
  )
}
