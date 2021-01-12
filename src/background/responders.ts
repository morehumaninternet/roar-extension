import { Map } from 'immutable'
import { EditorState } from 'draft-js'
import { parseUrl } from './parse-url'
import { newFeedbackState } from './state'
import { tabById, ensureActiveTab } from '../selectors'
import { appendEntity, prependHandle, replaceHandle } from '../draft-js-utils'
import * as copy from '../copy'
import { isEmpty } from 'lodash'

const newTabInfo = (tab: chrome.tabs.Tab): TabInfo => {
  const parsedUrl = parseUrl(tab.url)

  return {
    feedbackTargetType: 'tab',
    id: tab.id!,
    windowId: tab.windowId!,
    active: tab.active,
    parsedUrl,
    website: null,
    feedbackState: newFeedbackState({ domain: parsedUrl?.host }),
  }
}

function setTab(state: StoreState, tab: TabInfo): Partial<StoreState> {
  return { tabs: state.tabs.set(tab.id, tab) }
}

function updateTabIfExists(state: StoreState, tabId: number, callback: (tab: TabInfo) => Partial<TabInfo>): Partial<StoreState> {
  const tab = state.tabs.get(tabId)
  if (!tab) return {}
  return setTab(state, { ...tab, ...callback(tab) })
}

function updateTab(state: StoreState, tabId: number, callback: (tab: TabInfo) => Partial<TabInfo>): Partial<StoreState> {
  const tab = state.tabs.get(tabId)
  if (!tab) throw new Error(`Expected tab with id ${tabId} to exist`)
  return setTab(state, { ...tab, ...callback(tab) })
}

function updateFeedback(state: StoreState, target: FeedbackTarget, feedbackUpdates: Partial<FeedbackState>): Partial<StoreState> {
  const nextFeedbackState = { ...target.feedbackState, ...feedbackUpdates }
  const nextTarget: FeedbackTarget = { ...target, feedbackState: nextFeedbackState }
  return setTab(state, nextTarget)
}

function updateTabFeedbackIfExists(state: StoreState, tabId: number, callback: (tab: TabInfo) => Partial<FeedbackState>): Partial<StoreState> {
  const tab = state.tabs.get(tabId)
  if (!tab) return {}
  return updateFeedback(state, tab, callback(tab))
}

function updateActiveFeedback(state: StoreState, callback: (feedbackTarget: FeedbackTarget) => Partial<FeedbackState>): Partial<StoreState> {
  const target = ensureActiveTab(state)
  return updateFeedback(state, target, callback(target))
}

const contactSupportFor: Set<FetchRoarFailure['reason']> = new Set([
  'response not json',
  'response not expected data type',
  'bad request',
  'service down',
  'server error',
  'unknown status',
  'timeout',
])

function handleFailure(failure: { reason: FetchRoarFailure['reason'] }): Partial<StoreState> {
  const message: string = copy.alerts[failure.reason] || copy.alerts.standard
  const contactSupport = contactSupportFor.has(failure.reason)
  const updates: Partial<StoreState> = {
    alert: { message, contactSupport },
  }
  if (failure.reason === 'unauthorized') {
    updates.auth = { state: 'not_authed' }
  }
  return updates
}

export const responders: Responders<Action> = {
  popupConnect(): Partial<StoreState> {
    return { popupConnected: true }
  },
  popupDisconnect(): Partial<StoreState> {
    return { popupConnected: false, pickingEmoji: false, alert: null } // closing the popup dismisses any alert
  },
  signInWithTwitter(): Partial<StoreState> {
    return {}
  },
  onInstall(): Partial<StoreState> {
    return {}
  },
  authSuccess(): Partial<StoreState> {
    return {}
  },
  detectLoginStart(): Partial<StoreState> {
    return { auth: { state: 'detectLogin' } }
  },
  detectLoginResult(state, result): Partial<StoreState> {
    if (result.ok) {
      return { auth: { state: 'authenticated', user: result.data } }
    }
    const updates: Partial<StoreState> = {
      auth: { state: 'not_authed' },
    }
    if (result.reason !== 'unauthorized') {
      Object.assign(updates, handleFailure(result))
    }
    return updates
  },
  dismissAlert(): Partial<StoreState> {
    return { alert: null }
  },
  togglePickingEmoji(state): Partial<StoreState> {
    return { pickingEmoji: !state.pickingEmoji }
  },
  toggleDarkMode(state): Partial<StoreState> {
    return { darkModeOn: !state.darkModeOn }
  },
  emojiPicked(state, { emoji }): Partial<StoreState> {
    return {
      pickingEmoji: false,
      ...updateActiveFeedback(state, target => ({
        editorState: appendEntity(target.feedbackState.editorState, emoji, 'emoji'),
      })),
    }
  },
  hoverOver(state, { hovering }): Partial<StoreState> {
    return updateActiveFeedback(state, target => ({ hovering: { ...target.feedbackState.hovering, ...hovering } }))
  },
  updateEditorState(state, { editorState }): Partial<StoreState> {
    return updateActiveFeedback(state, () => ({ editorState }))
  },
  clickTakeScreenshot(): Partial<StoreState> {
    return {}
  },
  clickLogout(): Partial<StoreState> {
    return { auth: { state: 'not_authed' } }
  },
  clickPost(state): Partial<StoreState> {
    return updateActiveFeedback(state, () => ({ isTweeting: true }))
  },
  fetchWebsiteStart(state, { tabId }): Partial<StoreState> {
    return updateTab(state, tabId, tab => ({ website: 'in progress' }))
  },
  fetchWebsiteSuccess(state, { tabId, website }): Partial<StoreState> {
    return updateTabFeedbackIfExists(state, tabId, tab => {
      if (!tab.parsedUrl) return {}
      if (tab.parsedUrl.hostWithoutSubDomain !== website.domain) return {}

      // tab.parsedUrl

      return {
        website,
        editorState: handle ? replaceHandle(tab.feedbackState.editorState, handle) : tab.feedbackState.editorState,
        twitterHandle: {
          status: 'DONE',
          handle: handle || tab.feedbackState.twitterHandle.handle,
          isActualAccount: !!handle,
        },
      }
    })
  },
  fetchWebsiteFailure(state, { tabId, domain, failure }): Partial<StoreState> {
    const tabUpdates = updateTabFeedbackIfExists(state, tabId, tab => {
      if (tab.domain !== domain) return {}
      return { twitterHandle: { ...tab.feedbackState.twitterHandle, status: 'DONE' } }
    })
    if (isEmpty(tabUpdates)) {
      return {}
    }
    return {
      alert: {
        message: copy.fetchWebsiteFailure(domain),
        contactSupport: true,
      },
      ...tabUpdates,
    }
  },
  imageCaptureStart(state, { targetId }): Partial<StoreState> {
    return updateTabFeedbackIfExists(state, targetId, target => ({
      addingImages: target.feedbackState.addingImages + 1,
    }))
  },
  imageCaptureSuccess(state, { targetId, image }): Partial<StoreState> {
    return updateTabFeedbackIfExists(state, targetId, target => ({
      addingImages: target.feedbackState.addingImages - 1,
      images: target.feedbackState.images.concat([image]),
    }))
  },
  imageCaptureFailure(state, { targetId, failure }): Partial<StoreState> {
    const alert: StoreState['alert'] =
      failure.reason === 'file size limit exceeded' ? { message: failure.message } : { message: copy.alerts.standard, contactSupport: true }
    return {
      alert,
      ...updateTabFeedbackIfExists(state, targetId, target => ({
        addingImages: target.feedbackState.addingImages - 1,
      })),
    }
  },
  postTweetStart(state, { targetId }): Partial<StoreState> {
    return updateTabFeedbackIfExists(state, targetId, () => ({ isTweeting: true }))
  },
  postTweetSuccess(state, { targetId }): Partial<StoreState> {
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
  postTweetFailure(state, { targetId, failure }): Partial<StoreState> {
    const target = tabById(state, targetId)
    const feedbackUpdates = target ? updateFeedback(state, target, { isTweeting: false }) : {}

    return {
      ...handleFailure(failure),
      ...feedbackUpdates,
    }
  },
  clickDeleteImage(state, { imageIndex }): Partial<StoreState> {
    return updateActiveFeedback(state, target => {
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
  imageUpload(state): Partial<StoreState> {
    return {}
  },
  disableAutoSnapshot(state, { targetId }): Partial<StoreState> {
    return updateTabFeedbackIfExists(state, targetId, () => ({ takeAutoSnapshot: false }))
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
    const nextParsed = parseUrl(nextURL)

    if (nextParsed) {
      const matchingWebsite = nextParsed.host === tab.website?.domain
      if (!matchingWebsite) {
        tab.website = null
        tab.feedbackState = newFeedbackState({ domain: nextParsed.host })
      } else {
        return {}
      }

      // tab.parsed = nextParsed

      // If the domain has changed, delete the feedback
      if (tab.domain !== nextDomain) {
        return {}
      }
    }

    tab.parsedUrl = nextParsed

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
    return { focusedWindowId: windowId }
  },
}
