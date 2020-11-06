import * as React from 'react'
import { Editor, EditorState } from 'draft-js'

type FeedbackEditorProps = {
  editorState: EditorState
  updateEditorState: DispatchUserActions['updateEditorState']
}

const styleMap = {
  'HUMAN-PINK': {
    color: '#fa759e', // TODO - import human pink
  },
}

export function FeedbackEditor({ editorState, updateEditorState }: FeedbackEditorProps): JSX.Element {
  return (
    <Editor
      placeholder="What's your feedback?"
      editorState={editorState}
      onChange={nextEditorState => updateEditorState(nextEditorState)}
      customStyleMap={styleMap}
    />
  )
}
