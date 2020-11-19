import { EditorState } from 'draft-js'
import { domainOf } from './domain'
import { newFeedbackState, emptyHelpFeedbackState } from './feedback-state'
import { ensureActiveTab, ensureActiveFeedbackTarget } from '../selectors'
import { appendEntity, getPlainText, prependHandle, replaceHandle } from '../draft-js-utils'

const newTabInfo = (tab: chrome.tabs.Tab): TabInfo => {
  const domain = domainOf(tab.url)

  return {
    feedbackTargetType: 'tab',
    id: tab.id!,
    windowId: tab.windowId!,
    active: tab.active,
    url: tab.url,
    domain,
    feedbackState: newFeedbackState({ domain }),
  }
}

function updateActiveFeedback(state: StoreState, callback: (feedbackTarget: FeedbackTarget) => Partial<FeedbackState>): Partial<StoreState> {
  const feedbackTarget = ensureActiveFeedbackTarget(state)
  const feedbackUpdates = callback(feedbackTarget)
  const nextFeedbackTarget: FeedbackTarget = {
    ...feedbackTarget,
    feedbackState: {
      ...feedbackTarget.feedbackState,
      ...feedbackUpdates,
    },
  }

  if (nextFeedbackTarget.feedbackTargetType === 'help') {
    return { help: nextFeedbackTarget }
  }

  const tab = nextFeedbackTarget
  const nextTabs = new Map(state.tabs)
  nextTabs.set(tab.id, nextFeedbackTarget)
  return { tabs: nextTabs }
}

export const responders: Responders<Action> = {
  popupConnect(): Partial<StoreState> {
    return {}
  },
  popupDisconnect(): Partial<StoreState> {
    return { pickingEmoji: false, alert: null } // closing the popup dismisses any alert
  },
  signInWithTwitter(): Partial<StoreState> {
    return { auth: { state: 'authenticating' } }
  },
  authenticatedViaTwitter(state, { photoUrl }): Partial<StoreState> {
    return { auth: { state: 'authenticated', user: { photoUrl } } }
  },
  dismissAlert(): Partial<StoreState> {
    return { alert: null }
  },
  togglePickingEmoji(state): Partial<StoreState> {
    return { pickingEmoji: !state.pickingEmoji }
  },
  toggleHelp(state): Partial<StoreState> {
    return { help: { ...state.help, on: !state.help.on } }
  },
  emojiPicked(state, { emoji }): Partial<StoreState> {
    return {
      pickingEmoji: false,
      ...updateActiveFeedback(state, target => ({
        editorState: appendEntity(target.feedbackState.editorState, emoji, 'emoji'),
      })),
    }
  },
  updateEditorState(state, { editorState }): Partial<StoreState> {
    return updateActiveFeedback(state, () => ({ editorState }))
  },
  clickTakeScreenshot(): Partial<StoreState> {
    return {}
  },
  clickPost(state): Partial<StoreState> {
    return updateActiveFeedback(state, () => ({ isTweeting: true }))
  },
  fetchHandleStart(state, { tabId }): Partial<StoreState> {
    const tab = state.tabs.get(tabId)

    // If the tab doesn't exist anymore, don't try to update it
    if (!tab) return {}

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        ...tab.feedbackState,
        twitterHandle: {
          status: 'IN_PROGRESS',
          handle: null,
        },
      },
    })

    return { tabs: nextTabs }
  },
  fetchHandleSuccess(state, { tabId, domain, handle }): Partial<StoreState> {
    const tab = state.tabs.get(tabId)
    // If the tab doesn't exist anymore, or if the domain has since changed, don't try to update it
    if (!tab) return {}
    if (tab.domain !== domain) return {}

    const nextTabs = new Map(state.tabs)

    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        isTweeting: tab.feedbackState.isTweeting,
        editingScreenshot: tab.feedbackState.editingScreenshot,
        screenshots: tab.feedbackState.screenshots,
        editorState: replaceHandle(tab.feedbackState.editorState, handle),
        twitterHandle: {
          status: 'DONE',
          handle,
        },
      },
    })

    return { tabs: nextTabs }
  },
  fetchHandleFailure(state, { tabId, domain, error }): Partial<StoreState> {
    const tab = state.tabs.get(tabId)
    // If the tab doesn't exist anymore, or if the domain has since changed, don't try to update it
    if (!tab) return {}
    if (tab.domain !== domain) return {}

    const nextTabs = new Map(state.tabs)
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        ...tab.feedbackState,
        twitterHandle: {
          status: 'DONE',
          handle: null,
        },
      },
    })
    return { tabs: nextTabs, alert: `Failed to set handle: ${error}` }
  },
  screenshotCaptureSuccess(state, { screenshot }): Partial<StoreState> {
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
  screenshotCaptureFailure(state, { error }): Partial<StoreState> {
    return { alert: typeof error === 'string' ? error : error.message || 'SCREENSHOT FAILURE' }
  },
  postTweetSuccess(state, { targetId }): Partial<StoreState> {
    if (targetId === 'help') {
      return {
        help: {
          feedbackTargetType: 'help',
          on: false,
          feedbackState: emptyHelpFeedbackState(),
        },
      }
    }

    const tabId = targetId
    const tab = state.tabs.get(tabId)
    if (!tab) return {}

    const nextTabs = new Map(state.tabs)
    const { handle } = tab.feedbackState.twitterHandle

    // Clear the existing feedback state for the tab once the tweet is clicked
    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        isTweeting: false,
        editingScreenshot: null,
        screenshots: [],
        editorState: handle ? prependHandle(EditorState.createEmpty(), handle) : EditorState.createEmpty(),
        twitterHandle: tab.feedbackState.twitterHandle,
      },
    })

    return {
      tabs: nextTabs,
    }
  },
  postTweetFailure(state, { targetId, error }): Partial<StoreState> {
    if (targetId === 'help') {
      return {
        help: {
          ...state.help,
          feedbackState: {
            ...state.help.feedbackState,
            isTweeting: false,
          },
        },
        alert: error.message,
      }
    }

    const tabId = targetId
    const tab = state.tabs.get(tabId)
    if (!tab) return {}

    const nextTabs = new Map(state.tabs)

    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        ...tab.feedbackState,
        isTweeting: false,
      },
    })

    return {
      tabs: nextTabs,
      alert: error.message,
    }
  },
  clickDeleteScreenshot(state, { screenshotIndex }): Partial<StoreState> {
    return updateActiveFeedback(state, target => {
      // The Screenshot array can't be empty
      if (target.feedbackState.screenshots.length === 1) return target.feedbackState

      // Removing the screenshot
      // tslint:disable-next-line: readonly-array
      const nextScreenshots = [...target.feedbackState.screenshots]
      nextScreenshots.splice(screenshotIndex, 1)
      return {
        ...target.feedbackState,
        screenshots: nextScreenshots,
      }
    })
  },
  startEditingScreenshot(state, { screenshotIndex }): Partial<StoreState> {
    const tab = ensureActiveTab(state)

    const nextTabs = new Map(state.tabs)

    nextTabs.set(tab.id, {
      ...tab,
      feedbackState: {
        ...tab.feedbackState,
        editingScreenshot: {
          screenshot: tab.feedbackState.screenshots[screenshotIndex],
          color: '#fa759e',
        },
      },
    })

    return { tabs: nextTabs }
  },
  'chrome.windows.getAll'(state, { windows }): Partial<StoreState> {
    const focusedWindow = windows.find(win => win.focused)
    if (!focusedWindow) return {}
    return { focusedWindowId: focusedWindow.id }
  },
  'chrome.tabs.query'(state, payload): Partial<StoreState> {
    const tabs: StoreState['tabs'] = new Map()
    payload.tabs.forEach(tab => tabs.set(tab.id!, newTabInfo(tab)))
    return { tabs }
  },
  'chrome.tabs.onCreated'(state, payload): Partial<StoreState> {
    const { tab } = payload
    const tabs = new Map(state.tabs)
    tabs.set(tab.id!, newTabInfo(tab))
    return { tabs }
  },
  'chrome.tabs.onRemoved'(state, { tabId }): Partial<StoreState> {
    const tabs = new Map(state.tabs)
    tabs.delete(tabId)
    return { tabs }
  },
  'chrome.tabs.onUpdated'(state, { tabId, changeInfo }): Partial<StoreState> {
    if (!changeInfo.url) return {}
    const tabs = new Map(state.tabs)
    const tab = { ...tabs.get(tabId)! }
    const nextURL = changeInfo.url
    const nextDomain = domainOf(nextURL)
    tab.url = nextURL

    // If the domain has changed, delete the feedback
    if (tab.domain !== nextDomain) {
      tab.domain = nextDomain
      tab.feedbackState = newFeedbackState({ domain: nextDomain })
    }

    tabs.set(tabId, tab)
    return { tabs }
  },
  'chrome.tabs.onAttached'(state, { tabId, attachInfo }): Partial<StoreState> {
    const tabs = new Map(state.tabs)
    const tab = { ...tabs.get(tabId)! }
    tab.windowId = attachInfo.newWindowId
    tabs.set(tabId, tab)
    return { tabs }
  },
  'chrome.tabs.onActivated'(state, payload): Partial<StoreState> {
    const tabs: StoreState['tabs'] = new Map()
    const { tabId, windowId } = payload.activeInfo

    for (const [id, tab] of state.tabs.entries()) {
      const nextTab = tab.windowId === windowId ? { ...tab, active: id === tabId } : tab
      tabs.set(id, nextTab)
    }

    return { tabs }
  },
  'chrome.tabs.onReplaced'(state, { addedTabId, removedTabId }): Partial<StoreState> {
    const tab = state.tabs.get(removedTabId)!
    const tabs = new Map(state.tabs)
    tabs.delete(removedTabId)
    tabs.set(addedTabId, { ...tab, id: addedTabId })
    return { tabs }
  },
  'chrome.windows.onCreated'(state, payload): Partial<StoreState> {
    if (payload.win.focused) {
      return { focusedWindowId: payload.win.id }
    }
    return {}
  },
  'chrome.windows.onRemoved'(state, { windowId }): Partial<StoreState> {
    const tabs = new Map(state.tabs)
    for (const [id, tab] of state.tabs.entries()) {
      if (tab.windowId === windowId) {
        tabs.delete(id)
      }
    }
    const focusedWindowId = windowId === state.focusedWindowId ? -1 : state.focusedWindowId
    return { tabs, focusedWindowId }
  },
  'chrome.windows.onFocusChanged'(state, { windowId }): Partial<StoreState> {
    if (windowId === -1) return {}
    return { focusedWindowId: windowId }
  },
}
