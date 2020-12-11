import * as React from 'react'
import { Editor, EditorState } from 'draft-js'
import { hasParent } from '../../utils'
import ToolTip from './tooltip'

type FeedbackEditorProps = {
  editorState: EditorState
  hovering: FeedbackState['hovering']
  updateEditorState: Dispatchers<UserAction>['updateEditorState']
  hoverOver: Dispatchers<UserAction>['hoverOver']
  twitterHandle: FeedbackState['twitterHandle']
}

const styleMap = {
  'HUMAN-PINK': {
    color: '#fa759e', // TODO - import human pink
  },
}

export function FeedbackEditor({ editorState, hovering, updateEditorState, hoverOver, twitterHandle }: FeedbackEditorProps): JSX.Element {
  React.useEffect(() => {
    const listener = event => {
      if (hasParent(event.target, '.twitter-handle')) {
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

  return (
    <>
      <Editor
        placeholder="What's your feedback?"
        editorState={editorState}
        onChange={editorState => updateEditorState({ editorState })}
        customStyleMap={styleMap}
      />
      <ToolTip visible={hovering.active} hovering={hovering} twitterHandle={twitterHandle} />
    </>
  )
}
