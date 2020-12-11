// Adapted from https://github.com/davidsemakula/draft-js-emoji-plugin/blob/master/src/modifiers/addEmoji.js
import * as React from 'react'
import { Modifier, ContentState, EditorState, CompositeDecorator, ContentBlock } from 'draft-js'

export function getPlainText(editorState: EditorState): string {
  return editorState.getCurrentContent().getPlainText('\u0001')
}

export function getLength(editorState: EditorState): number {
  return getPlainText(editorState).length
}

export function fromText(text: string): EditorState {
  return EditorState.createWithContent(ContentState.createFromText(text))
}

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

// A twitter-handle component that wraps around the span passed to it
const HandleSpan = ({ children }): JSX.Element => <span className="twitter-handle">{children}</span>

// Adds the provided handle as an immutable entity at the start of the provided editorState.
// Sets a handle decorator which wraps handle entities in a span.twitter-handle so that we may
// Style them and provide associated tooltips
export function prependHandle(editorState: EditorState, handle: string): EditorState {
  if (!handle.startsWith('@')) {
    throw new Error('handle must start with @')
  }

  const startingContentState = editorState.getCurrentContent()
  const contentStateWithEntity = startingContentState.createEntity('handle', 'IMMUTABLE', {})
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
  const currentSelection = editorState.getSelection()
  const firstBlockKey = startingContentState.getFirstBlock().getKey()
  const startSelection = currentSelection.merge({ anchorOffset: 0, anchorKey: firstBlockKey })

  // Insert the handle with the specified entity key
  const contentStateWithHandle = Modifier.insertText(startingContentState, startSelection, handle, undefined, entityKey)
  const contentStateWithTrailingSpace = Modifier.insertText(contentStateWithHandle, contentStateWithHandle.getSelectionAfter(), ' ')
  const editorStateWithLatestContent = EditorState.moveSelectionToEnd(EditorState.createWithContent(contentStateWithTrailingSpace))

  // Find the 'handle' entities of the content block, calling each back
  function handleStrategy(contentBlock: ContentBlock, callback: (start: number, end: number) => void): any {
    contentBlock.findEntityRanges(characterMetadata => {
      const entityKey = characterMetadata.getEntity()
      if (!entityKey) return false
      const entity = contentStateWithTrailingSpace.getEntity(entityKey)
      return entity.getType() === 'handle'
    }, callback)
  }

  const handleDecorator = new CompositeDecorator([{ strategy: handleStrategy, component: HandleSpan }])

  return EditorState.set(editorStateWithLatestContent, {
    decorator: handleDecorator,
  })
}

export function replaceHandle(editorState: EditorState, handle: string): EditorState {
  const text: string = getPlainText(editorState)

  if (!text.startsWith('@')) {
    throw new Error('editorState text must start with @')
  }

  const restOfTheText: string = text.split(' ').slice(1).join(' ')

  return prependHandle(fromText(restOfTheText), handle)
}
