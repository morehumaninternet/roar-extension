import { EditorState } from 'draft-js'
import { ensureActiveTab } from '../selectors'
import { appendEntity, appendHandle } from '../draft-js-utils'

const emptyFeedbackState = (): FeedbackState => {
  return {
    editingScreenshot: null,
    screenshots: [],
    editorState: EditorState.createEmpty(),
    hostTwitterHandle: {
      status: 'NEW',
      handle: null,
    },
  }
}

const newTabInfo = (tab: chrome.tabs.Tab): TabInfo => ({
  id: tab.id!,
  windowId: tab.windowId!,
  active: tab.active,
  isTweeting: false,
  url: tab.url,
  host: tab.url && tab.url.startsWith('http') ? new URL(tab.url).host : undefined,
  feedbackState: emptyFeedbackState(),
})

export const responders: Responders<Action> = {
  popupConnect(): Partial<AppState> {
    return {}
  },
  popupDisconnect(): Partial<AppState> {
    return { pickingEmoji: false, alert: null } // closing the popup dismisses any alert
  },
  signInWithTwitter(): Partial<AppState> {
    return { auth: { state: 'authenticating' } }
  },
  authenticatedViaTwitter(state, { photoUrl }): Partial<AppState> {
    return { auth: { state: 'authenticated', user: { photoUrl } } }
  },
  dismissAlert(): Partial<AppState> {
    return { alert: null }
  },
  togglePickingEmoji(state): Partial<AppState> {
    return {
      pickingEmoji: !state.pickingEmoji,
    }
  },
  emojiPicked(state, { emoji }): Partial<AppState> {
    const tab = ensureActiveTab(state)

    const nextEditorState = appendEntity(tab.feedbackState.editorState, emoji, 'emoji')

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        ...tab.feedbackState,
        editorState: nextEditorState,
      },
    })

    return { tabs: nextTabs, pickingEmoji: false }
  },
  updateEditorState(state, { editorState }): Partial<AppState> {
    const tab = ensureActiveTab(state)

    const handle = tab.feedbackState.hostTwitterHandle.handle
    const status = editorState.getCurrentContent().getPlainText('\u0001')

    // If the new editor state doesn't start with the handle, don't update the store.
    // This makes the handle static (not editable)
    if (handle && !status.startsWith(`${handle} `)) return {}

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        ...tab.feedbackState,
        editorState,
      },
    })

    return { tabs: nextTabs }
  },
  clickTakeScreenshot(): Partial<AppState> {
    return {}
  },
  clickPost(state): Partial<AppState> {
    const tab = ensureActiveTab(state)
    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, { ...tab, isTweeting: true })
    return { tabs: nextTabs }
  },
  fetchHandleStart(state, { tabId }): Partial<AppState> {
    const tab = state.tabs.get(tabId)
    // If the tab doesn't exist anymore, don't try to update it
    if (!tab) return {}

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        ...tab.feedbackState,
        hostTwitterHandle: {
          status: 'IN_PROGRESS',
          handle: null,
        },
      },
    })

    return { tabs: nextTabs }
  },
  fetchHandleSuccess(state, { tabId, host, handle }): Partial<AppState> {
    const tab = state.tabs.get(tabId)
    // If the tab doesn't exist anymore, or if the host has since changed, don't try to update it
    if (!tab) return {}
    if (tab.host !== host) return {}

    const nextTabs = new Map(state.tabs)

    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        editingScreenshot: tab.feedbackState.editingScreenshot,
        screenshots: tab.feedbackState.screenshots,
        editorState: appendHandle(tab.feedbackState.editorState, handle),
        hostTwitterHandle: {
          status: 'DONE',
          handle,
        },
      },
    })

    return { tabs: nextTabs }
  },
  fetchHandleFailure(state, { tabId, host, error }): Partial<AppState> {
    const tab = state.tabs.get(tabId)
    // If the tab doesn't exist anymore, or if the host has since changed, don't try to update it
    if (!tab) return {}
    if (tab.host !== host) return {}

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        ...tab.feedbackState,
        hostTwitterHandle: {
          status: 'DONE',
          handle: null,
        },
      },
    })
    return { tabs: nextTabs, alert: `Failed to set handle: ${error}` }
  },
  screenshotCaptureSuccess(state, { screenshot }): Partial<AppState> {
    const tabId = screenshot.tab.id
    // Don't use the screenshot if the tab no longer exists
    if (!state.tabs.has(tabId)) return {}

    const nextTabs = new Map(state.tabs)
    const tab = state.tabs.get(tabId)!
    nextTabs.set(tabId, {
      ...tab,
      feedbackState: {
        ...tab.feedbackState,
        screenshots: tab.feedbackState.screenshots.concat([screenshot]),
      },
    })

    return { tabs: nextTabs }
  },
  screenshotCaptureFailure(): Partial<AppState> {
    return { alert: 'SCREENSHOT FAILURE' }
  },
  postTweetSuccess(state, { tabId }): Partial<AppState> {
    const tab = state.tabs.get(tabId)
    if (!tab) return {}

    const nextTabs = new Map(state.tabs)
    const { handle } = tab.feedbackState.hostTwitterHandle

    // Clear the existing feedback state for the tab once the tweet is clicked
    nextTabs.set(tab.id, {
      ...tab,
      isTweeting: false,
      feedbackState: {
        editingScreenshot: null,
        screenshots: [],
        editorState: handle ? appendHandle(EditorState.createEmpty(), handle) : EditorState.createEmpty(),
        hostTwitterHandle: tab.feedbackState.hostTwitterHandle,
      },
    })

    return {
      tabs: nextTabs,
    }
  },
  postTweetFailure(state, { tabId, error }): Partial<AppState> {
    const tab = state.tabs.get(tabId)
    if (!tab) return {}

    const nextTabs = new Map(state.tabs)

    nextTabs.set(tab.id, {
      ...tab,
      isTweeting: false,
    })

    return {
      tabs: nextTabs,
      alert: error.message,
    }
  },
  startEditingScreenshot(state, { screenshotIndex }): Partial<AppState> {
    const tab = ensureActiveTab(state)

    const nextTabs = new Map(state.tabs)

    // Clear the existing feedback state for the tab once the tweet is clicked
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        ...tab.feedbackState,
        editingScreenshot: {
          index: screenshotIndex,
          color: '#fa759e',
          blob: tab.feedbackState.screenshots[screenshotIndex].blob,
        },
      },
    })

    return { tabs: nextTabs }
  },
  'chrome.windows.getAll'(state, { windows }): Partial<AppState> {
    return {
      focusedWindowId: windows.find(win => win.focused)!.id,
    }
  },
  'chrome.tabs.query'(state, payload): Partial<AppState> {
    const tabs: AppState['tabs'] = new Map()
    payload.tabs.forEach(tab => tabs.set(tab.id!, newTabInfo(tab)))
    return { tabs }
  },
  'chrome.tabs.onCreated'(state, payload): Partial<AppState> {
    const { tab } = payload
    const tabs = new Map(state.tabs)
    tabs.set(tab.id!, newTabInfo(tab))
    return { tabs }
  },
  'chrome.tabs.onRemoved'(state, { tabId }): Partial<AppState> {
    const tabs = new Map(state.tabs)
    tabs.delete(tabId)
    return { tabs }
  },
  'chrome.tabs.onUpdated'(state, { tabId, changeInfo }): Partial<AppState> {
    if (!changeInfo.url) return {}
    const tabs = new Map(state.tabs)
    const tab = { ...tabs.get(tabId)! }
    const nextURL = changeInfo.url
    const nextHost = new URL(nextURL).host
    tab.url = nextURL

    // If the domain has changed, delete the feedback
    if (tab.host !== nextHost) {
      tab.host = nextHost
      tab.feedbackState = emptyFeedbackState()
    }
    tabs.set(tabId, tab)
    return { tabs }
  },
  'chrome.tabs.onAttached'(state, { tabId, attachInfo }): Partial<AppState> {
    const tabs = new Map(state.tabs)
    const tab = { ...tabs.get(tabId)! }
    tab.windowId = attachInfo.newWindowId
    tabs.set(tabId, tab)
    return { tabs }
  },
  'chrome.tabs.onActivated'(state, payload): Partial<AppState> {
    const tabs: AppState['tabs'] = new Map()
    const { tabId, windowId } = payload.activeInfo

    for (const [id, tab] of state.tabs.entries()) {
      const nextTab = tab.windowId === windowId ? { ...tab, active: id === tabId } : tab
      tabs.set(id, nextTab)
    }

    return { tabs }
  },
  'chrome.tabs.onReplaced'(state, { addedTabId, removedTabId }): Partial<AppState> {
    const tab = state.tabs.get(removedTabId)!
    const tabs = new Map(state.tabs)
    tabs.delete(removedTabId)
    tabs.set(addedTabId, { ...tab, id: addedTabId })
    return { tabs }
  },
  'chrome.windows.onCreated'(state, payload): Partial<AppState> {
    if (payload.win.focused) {
      return { focusedWindowId: payload.win.id }
    }
    return {}
  },
  'chrome.windows.onRemoved'(state, { windowId }): Partial<AppState> {
    const tabs = new Map(state.tabs)
    for (const [id, tab] of state.tabs.entries()) {
      if (tab.windowId === windowId) {
        tabs.delete(id)
      }
    }
    const focusedWindowId = windowId === state.focusedWindowId ? -1 : state.focusedWindowId
    return { tabs, focusedWindowId }
  },
  'chrome.windows.onFocusChanged'(state, { windowId }): Partial<AppState> {
    if (windowId === -1) return {}
    return { focusedWindowId: windowId }
  },
}
