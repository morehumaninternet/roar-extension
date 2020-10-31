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

type DisconnectedPopupState = {
  connected: false
  disabledForTab?: undefined
}

type ConnectedPopupState = {
  connected: true
  activeTab: null | browser.tabs.Tab
  disabledForTab?: boolean
}

type PopupState = DisconnectedPopupState | ConnectedPopupState

type Screenshot = {
  tab: browser.tabs.Tab
  uri: string
  blob: Blob
}

type ScreenshotState = {
  requestedByUser: boolean
  screenshots: ReadonlyArray<Screenshot>
}

type FeedbackState = {
  screenshots: ReadonlyArray<Screenshot>
  editorState: any
}

type TwitterAuthState = 'not_authed' | 'authenticating' | 'authenticated'

type ToBeTweeted = {
  tabId: number
  feedbackState: FeedbackState
}

type AppStateNoLastAction = {
  popup: PopupState
  feedbackByTabId: {
    [tabId: number]: FeedbackState
  }
  toBeTweeted: Maybe<ToBeTweeted>
  justTweeted: Maybe<{
    url: string
  }>
  twitterAuth: TwitterAuthState
  alert: null | string | { __html: string }
}

type AppState = AppStateNoLastAction & {
  lastAction: null | Action
}

type Feedback = any
