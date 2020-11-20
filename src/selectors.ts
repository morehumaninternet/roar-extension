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

export function addImageDisabled(feedbackTarget: null | FeedbackTarget): boolean {
  if (!feedbackTarget) return false
  const { addingImages, images } = feedbackTarget.feedbackState
  return addingImages + images.length >= 9
}

export function deleteImageDisabled(feedbackTarget: null | FeedbackTarget): boolean {
  if (!feedbackTarget) return false
  return feedbackTarget.feedbackState.images.length <= 1
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

export function toAppState(storeState: StoreState, dispatchUserActions: Dispatchers<UserAction>): AppState {
  switch (storeState.auth.state) {
    case 'not_authed': {
      return {
        view: 'NotAuthed',
        signInWithTwitter: dispatchUserActions.signInWithTwitter,
      }
    }
    case 'authenticating': {
      return {
        view: 'Authenticating',
        authenticatedViaTwitter: dispatchUserActions.authenticatedViaTwitter,
      }
    }
    case 'authenticated': {
      const feedbackTarget = activeFeedbackTarget(storeState)

      return {
        view: 'Authenticated',
        feedback: authenticatedStateFeedback(feedbackTarget),
        user: storeState.auth.user,
        tweeting: feedbackTarget?.feedbackState.isTweeting ? { at: feedbackTarget.feedbackState.twitterHandle.handle! } : null,
        helpOn: storeState.help.on,
        pickingEmoji: storeState.pickingEmoji,
        addImageDisabled: addImageDisabled(feedbackTarget),
        deleteImageDisabled: deleteImageDisabled(feedbackTarget),
        dispatchUserActions,
      }
    }
  }
}
