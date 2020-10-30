import * as React from 'react'
import { Editor, EditorState } from 'draft-js'

type FeedbackEditorProps = {
  editorState: EditorState
  updateEditorState: DispatchUserActions['updateEditorState']
}

export function FeedbackEditor({ editorState, updateEditorState }: FeedbackEditorProps): JSX.Element {
  return <Editor placeholder="What's your feedback?" editorState={editorState} onChange={nextEditorState => updateEditorState(nextEditorState)} />
}
