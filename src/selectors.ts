export function activeTab(state: AppState): null | TabInfo {
  for (const tab of state.tabs.values()) {
    if (tab.windowId === state.focusedWindowId && tab.active) return tab
  }
  return null
}

export function ensureActiveTab(state: AppState): TabInfo {
  const tab = activeTab(state)
  if (tab) return tab
  throw new Error('Active tab should exist')
}
