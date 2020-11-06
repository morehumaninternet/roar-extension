// Adapted from https://github.com/davidsemakula/draft-js-emoji-plugin/blob/master/src/modifiers/addEmoji.js
import { Modifier, ContentState, EditorState } from 'draft-js'

export function appendEntity(editorState: EditorState, text: string, type: 'text' | 'emoji' = 'text'): EditorState {
  const contentState = editorState.getCurrentContent()

  const contentStateWithEntity = contentState.createEntity(type, type === 'text' ? 'MUTABLE' : 'IMMUTABLE', {})
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
  const currentSelectionState = editorState.getSelection()

  let addedContent: ContentState // tslint:disable-line:no-let

  // in case text is selected it is removed and then the text is added
  const afterRemovalContentState = Modifier.removeRange(contentState, currentSelectionState, 'backward')

  // deciding on the position to insert text
  const targetSelection = afterRemovalContentState.getSelectionAfter()

  addedContent = Modifier.insertText(afterRemovalContentState, targetSelection, text, undefined, entityKey)

  const endPos = targetSelection.getAnchorOffset()
  const blockKey = targetSelection.getAnchorKey()
  const blockSize = contentState.getBlockForKey(blockKey).getLength()
  // If the emoji is inserted at the end, a space is appended right after for
  // a smooth writing experience.
  if (type === 'emoji' && endPos === blockSize) {
    addedContent = Modifier.insertText(addedContent, addedContent.getSelectionAfter(), ' ')
  }

  const newEditorState = EditorState.push(editorState, addedContent, 'insert-characters')

  return EditorState.forceSelection(newEditorState, addedContent.getSelectionAfter())
}
