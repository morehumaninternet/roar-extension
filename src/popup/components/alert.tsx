import * as React from 'react'
import { CloseButton } from './close-button'

export function Alert({ alertHtml, onClose }: { alertHtml: string; onClose(): void }): JSX.Element {
  return (
    <div className="alert">
      <div className="alert-message" dangerouslySetInnerHTML={{ __html: alertHtml }} />
      <CloseButton onClick={onClose} />
    </div>
  )
}
