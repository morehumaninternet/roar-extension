import { EditorState } from 'draft-js'
import { prependHandle } from '../draft-js-utils'

const roarTwitterHandle = '@roarmhi'

export const emptyFeedbackState = (): FeedbackState => ({
  editingScreenshot: null,
  screenshots: [],
  editorState: EditorState.createEmpty(),
  domainTwitterHandle: { status: 'NEW', handle: null },
})

export const emptyExtensionFeedbackState = (): FeedbackState => ({
  editingScreenshot: null,
  screenshots: [],
  editorState: prependHandle(EditorState.createEmpty(), roarTwitterHandle),
  domainTwitterHandle: { status: 'DONE', handle: roarTwitterHandle },
})

export const newFeedbackState = ({ domain }: { domain?: string; help?: boolean }): FeedbackState => {
  const empty = emptyFeedbackState()
  if (!domain) return empty
  return {
    ...empty,
    editorState: prependHandle(empty.editorState, `@${domain}`),
  }
}
