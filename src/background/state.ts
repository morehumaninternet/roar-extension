import { Map } from 'immutable'
import { EditorState } from 'draft-js'
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
    status: 'NEW',
    handle: '@mhi-roar-placeholder',
    isActualAccount: false,
  },
})

export const newFeedbackState = ({ domain }: { domain?: string }): FeedbackState => {
  const empty = emptyFeedbackState()
  if (!domain) return empty
  const domainHandle = `@${domain}`
  return {
    ...empty,
    editorState: prependHandle(empty.editorState, domainHandle),
    twitterHandle: {
      status: 'NEW',
      handle: domainHandle,
      isActualAccount: false,
    },
  }
}

export const newStoreState = (browserInfo: BrowserInfo): StoreState => ({
  browserInfo,
  focusedWindowId: -1,
  tabs: Map(),
  auth: { state: 'not_authed' },
  pickingEmoji: false,
  darkModeOn: false,
  alert: null,
  mostRecentAction: { type: 'INITIALIZING' },
})
