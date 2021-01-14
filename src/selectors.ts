import { getLength } from './draft-js-utils'

export function activeTab(state: StoreState): null | TabInfo {
  for (const tab of state.tabs.values()) {
    if (tab.windowId === state.focusedWindowId && tab.active) return tab
  }
  return null
}

export function ensureActiveTab(state: StoreState): TabInfo {
  const tab = activeTab(state)
  if (tab) return tab
  throw new Error('Active tab should exist')
}

export function tabById(state: StoreState, targetId: FeedbackTargetId): Maybe<FeedbackTarget> {
  return state.tabs.get(targetId)
}

export function totalImages(feedbackTarget: FeedbackTarget): number {
  const { addingImages, images } = feedbackTarget.feedbackState
  return addingImages + images.length
}

export function addImageDisabled(feedbackTarget: null | FeedbackTarget): boolean {
  return feedbackTarget ? totalImages(feedbackTarget) >= 4 : false
}

export function postTweetDisabled(feedbackTarget: null | FeedbackTarget): boolean {
  return !!feedbackTarget && (getLength(feedbackTarget.feedbackState.editorState) === 0 || getCharacterLimit(feedbackTarget).remaining < 0)
}

export function getCharacterLimit(feedbackTarget: null | FeedbackTarget): CharacterLimit {
  const maxTweetLength = 280
  const currentTweetLength = feedbackTarget ? getLength(feedbackTarget.feedbackState.editorState) : 0
  const remaining = maxTweetLength - currentTweetLength
  const percentageCompleted = (1 - remaining / maxTweetLength) * 100
  return { remaining, percentageCompleted }
}

export function toAppState(popupWindow: Window, storeState: StoreState, dispatchUserActions: Dispatchers<UserAction>): AppState {
  const feedbackTarget = activeTab(storeState)
  if (feedbackTarget) {
    if (feedbackTarget.feedbackTargetType === 'tab' && !feedbackTarget.parsedUrl) {
      return { view: 'NotWebPage' }
    }
  }

  switch (storeState.auth.state) {
    case 'not_authed': {
      return {
        view: 'NotAuthed',
        signInWithTwitter: dispatchUserActions.signInWithTwitter,
      }
    }
    case 'detectLogin': {
      return {
        view: 'Authenticating',
      }
    }
    case 'authenticated': {
      return {
        view: 'Authenticated',
        feedback: feedbackTarget?.feedbackState,
        user: storeState.auth.user,
        darkModeOn: storeState.darkModeOn,
        pickingEmoji: storeState.pickingEmoji,
        addImageDisabled: addImageDisabled(feedbackTarget),
        postTweetDisabled: postTweetDisabled(feedbackTarget),
        characterLimit: getCharacterLimit(feedbackTarget),
        websiteFetched: feedbackTarget ? typeof feedbackTarget.website === 'object' : false,
        dispatchUserActions,
      }
    }
  }
}
