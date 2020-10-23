export function activeFeedback(state: AppState): null | FeedbackState {
  if (!state.popup.connected) return null
  if (!state.popup.activeTab) return null

  const activeTabId = state.popup.activeTab.id
  if (!activeTabId) return null
  return state.feedbackByTabId[activeTabId] || null
}
