import { Map } from 'immutable'
import { EditorState } from 'draft-js'
import { domainOf } from './domain'
import { newFeedbackState, emptyHelpState } from './state'
import { ensureActiveFeedbackTarget } from '../selectors'
import { appendEntity, prependHandle, replaceHandle } from '../draft-js-utils'

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

function setTab(state: StoreState, tab: TabInfo): Partial<StoreState> {
  return { tabs: state.tabs.set(tab.id, tab) }
}

function updateFeedback(state: StoreState, target: FeedbackTarget, feedbackUpdates: Partial<FeedbackState>): Partial<StoreState> {
  const nextFeedbackState = { ...target.feedbackState, ...feedbackUpdates }
  const nextTarget: FeedbackTarget = { ...target, feedbackState: nextFeedbackState }
  return nextTarget.feedbackTargetType === 'help' ? { help: nextTarget } : setTab(state, nextTarget)
}

function updateTabFeedbackIfExists(state: StoreState, tabId: number, callback: (tab: TabInfo) => Partial<FeedbackState>): Partial<StoreState> {
  const tab = state.tabs.get(tabId)
  if (!tab) return {}
  return updateFeedback(state, tab, callback(tab))
}

function updateActiveFeedback(state: StoreState, callback: (feedbackTarget: FeedbackTarget) => Partial<FeedbackState>): Partial<StoreState> {
  const target = ensureActiveFeedbackTarget(state)
  return updateFeedback(state, target, callback(target))
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
    return updateTabFeedbackIfExists(state, tabId, tab => ({
      twitterHandle: { status: 'IN_PROGRESS', handle: null },
    }))
  },
  fetchHandleSuccess(state, { tabId, domain, handle }): Partial<StoreState> {
    return updateTabFeedbackIfExists(state, tabId, tab => {
      if (tab.domain !== domain) return {}
      return {
        editorState: replaceHandle(tab.feedbackState.editorState, handle),
        twitterHandle: { status: 'DONE', handle },
      }
    })
  },
  fetchHandleFailure(state, { tabId, domain, error }): Partial<StoreState> {
    return {
      alert: `Failed to set handle: ${error}`,
      ...updateTabFeedbackIfExists(state, tabId, tab => {
        if (tab.domain !== domain) return {}
        return { twitterHandle: { status: 'DONE', handle: null } }
      }),
    }
  },
  imageCaptureSuccess(state, { targetId, image }): Partial<StoreState> {
    if (targetId === 'help') {
      throw new Error('TODO: support uploading images to help')
    }
    return updateTabFeedbackIfExists(state, targetId, tab => ({
      images: tab.feedbackState.images.concat([image]),
    }))
  },
  imageCaptureFailure(state, { targetId, error }): Partial<StoreState> {
    return { alert: typeof error === 'string' ? error : error.message || 'SCREENSHOT FAILURE' }
  },
  postTweetSuccess(state, { targetId }): Partial<StoreState> {
    if (targetId === 'help') {
      return { help: emptyHelpState() }
    }

    return updateTabFeedbackIfExists(state, targetId, tab => {
      const { handle } = tab.feedbackState.twitterHandle
      return {
        isTweeting: false,
        editingImage: null,
        image: [],
        editorState: handle ? prependHandle(EditorState.createEmpty(), handle) : EditorState.createEmpty(),
      }
    })
  },
  postTweetFailure(state, { targetId, error }): Partial<StoreState> {
    const target = targetId === 'help' ? state.help : state.tabs.get(targetId)
    if (!target) return {}

    return {
      alert: error.message,
      ...updateFeedback(state, target, { isTweeting: false }),
    }
  },
  clickDeleteImage(state, { imageIndex }): Partial<StoreState> {
    return updateActiveFeedback(state, target => {
      // The image array can't be empty
      if (target.feedbackState.images.length === 1) return {}

      // Removing the image
      // tslint:disable-next-line: readonly-array
      const nextImages = [...target.feedbackState.images]
      nextImages.splice(imageIndex, 1)
      return { images: nextImages }
    })
  },
  startEditingImage(state, { imageIndex }): Partial<StoreState> {
    return updateActiveFeedback(state, target => ({
      editingImage: {
        image: target.feedbackState.images[imageIndex],
        color: '#fa759e',
      },
    }))
  },
  imageUpload(state, { file }): Partial<StoreState> {
    return {}
  },
  'chrome.windows.getAll'(state, { windows }): Partial<StoreState> {
    const focusedWindow = windows.find(win => win.focused)
    if (!focusedWindow) return {}
    return { focusedWindowId: focusedWindow.id }
  },
  'chrome.tabs.query'(state, payload): Partial<StoreState> {
    return {
      tabs: payload.tabs.reduce((tabsMap, tab) => tabsMap.set(tab.id!, newTabInfo(tab)), Map<number, TabInfo>()),
    }
  },
  'chrome.tabs.onCreated'(state, payload): Partial<StoreState> {
    return setTab(state, newTabInfo(payload.tab))
  },
  'chrome.tabs.onRemoved'(state, { tabId }): Partial<StoreState> {
    return { tabs: state.tabs.delete(tabId) }
  },
  'chrome.tabs.onUpdated'(state, { tabId, changeInfo }): Partial<StoreState> {
    if (!changeInfo.url) return {}
    const tab = { ...state.tabs.get(tabId)! }
    const nextURL = changeInfo.url
    const nextDomain = domainOf(nextURL)
    tab.url = nextURL

    // If the domain has changed, delete the feedback
    if (tab.domain !== nextDomain) {
      tab.domain = nextDomain
      tab.feedbackState = newFeedbackState({ domain: nextDomain })
    }

    return setTab(state, tab)
  },
  'chrome.tabs.onAttached'(state, { tabId, attachInfo }): Partial<StoreState> {
    const tab = { ...state.tabs.get(tabId)! }
    tab.windowId = attachInfo.newWindowId
    return setTab(state, tab)
  },
  'chrome.tabs.onActivated'(state, payload): Partial<StoreState> {
    let tabs = state.tabs // tslint:disable-line:no-let
    const { tabId, windowId } = payload.activeInfo

    for (const [id, tab] of state.tabs.entries()) {
      if (tab.windowId === windowId) {
        tabs = tabs.set(id, { ...tab, active: id === tabId })
      }
    }

    return { tabs }
  },
  'chrome.tabs.onReplaced'(state, { addedTabId, removedTabId }): Partial<StoreState> {
    const tab = state.tabs.get(removedTabId)!
    const nextTab = { ...tab, id: addedTabId }
    return { tabs: state.tabs.delete(removedTabId).set(addedTabId, nextTab) }
  },
  'chrome.windows.onCreated'(state, payload): Partial<StoreState> {
    if (payload.win.focused) {
      return { focusedWindowId: payload.win.id }
    }
    return {}
  },
  'chrome.windows.onRemoved'(state, { windowId }): Partial<StoreState> {
    let tabs = state.tabs // tslint:disable-line:no-let
    for (const [id, tab] of state.tabs.entries()) {
      if (tab.windowId === windowId) {
        tabs = tabs.delete(id)
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
