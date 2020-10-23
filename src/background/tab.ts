export async function checkActiveTab(tabs: typeof browser.tabs, dispatchBackgroundActions: DispatchBackgroundActions): Promise<void> {
  const activeTabs = await tabs.query({
    active: true,
    currentWindow: true
  })

  const [activeTab] = activeTabs

  if (!activeTab) {
    return dispatchBackgroundActions.noActiveTabDetected()
  }

  const disabledForTab = activeTab.url ? !activeTab.url.startsWith('http') : false

  dispatchBackgroundActions.activeTabDetected(activeTab, disabledForTab)
}
