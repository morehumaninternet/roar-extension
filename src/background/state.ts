import { Map } from 'immutable'
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

export const emptyHelpState = (): StoreState['help'] => ({
  feedbackTargetType: 'help',
  on: false,
  feedbackState: emptyHelpFeedbackState(),
})

export const newFeedbackState = ({ domain }: { domain?: string }): FeedbackState => {
  const empty = emptyFeedbackState()
  if (!domain) return empty
  return {
    ...empty,
    editorState: prependHandle(empty.editorState, `@${domain}`),
  }
}

export const emptyStoreState = (): StoreState => ({
  focusedWindowId: -1,
  tabs: Map(),
  auth: { state: 'not_authed' },
  pickingEmoji: false,
  help: emptyHelpState(),
  alert: null,
  mostRecentAction: { type: 'INITIALIZING' },
})
