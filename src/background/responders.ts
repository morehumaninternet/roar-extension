import { EditorState, Modifier } from 'draft-js'
import { ensureActiveTab } from '../selectors'

export const responders: { [T in Action['type']]: Responder<T> } = {
  POPUP_CONNECT() {
    return { popupConnected: true }
  },
  POPUP_DISCONNECT() {
    return { popupConnected: false, alert: null } // closing the popup dismisses any alert
  },
  SIGN_IN_WITH_TWITTER() {
    return { twitterAuth: 'authenticating' }
  },
  AUTHENTICATED_VIA_TWITTER() {
    return { twitterAuth: 'authenticated' }
  },
  DISMISS_ALERT() {
    return { alert: null }
  },
  EMOJI_PICKED(state, action) {
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

    return { tabs: nextTabs }
  },
  UPDATE_EDITOR_STATE(state, action) {
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
  CLICK_TAKE_SCREENSHOT() {
    return {}
  },
  CLICK_POST(state) {
    const tab = ensureActiveTab(state)
    return {
      toBeTweeted: {
        feedbackState: tab.feedbackState,
        tabId: tab.id,
      },
    }
  },
  SCREENSHOT_CAPTURE_SUCCESS(state, action) {
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
  SCREENSHOT_CAPTURE_FAILURE() {
    return { alert: 'SCREENSHOT FAILURE' }
  },
  POST_TWEET_SUCCESS(_state, action) {
    const { url } = action.payload.tweetResult
    return {
      toBeTweeted: null,
      justTweeted: { url },
    }
  },
  POST_TWEET_FAILURE() {
    return {
      toBeTweeted: null,
      justTweeted: null,
      alert: 'POST TWEET FAILURE',
    }
  },
  'chrome.windows.getAll'(state, action) {
    return {
      focusedWindowId: action.payload.windows.find(win => win.focused)!.id,
    }
  },
  'chrome.tabs.query'(state, action) {
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
  'chrome.tabs.onCreated'(state, action) {
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
  'chrome.tabs.onRemoved'(state, action) {
    const tabs = new Map(state.tabs)
    tabs.delete(action.payload.tabId)
    return { tabs }
  },
  'chrome.tabs.onUpdated'(state, action) {
    const { tabId, changeInfo } = action.payload
    if (!changeInfo.url) return {}
    const tabs = new Map(state.tabs)
    const tab = { ...tabs.get(tabId)! }
    tab.url = changeInfo.url
    tab.host = new URL(changeInfo.url).host
    tabs.set(tabId, tab)
    return { tabs }
  },
  'chrome.tabs.onAttached'(state, action) {
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
  'chrome.tabs.onActivated'(state, action) {
    const tabs: AppState['tabs'] = new Map()
    const { tabId, windowId } = action.payload.activeInfo

    for (const [id, tab] of state.tabs.entries()) {
      const nextTab = tab.windowId === windowId ? { ...tab, active: id === tabId } : tab
      tabs.set(id, nextTab)
    }

    return { tabs }
  },
  'chrome.tabs.onReplaced'(state, action) {
    console.log('chrome.tabs.onReplaced', state, action)
    return {}
  },
  'chrome.windows.onCreated'(state, action) {
    if (action.payload.win.focused) {
      return { focusedWindowId: action.payload.win.id }
    }
    return {}
  },
  'chrome.windows.onRemoved'(state, action) {
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
  'chrome.windows.onFocusChanged'(state, action) {
    const { windowId } = action.payload
    return { focusedWindowId: windowId }
  },
}
