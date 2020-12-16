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

export function targetById(state: StoreState, targetId: FeedbackTargetId): Maybe<FeedbackTarget> {
  return targetId === 'help' ? state.help : state.tabs.get(targetId)
}

export function activeFeedbackTarget(state: StoreState): null | FeedbackTarget {
  if (state.help.on) return state.help
  return activeTab(state)
}

export function ensureActiveFeedbackTarget(state: StoreState): FeedbackTarget {
  if (state.help.on) return state.help
  return ensureActiveTab(state)
}

export function totalImages(feedbackTarget: FeedbackTarget): number {
  const { addingImages, images } = feedbackTarget.feedbackState
  return addingImages + images.length
}

export function addImageDisabled(feedbackTarget: null | FeedbackTarget): boolean {
  return feedbackTarget ? totalImages(feedbackTarget) >= 9 : false
}

export function postTweetDisabled(feedbackTarget: null | FeedbackTarget): boolean {
  return getCharacterLimit(feedbackTarget).remaining < 0
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
    if (storeState.browserInfo.browser === 'Firefox') {
      popupWindow.close()
    }
  }

  switch (storeState.auth.state) {
    case 'not_authed': {
      return {
        view: 'NotAuthed',
        signInWithTwitter,
      }
    }
    case 'auth_failed': {
      return {
        view: 'AuthFailed',
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
      const feedbackTarget = activeFeedbackTarget(storeState)!
      const hostWithoutHandle = '@site.com'
      const transitionHandle = feedbackTarget.feedbackState.twitterHandle.handle ? feedbackTarget.feedbackState.twitterHandle.handle : hostWithoutHandle

      return {
        view: 'Authenticated',
        feedback: authenticatedStateFeedback(feedbackTarget),
        user: storeState.auth.user,
        tweeting: feedbackTarget?.feedbackState.isTweeting ? { at: transitionHandle } : null,
        darkModeOn: storeState.darkModeOn,
        helpOn: storeState.help.on,
        pickingEmoji: storeState.pickingEmoji,
        addImageDisabled: addImageDisabled(feedbackTarget),
        postTweetDisabled: postTweetDisabled(feedbackTarget),
        characterLimit: getCharacterLimit(feedbackTarget),
        dispatchUserActions,
      }
    }
  }
}
