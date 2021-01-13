import { Map } from 'immutable'
import { ContentState, EditorState } from 'draft-js'
import { prependHandle } from '../draft-js-utils'

export const emptyFeedbackState = (): FeedbackState => ({
  isTweeting: false,
  takeAutoSnapshot: true,
  addingImages: 0,
  editingImage: null,
  images: [],
  hovering: {
    active: false,
    top: 0,
    left: 0,
    height: 0,
    width: 0,
  },
  editorState: EditorState.createEmpty(),
  twitterHandle: {
    handle: '@mhi-roar-placeholder',
  },
})

export const feedbackStateWithHandle = (twitterHandle: TwitterHandleState): FeedbackState => {
  const empty = emptyFeedbackState()
  return {
    ...empty,
    editorState: prependHandle(empty.editorState, twitterHandle.handle),
    twitterHandle,
  }
}

export const newFeedbackState = ({ domain }: { domain?: string }): FeedbackState => {
  return domain ? feedbackStateWithHandle({ handle: `@${domain}` }) : emptyFeedbackState()
}

export const newStoreState = (): StoreState => ({
  popupConnected: false,
  focusedWindowId: -1,
  tabs: Map(),
  auth: { state: 'not_authed' },
  pickingEmoji: false,
  darkModeOn: false,
  alert: null,
  mostRecentAction: { type: 'INITIALIZING' },
})
