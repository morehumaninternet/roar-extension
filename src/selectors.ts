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
  return feedbackTarget ? totalImages(feedbackTarget) >= 9 : false
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

function authenticatedStateFeedback(feedbackTarget: null | FeedbackTarget): AuthenticatedState['feedback'] {
  if (!feedbackTarget) {
    return { exists: false, reasonDisabledMessage: null }
  }
  if (feedbackTarget.feedbackTargetType === 'tab' && !feedbackTarget.domain) {
    return { exists: false, reasonDisabledMessage: 'Roar does not work on this tab because it is not a webpage. Please open Roar on a webpage to try again.' }
  }
  return { exists: true, state: feedbackTarget.feedbackState }
}

export function toAppState(popupWindow: Window, storeState: StoreState, dispatchUserActions: Dispatchers<UserAction>): AppState {
  const signInWithTwitter = () => {
    dispatchUserActions.signInWithTwitter()
    popupWindow.close()
  }

  switch (storeState.auth.state) {
    case 'not_authed': {
      return {
        view: 'NotAuthed',
        signInWithTwitter,
      }
    }
    case 'authenticating': {
      return {
        view: 'Authenticating',
        browser: storeState.browserInfo.browser,
        authenticationFailure: dispatchUserActions.authenticationFailure,
        authenticationSuccess: dispatchUserActions.authenticationSuccess,
      }
    }
    case 'authenticated': {
      const feedbackTarget = activeTab(storeState)

      return {
        view: 'Authenticated',
        feedback: authenticatedStateFeedback(feedbackTarget),
        user: storeState.auth.user,
        tweeting: feedbackTarget?.feedbackState.isTweeting ? { at: feedbackTarget.feedbackState.twitterHandle.handle! } : null,
        darkModeOn: storeState.darkModeOn,
        pickingEmoji: storeState.pickingEmoji,
        addImageDisabled: addImageDisabled(feedbackTarget),
        postTweetDisabled: postTweetDisabled(feedbackTarget),
        characterLimit: getCharacterLimit(feedbackTarget),
        dispatchUserActions,
      }
    }
  }
}
