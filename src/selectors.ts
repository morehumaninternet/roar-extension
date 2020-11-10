type ActiveTab = TabInfo & { isTweeting: boolean }

export function activeTab(state: AppState): null | ActiveTab {
  for (const tab of state.tabs.values()) {
    if (tab.windowId === state.focusedWindowId && tab.active) {
      const isTweeting = tab.id === state.tweeting?.tab.id
      return { ...tab, isTweeting }
    }
  }
  return null
}

export function ensureActiveTab(state: AppState): ActiveTab {
  const tab = activeTab(state)
  if (tab) return tab
  throw new Error('Active tab should exist')
}
