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
  name: string
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

type AppState = {
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
  mostRecentAction: Action | { type: 'INITIALIZING' }
}

// A Responder is a function that takes the current state of the application and an action of the corresponding type
// and returns any updates that should be made to the store. With this approach, we can ensure that we have an exhaustive
// object of responders, each of which only need return those parts of the state that we are updating
type Responder<T extends Action['type']> = (state: AppState, action: Action & { type: T }) => Partial<AppState>
