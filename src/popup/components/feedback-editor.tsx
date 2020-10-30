import * as React from 'react'
import { Editor, EditorState } from 'draft-js'

export function FeedbackEditor(props: any): JSX.Element {
  return <Editor placeholder="What's your feedback?" editorState={props.editorState} onChange={props.setEditorState} />
}
