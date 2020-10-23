import * as React from 'react'
import { Editor, EditorState } from 'draft-js'

export function FeedbackEditor(): JSX.Element {
  const [editorState, setEditorState] = React.useState(EditorState.createEmpty())
  return <Editor placeholder="What's your feedback?" editorState={editorState} onChange={setEditorState} />
}
