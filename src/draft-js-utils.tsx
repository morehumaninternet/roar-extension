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

export function prependHandle(editorState: EditorState, handle: string): EditorState {
  if (!handle.startsWith('@')) {
    throw new Error('handle must start with @')
  }

  const currentContent = editorState.getCurrentContent()

  // Select position 0 (anchor) of the first line (block)
  const firstBlockKey = currentContent.getFirstBlock().getKey()
  const currentSelection = editorState.getSelection()
  const startSelection = currentSelection.merge({
    anchorOffset: 0,
    anchorKey: firstBlockKey,
  })

  // Insert the handle to the Tweet
  const handleContentState = Modifier.insertText(currentContent, startSelection, `${handle} `)

  // Select the handle and color it
  // Twitter handle limit is 15 so we can safely assume that the handle is still in the first block
  const handleSelection = startSelection.merge({
    focusOffset: handle.length,
    focusKey: firstBlockKey,
  })

  const coloredContentState = Modifier.applyInlineStyle(handleContentState, handleSelection, 'HUMAN-PINK')

  return EditorState.moveSelectionToEnd(EditorState.createWithContent(coloredContentState))
}

export function replaceHandle(editorState: EditorState, handle: string): EditorState {
  const text: string = getPlainText(editorState)

  if (!text.startsWith('@')) {
    throw new Error('editorState text must start with @')
  }

  const restOfTheText: string = text.split(' ').slice(1).join(' ')

  return prependHandle(fromText(restOfTheText), handle)
}

export function addTooltip(editorState: EditorState, regex: RegExp): EditorState {
  function findWithRegex(regex: RegExp, contentBlock: ContentBlock, callback: (start: number, end: number) => void): any {
    const text = contentBlock.getText()
    // tslint:disable: no-let
    let matchArr: Maybe<RegExpExecArray>
    let start: number
    // tslint:enable: no-let
    while ((matchArr = regex.exec(text)) !== null) {
      start = matchArr.index
      callback(start, start + matchArr[0].length)
    }
  }

  function handleStrategy(contentBlock: ContentBlock, callback: (start: number, end: number) => void): any {
    findWithRegex(regex, contentBlock, callback)
  }

  const HandleSpan = ({ children }): JSX.Element => {
    return <span className="tooltip-hover-element"> {children} </span>
  }

  const tooltipDecorator = new CompositeDecorator([{ strategy: handleStrategy, component: HandleSpan }])

  return EditorState.set(editorState, { decorator: tooltipDecorator })
}
