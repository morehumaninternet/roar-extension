import * as React from 'react'
import { CloseButton } from './close-button'

type AlertProps = {
  alertMessage: string | ReadonlyArray<string>
  additionalClassName?: string
  contactSupport?: boolean
  onClose(): void
}

export function Alert({ additionalClassName, alertMessage, contactSupport, onClose }: AlertProps): JSX.Element {
  const messages = Array.isArray(alertMessage) ? alertMessage : [alertMessage]

  return (
    <div className={`alert ${additionalClassName || ''}`}>
      <div className="alert-message">
        {messages.map(m => (
          <div key={m}>{m}</div>
        ))}
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
