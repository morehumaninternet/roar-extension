import * as React from 'react'
import * as svgs from './action-svgs'

type ActionButtonKind = keyof typeof svgs

type ActionButtonProps = {
  kind: ActionButtonKind
  onClick(): void
  disabled?: boolean
  additionalClassNames?: string
}

export function ActionButton({ kind, onClick, disabled, additionalClassNames }: ActionButtonProps): JSX.Element {
  return (
    <div className="svg-btn-container">
      <button className={`svg-btn ${kind} ${additionalClassNames || ''}`} onClick={onClick} disabled={disabled}>
        {svgs[kind]}
      </button>
    </div>
  )
}
