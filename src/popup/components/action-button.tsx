import * as React from 'react'
import * as svgs from './action-svgs'

type ActionButtonKind = keyof typeof svgs

type ActionButtonProps = { kind: ActionButtonKind; onClick(): void; disabled?: boolean }

export function ActionButton({ kind, onClick, disabled }: ActionButtonProps): JSX.Element {
  return (
    <button className={`svg-btn ${kind}`} onClick={onClick} disabled={disabled}>
      {svgs[kind]}
    </button>
  )
}
