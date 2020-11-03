import { EditorState, Modifier } from 'draft-js'
import { ensureActiveTab } from '../selectors'

export const responders: { [T in Action['type']]: Responder<T> } = {
  POPUP_CONNECT(): Partial<AppState> {
    return { popupConnected: true }
  },
  POPUP_DISCONNECT(): Partial<AppState> {
    return { popupConnected: false, pickingEmoji: false, alert: null } // closing the popup dismisses any alert
  },
  SIGN_IN_WITH_TWITTER(): Partial<AppState> {
    return { twitterAuth: 'authenticating' }
  },
  AUTHENTICATED_VIA_TWITTER(): Partial<AppState> {
    return { twitterAuth: 'authenticated' }
  },
  DISMISS_ALERT(): Partial<AppState> {
    return { alert: null }
  },
  TOGGLE_PICKING_EMOJI(state): Partial<AppState> {
    return {
      pickingEmoji: !state.pickingEmoji,
    }
  },
  EMOJI_PICKED(state, action): Partial<AppState> {
    const tab = ensureActiveTab(state)
    const { emoji } = action.payload

    const editorState: EditorState = tab.feedbackState.editorState
    const nextContentState = Modifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), emoji)
    const nextEditorState = EditorState.createWithContent(nextContentState)

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        screenshots: tab.feedbackState.screenshots,
        editorState: nextEditorState,
      },
    })

    return { tabs: nextTabs, pickingEmoji: false }
  },
  UPDATE_EDITOR_STATE(state, action): Partial<AppState> {
    const tab = ensureActiveTab(state)

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        screenshots: tab.feedbackState.screenshots,
        editorState: action.payload.editorState,
      },
    })

    return { tabs: nextTabs }
  },
  CLICK_TAKE_SCREENSHOT(): Partial<AppState> {
    return {}
  },
  CLICK_POST(state): Partial<AppState> {
    const tab = ensureActiveTab(state)
    return {
      toBeTweeted: {
        feedbackState: tab.feedbackState,
        tabId: tab.id,
      },
    }
  },
  SCREENSHOT_CAPTURE_SUCCESS(state, action): Partial<AppState> {
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
      },
    })

    return { tabs: nextTabs }
  },
  SCREENSHOT_CAPTURE_FAILURE(): Partial<AppState> {
    return { alert: 'SCREENSHOT FAILURE' }
  },
  POST_TWEET_SUCCESS(_state, action): Partial<AppState> {
    const { url } = action.payload.tweetResult
    return {
      toBeTweeted: null,
      justTweeted: { url },
    }
  },
  POST_TWEET_FAILURE(): Partial<AppState> {
    return {
      toBeTweeted: null,
      justTweeted: null,
      alert: 'POST TWEET FAILURE',
    }
  },
  'chrome.windows.getAll'(state, action): Partial<AppState> {
    return {
      focusedWindowId: action.payload.windows.find(win => win.focused)!.id,
    }
  },
  'chrome.tabs.query'(state, action): Partial<AppState> {
    const tabs: AppState['tabs'] = new Map()
    action.payload.tabs.forEach(tab =>
      tabs.set(tab.id!, {
        id: tab.id!,
        windowId: tab.windowId!,
        active: tab.active!,
        url: tab.url!,
        host: new URL(tab.url!).host,
        feedbackState: {
          screenshots: [],
          editorState: EditorState.createEmpty(),
        },
      })
    )
    return { tabs }
  },
  'chrome.tabs.onCreated'(state, action): Partial<AppState> {
    const { tab } = action.payload
    const tabs = new Map(state.tabs)
    tabs.set(tab.id!, {
      id: tab.id!,
      windowId: tab.windowId!,
      active: tab.active,
      url: tab.url,
      host: tab.url ? new URL(tab.url).host : undefined,
      feedbackState: {
        screenshots: [],
        editorState: EditorState.createEmpty(),
      },
    })
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
      tab.feedbackState = {
        screenshots: [],
        editorState: EditorState.createEmpty(),
      }
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
    return { focusedWindowId: windowId }
  },
}
