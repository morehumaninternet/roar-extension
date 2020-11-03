import * as React from 'react'
import * as svgs from './action-svgs'

type ActionButtonKind = keyof typeof svgs

export function ActionButton({ kind, onClick }: { kind: ActionButtonKind; onClick(): void }) {
  return (
    <button className="svg-btn" onClick={onClick}>
      {svgs[kind]}
    </button>
  )
}
