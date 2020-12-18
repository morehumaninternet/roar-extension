import * as React from 'react'
import { CloseButton } from './close-button'

export function Alert({ alertMessage, contactSupport, onClose }: { alertMessage: string; contactSupport?: boolean; onClose(): void }): JSX.Element {
  return (
    <div className="alert">
      <div className="alert-message">
        {alertMessage}
        {contactSupport && (
          <>
            <br />
            <span>
              If this error persists, please contact <a href="mailto:support@morehumaninternet.org">support@morehumaninternet.org</a>
            </span>
          </>
        )}
      </div>
      <CloseButton onClick={onClose} />
    </div>
  )
}
