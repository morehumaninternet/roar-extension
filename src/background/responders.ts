import { EditorState } from 'draft-js'
import { ensureActiveTab } from '../selectors'
import { appendEntity, appendHandle } from '../draft-js-utils'

const emptyFeedbackState = (): FeedbackState => {
  return {
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

export const responders: { [T in Action['type']]: Responder<T> } = {
  popupConnect(): Partial<AppState> {
    return { popupConnected: true }
  },
  popupDisconnect(): Partial<AppState> {
    return { popupConnected: false, pickingEmoji: false, alert: null } // closing the popup dismisses any alert
  },
  signInWithTwitter(): Partial<AppState> {
    return { auth: { state: 'authenticating' } }
  },
  authenticatedViaTwitter(state, action): Partial<AppState> {
    return { auth: { state: 'authenticated', user: { photoUrl: action.payload.photoUrl } } }
  },
  dismissAlert(): Partial<AppState> {
    return { alert: null }
  },
  togglePickingEmoji(state): Partial<AppState> {
    return {
      pickingEmoji: !state.pickingEmoji,
    }
  },
  emojiPicked(state, action): Partial<AppState> {
    const tab = ensureActiveTab(state)
    const { emoji } = action.payload

    const nextEditorState = appendEntity(tab.feedbackState.editorState, emoji, 'emoji')

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        screenshots: tab.feedbackState.screenshots,
        editorState: nextEditorState,
        hostTwitterHandle: tab.feedbackState.hostTwitterHandle,
      },
    })

    return { tabs: nextTabs, pickingEmoji: false }
  },
  updateEditorState(state, action): Partial<AppState> {
    const tab = ensureActiveTab(state)

    const handle = tab.feedbackState.hostTwitterHandle.handle
    const { editorState } = action.payload
    const status = editorState.getCurrentContent().getPlainText('\u0001')

    // If the new editor state doesn't start with the handle, don't update the store.
    // This makes the handle static (not editable)
    if (handle && !status.startsWith(`${handle} `)) return {}

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        screenshots: tab.feedbackState.screenshots,
        editorState: action.payload.editorState,
        hostTwitterHandle: tab.feedbackState.hostTwitterHandle,
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
  fetchHandleStart(state, action): Partial<AppState> {
    const { tabId } = action.payload
    const tab = state.tabs.get(tabId)
    // If the tab doesn't exist anymore, don't try to update it
    if (!tab) return {}

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        screenshots: tab.feedbackState.screenshots,
        editorState: tab.feedbackState.editorState,
        hostTwitterHandle: {
          status: 'IN_PROGRESS',
          handle: null,
        },
      },
    })

    return { tabs: nextTabs }
  },
  fetchHandleSuccess(state, action): Partial<AppState> {
    const { tabId, host, handle } = action.payload
    const tab = state.tabs.get(tabId)
    // If the tab doesn't exist anymore, or if the host has since changed, don't try to update it
    if (!tab) return {}
    if (tab.host !== host) return {}

    const nextTabs = new Map(state.tabs)

    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
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
  fetchHandleFailure(state, action): Partial<AppState> {
    const { tabId, host, error } = action.payload
    const tab = state.tabs.get(tabId)
    // If the tab doesn't exist anymore, or if the host has since changed, don't try to update it
    if (!tab) return {}
    if (tab.host !== host) return {}

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        screenshots: tab.feedbackState.screenshots,
        editorState: tab.feedbackState.editorState,
        hostTwitterHandle: {
          status: 'DONE',
          handle: null,
        },
      },
    })
    return { tabs: nextTabs, alert: `Failed to set handle: ${error}` }
  },
  screenshotCaptureSuccess(state, action): Partial<AppState> {
    const { screenshot } = action.payload
    const tabId = screenshot.tab.id
    // Don't use the screenshot if the tab no longer exists
    if (!state.tabs.has(tabId)) return {}

    const nextTabs = new Map(state.tabs)
    const tab = state.tabs.get(tabId)!
    nextTabs.set(tabId, {
      ...tab,
      feedbackState: {
        screenshots: tab.feedbackState.screenshots.concat([screenshot]),
        editorState: tab.feedbackState.editorState,
        hostTwitterHandle: tab.feedbackState.hostTwitterHandle,
      },
    })

    return { tabs: nextTabs }
  },
  screenshotCaptureFailure(): Partial<AppState> {
    return { alert: 'SCREENSHOT FAILURE' }
  },
  postTweetSuccess(state, action): Partial<AppState> {
    const tab = state.tabs.get(action.payload.tabId)
    if (!tab) return {}

    const nextTabs = new Map(state.tabs)
    const { handle } = tab.feedbackState.hostTwitterHandle

    // Clear the existing feedback state for the tab once the tweet is clicked
    nextTabs.set(tab.id, {
      ...tab,
      isTweeting: false,
      feedbackState: {
        screenshots: [],
        editorState: handle ? appendHandle(EditorState.createEmpty(), handle) : EditorState.createEmpty(),
        hostTwitterHandle: tab.feedbackState.hostTwitterHandle,
      },
    })

    return {
      tabs: nextTabs,
    }
  },
  postTweetFailure(state, action): Partial<AppState> {
    const tab = state.tabs.get(action.payload.tabId)
    if (!tab) return {}

    const nextTabs = new Map(state.tabs)

    nextTabs.set(tab.id, {
      ...tab,
      isTweeting: false,
    })

    return {
      tabs: nextTabs,
      alert: action.payload.error.message,
    }
  },
  'chrome.windows.getAll'(state, action): Partial<AppState> {
    return {
      focusedWindowId: action.payload.windows.find(win => win.focused)!.id,
    }
  },
  'chrome.tabs.query'(state, action): Partial<AppState> {
    const tabs: AppState['tabs'] = new Map()
    action.payload.tabs.forEach(tab => tabs.set(tab.id!, newTabInfo(tab)))
    return { tabs }
  },
  'chrome.tabs.onCreated'(state, action): Partial<AppState> {
    const { tab } = action.payload
    const tabs = new Map(state.tabs)
    tabs.set(tab.id!, newTabInfo(tab))
    return { tabs }
  },
  'chrome.tabs.onRemoved'(state, action): Partial<AppState> {
    const tabs = new Map(state.tabs)
    tabs.delete(action.payload.tabId)
    return { tabs }
  },
  'chrome.tabs.onUpdated'(state, action): Partial<AppState> {
    const { tabId, changeInfo } = action.payload
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
  'chrome.tabs.onAttached'(state, action): Partial<AppState> {
    const tabs = new Map(state.tabs)
    const {
      tabId,
      attachInfo: { newWindowId },
    } = action.payload
    const tab = { ...tabs.get(tabId)! }
    tab.windowId = newWindowId
    tabs.set(tabId, tab)
    return { tabs }
  },
  'chrome.tabs.onActivated'(state, action): Partial<AppState> {
    const tabs: AppState['tabs'] = new Map()
    const { tabId, windowId } = action.payload.activeInfo

    for (const [id, tab] of state.tabs.entries()) {
      const nextTab = tab.windowId === windowId ? { ...tab, active: id === tabId } : tab
      tabs.set(id, nextTab)
    }

    return { tabs }
  },
  'chrome.tabs.onReplaced'(state, action): Partial<AppState> {
    const { addedTabId, removedTabId } = action.payload
    const tab = state.tabs.get(removedTabId)!
    const tabs = new Map(state.tabs)
    tabs.delete(removedTabId)
    tabs.set(addedTabId, { ...tab, id: addedTabId })
    return { tabs }
  },
  'chrome.windows.onCreated'(state, action): Partial<AppState> {
    if (action.payload.win.focused) {
      return { focusedWindowId: action.payload.win.id }
    }
    return {}
  },
  'chrome.windows.onRemoved'(state, action): Partial<AppState> {
    const { windowId } = action.payload
    const tabs = new Map(state.tabs)
    for (const [id, tab] of state.tabs.entries()) {
      if (tab.windowId === windowId) {
        tabs.delete(id)
      }
    }
    const focusedWindowId = windowId === state.focusedWindowId ? -1 : state.focusedWindowId
    return { tabs, focusedWindowId }
  },
  'chrome.windows.onFocusChanged'(state, action): Partial<AppState> {
    const { windowId } = action.payload
    if (windowId === -1) return {}
    return { focusedWindowId: windowId }
  },
}
