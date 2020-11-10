/// <reference path="../node_modules/@types/draft-js/index.d.ts" />

type Maybe<T> = T | null | undefined

type SystemInfo = {
  user_agent: string
  online: boolean
  cookie_enabled: boolean
  do_not_track: null | string
  languages: ReadonlyArray<string>
  time: number
  timezone_offset: number
  memory: chrome.system.memory.MemoryInfo
  storage: chrome.system.storage.StorageUnitInfo[] // tslint:disable-line:readonly-array
  cpu: chrome.system.cpu.CpuInfo
  zoom: number
}

type PopupState = boolean

type Screenshot = {
  tab: TabInfo
  name: string
  uri: string
  blob: Blob
}

type ScreenshotState = {
  requestedByUser: boolean
  screenshots: ReadonlyArray<Screenshot>
}

type TwitterHandleStatus = 'NEW' | 'IN_PROGRESS' | 'DONE'

type HostTwitterHandle = {
  status: TwitterHandleStatus
  handle: string | null
}

type FeedbackState = {
  screenshots: ReadonlyArray<Screenshot>
  editorState: Draft.EditorState
  hostTwitterHandle: HostTwitterHandle
}

type User = { photoUrl?: string }

type Auth = { state: 'not_authed' } | { state: 'authenticating' } | { state: 'authenticated'; user: User }

type TabInfo = {
  id: number
  windowId: number
  active: boolean
  isTweeting: boolean
  url?: string
  host?: string
  feedbackState: FeedbackState
}

type AppState = {
  popupConnected: PopupState
  focusedWindowId: number
  tabs: Map<number, TabInfo>
  auth: Auth
  pickingEmoji: boolean
  alert: null | string | { __html: string }
  mostRecentAction: Action | { type: 'INITIALIZING' }
}

// A Responder is a function that takes the current state of the application and an action of the corresponding type
// and returns any updates that should be made to the store. With this approach, we can ensure that we have an exhaustive
// object of responders, each of which only need return those parts of the state that we are updating
type Responder<T extends Action['type']> = (state: AppState, action: Action & { type: T }) => Partial<AppState>

type UserAction =
  | { type: 'POPUP_CONNECT' }
  | { type: 'POPUP_DISCONNECT' }
  | { type: 'SIGN_IN_WITH_TWITTER' }
  | { type: 'AUTHENTICATED_VIA_TWITTER'; payload: { photoUrl?: string } }
  | { type: 'DISMISS_ALERT' }
  | { type: 'UPDATE_EDITOR_STATE'; payload: { editorState: any } }
  | { type: 'CLICK_POST' }
  | { type: 'TOGGLE_PICKING_EMOJI' }
  | { type: 'EMOJI_PICKED'; payload: { emoji: string } }
  | { type: 'CLICK_TAKE_SCREENSHOT' }

type BackgroundAction =
  | { type: 'FETCH_HANDLE_START'; payload: { tabId: number } }
  | { type: 'FETCH_HANDLE_SUCCESS'; payload: { tabId: number; host: string; handle: string } }
  | { type: 'FETCH_HANDLE_FAILURE'; payload: { tabId: number; host: string; error: any } }
  | { type: 'SCREENSHOT_CAPTURE_SUCCESS'; payload: { screenshot: Screenshot } }
  | { type: 'SCREENSHOT_CAPTURE_FAILURE'; payload: { error: any } }
  | { type: 'POST_TWEET_SUCCESS'; payload: { tabId: number } }
  | { type: 'POST_TWEET_FAILURE'; payload: { tabId: number; error: any } }
  | { type: 'chrome.windows.getAll'; payload: { windows: ReadonlyArray<chrome.windows.Window> } }
  | { type: 'chrome.tabs.query'; payload: { tabs: ReadonlyArray<chrome.tabs.Tab> } }
  | { type: 'chrome.tabs.onCreated'; payload: { tab: chrome.tabs.Tab } }
  | { type: 'chrome.tabs.onRemoved'; payload: { tabId: number; removeInfo: chrome.tabs.TabRemoveInfo } }
  | { type: 'chrome.tabs.onUpdated'; payload: { tabId: number; changeInfo: chrome.tabs.TabChangeInfo } }
  | { type: 'chrome.tabs.onAttached'; payload: { tabId: number; attachInfo: chrome.tabs.TabAttachInfo } }
  | { type: 'chrome.tabs.onActivated'; payload: { activeInfo: chrome.tabs.TabActiveInfo } }
  | { type: 'chrome.tabs.onReplaced'; payload: { addedTabId: number; removedTabId: number } }
  | { type: 'chrome.windows.onCreated'; payload: { win: chrome.windows.Window } }
  | { type: 'chrome.windows.onRemoved'; payload: { windowId: number } }
  | { type: 'chrome.windows.onFocusChanged'; payload: { windowId: number } }

type Action = UserAction | BackgroundAction

type DispatchUserActions = {
  popupConnect(): void
  popupDisconnect(): void
  signInWithTwitter(): void
  authenticatedViaTwitter(photoUrl?: string): void
  dismissAlert(): void
  updateEditorState(editorState: any): void
  clickPost(): void
  togglePickingEmoji(): void
  emojiPicked(emoji: string): void
  clickTakeScreenshot(): void
}

type DispatchBackgroundActions = {
  fetchHandleStart(tabId: number): void
  fetchHandleSuccess(payload: { tabId: number; host: string; handle: string }): void
  fetchHandleFailure(payload: { tabId: number; host: string; error: any }): void
  screenshotCaptureSuccess(screenshot: Screenshot): void
  screenshotCaptureFailure(error: any): void
  postTweetSuccess(payload: { tabId: number }): void
  postTweetFailure(payload: { tabId: number; error: any }): void
}
