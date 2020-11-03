export function activeTab(state: AppState): TabInfo {
  for (const tab of state.tabs.values()) {
    if (tab.windowId === state.focusedWindowId && tab.active) return tab
  }
  throw new Error('No active tab found')
}
