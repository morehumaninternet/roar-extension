import * as React from 'react'
import { Editor, EditorState } from 'draft-js'
import { hasParent } from '../../utils'
import { addTooltip } from '../../draft-js-utils'

type FeedbackEditorProps = {
  editorState: EditorState
  hovering: FeedbackState['hovering']
  updateEditorState: Dispatchers<UserAction>['updateEditorState']
  hoverOver: Dispatchers<UserAction>['hoverOver']
  handle: Maybe<string>
}

const styleMap = {
  'HUMAN-PINK': {
    color: '#fa759e', // TODO - import human pink
  },
}

const LaunchIcon = (): JSX.Element => {
  return (
    <svg viewBox="0 0 24 24" className="link-tooltip__launch-icon">
      <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
    </svg>
  )
}

const TwitterLink = ({ handle }: { handle: string }): JSX.Element => {
  const url = `twitter.com/${handle.slice(1)}`
  const withProtocol = `https://${url}`
  return (
    <a className="link-tooltip__anchor" href={withProtocol} target="_blank" rel="noopener noreferrer">
      {url}
      <LaunchIcon />
    </a>
  )
}

export function FeedbackEditor({ editorState, hovering, updateEditorState, hoverOver, handle }: FeedbackEditorProps): JSX.Element {
  const HANDLE_REGEX = /\@[\w\.\-]+/g

  React.useEffect(() => {
    const listener = event => {
      if (hasParent(event.target, '.tooltip-hover-element')) {
        const hoverElement = event.target as HTMLElement
        const { height, width, top, left } = hoverElement.getBoundingClientRect()
        hoverOver({ hovering: { active: true, height, width, top, left } })
      } else if (!hasParent(event.target, '.link-tooltip')) {
        hoverOver({ hovering: { active: false } })
      }
    }

    window.addEventListener('mouseover', listener)
    return () => window.removeEventListener('mouseover', listener)
  })

  const nextEditorState = addTooltip(editorState, HANDLE_REGEX)

  return (
    <>
      <Editor
        placeholder="What's your feedback?"
        editorState={nextEditorState}
        onChange={editorState => updateEditorState({ editorState })}
        customStyleMap={styleMap}
      />
      {hovering.active && !!handle && (
        <div
          className="link-tooltip"
          style={{
            height: hovering.height,
            width: hovering.width,
            top: hovering.top,
            left: hovering.left,
          }}
        >
          <TwitterLink handle={handle!} />
        </div>
      )}
    </>
  )
}

// TODO - write tests
// TODO - test the we don't show the tooltip if we can't find a handle and we only have a domain
// TODO - test what happens when the handle doesn't exist yet (the status is IN_PROGRESS)
