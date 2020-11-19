import { EditorState } from 'draft-js'
import { prependHandle } from '../draft-js-utils'

const roarTwitterHandle = '@roarmhi'

export const emptyFeedbackState = (): FeedbackState => ({
  isTweeting: false,
  editingScreenshot: null,
  screenshots: [],
  editorState: EditorState.createEmpty(),
  twitterHandle: { status: 'NEW', handle: null },
})

export const emptyHelpFeedbackState = (): FeedbackState => ({
  isTweeting: false,
  editingScreenshot: null,
  screenshots: [],
  editorState: prependHandle(EditorState.createEmpty(), roarTwitterHandle),
  twitterHandle: { status: 'DONE', handle: roarTwitterHandle },
})

export const newFeedbackState = ({ domain }: { domain?: string; help?: boolean }): FeedbackState => {
  const empty = emptyFeedbackState()
  if (!domain) return empty
  return {
    ...empty,
    editorState: prependHandle(empty.editorState, `@${domain}`),
  }
}
