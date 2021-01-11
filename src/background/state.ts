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
    matchingUrl: null,
    isActualAccount: false,
  },
})

export const newFeedbackState = ({ hostname }: { hostname?: string }): FeedbackState => {
  const empty = emptyFeedbackState()
  if (!hostname) return empty
  const hostnameHandle = `@${hostname}`
  return {
    ...empty,
    editorState: prependHandle(empty.editorState, hostnameHandle),
    twitterHandle: {
      status: 'NEW',
      handle: hostnameHandle,
      matchingUrl: null,
      isActualAccount: false,
    },
  }
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
