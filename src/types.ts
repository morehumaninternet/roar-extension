/// <reference path="../node_modules/@types/draft-js/index.d.ts" />
/// <reference path="../node_modules/immutable/dist/immutable.d.ts" />

type Maybe<T> = T | null | undefined

type Screenshot = {
  type: 'screenshot'
  tab: {
    id: number
    url: string
    width: number
    height: number
  }
  name: string
  uri: string
  blob: Blob
}

type ImageUpload = {
  type: 'imageupload'
  name: string
  uri: string
  blob: Blob
}

type Image = Screenshot | ImageUpload

type EditingImageState = {
  color: string
  image: Image
}

type FeedbackState = {
  isTweeting: boolean
  takeAutoSnapshot: boolean
  editingImage: null | EditingImageState
  addingImages: number
  images: ReadonlyArray<Image>
  editorState: Draft.EditorState
  hovering: {
    active: boolean
    top: number
    left: number
    height: number
    width: number
  }
  twitterHandle: {
    status: 'NEW' | 'IN_PROGRESS' | 'DONE'
    handle: string
    isActualAccount: boolean
  }
}

type CharacterLimit = {
  remaining: number
  percentageCompleted: number
}

type User = { photoUrl: null | string }

type Auth = { state: 'not_authed' } | { state: 'authenticating' } | { state: 'detectLogin' } | { state: 'authenticated'; user: User }

type TabInfo = {
  feedbackTargetType: 'tab'
  id: number
  windowId: number
  active: boolean
  url?: string
  domain?: string
  feedbackState: FeedbackState
}

type FeedbackTarget = TabInfo

type FeedbackTargetId = FeedbackTarget['id']

type StoreState = {
  focusedWindowId: number
  tabs: Immutable.Map<number, TabInfo>
  auth: Auth
  pickingEmoji: boolean
  darkModeOn: boolean
  alert: null | {
    message: string
    contactSupport?: boolean
  }
  mostRecentAction: Action | { type: 'INITIALIZING' }
}

type NotWebPageState = {
  view: 'NotWebPage'
}

type NotAuthedState = {
  view: 'NotAuthed'
  signInWithTwitter(): void
}

type AuthenticatingState = {
  view: 'Authenticating'
}

type AuthenticatedState = {
  view: 'Authenticated'
  feedback: Maybe<FeedbackState>
  user: User
  tweeting: null | { at: string }
  darkModeOn: boolean
  pickingEmoji: boolean
  addImageDisabled: boolean
  postTweetDisabled: boolean
  characterLimit: CharacterLimit
  dispatchUserActions: Dispatchers<UserAction>
}

type AppState = NotWebPageState | NotAuthedState | AuthenticatingState | AuthenticatedState

// A Responder is a function that takes the current state of the application and the payload of the action of the corresponding
// type and returns any updates that should be made to the store. With this approach, we can ensure that we have an exhaustive
// object of responders, each of which only need return those parts of the state that we are updating
type Responder<A extends Action, T extends A['type']> = A extends { type: T; payload: any }
  ? (state: StoreState, payload: A['payload']) => Partial<StoreState>
  : (state: StoreState) => Partial<StoreState>

type Responders<A extends Action> = {
  [T in A['type']]: Responder<A, T>
}

type UserAction =
  | { type: 'popupConnect' }
  | { type: 'popupDisconnect' }
  | { type: 'signInWithTwitter' }
  | { type: 'dismissAlert' }
  | { type: 'hoverOver'; payload: { hovering: Partial<FeedbackState['hovering']> } }
  | { type: 'updateEditorState'; payload: { editorState: any } }
  | { type: 'clickPost' }
  | { type: 'togglePickingEmoji' }
  | { type: 'toggleDarkMode' }
  | { type: 'emojiPicked'; payload: { emoji: string } }
  | { type: 'clickTakeScreenshot' }
  | { type: 'clickLogout' }
  | { type: 'clickDeleteImage'; payload: { imageIndex: number } }
  | { type: 'startEditingImage'; payload: { imageIndex: number } }
  | { type: 'imageUpload'; payload: { file: File } }

type BackgroundAction =
  | { type: 'detectLoginStart' }
  | { type: 'detectLoginResult'; payload: FetchRoarResult<{ photoUrl: null | string }> }
  | { type: 'fetchHandleStart'; payload: { tabId: number } }
  | { type: 'fetchHandleSuccess'; payload: { tabId: number; domain: string; handle: null | string } }
  | { type: 'fetchHandleFailure'; payload: { tabId: number; domain: string; failure: FetchRoarFailure } }
  | { type: 'postTweetStart'; payload: { targetId: FeedbackTargetId } }
  | { type: 'postTweetSuccess'; payload: { targetId: FeedbackTargetId } }
  | { type: 'postTweetFailure'; payload: { targetId: FeedbackTargetId; failure: FetchRoarFailure | { reason: 'timeout' } } }
  | { type: 'imageCaptureStart'; payload: { targetId: FeedbackTargetId } }
  | { type: 'imageCaptureSuccess'; payload: { targetId: FeedbackTargetId; image: Image } }
  | { type: 'imageCaptureFailure'; payload: { targetId: FeedbackTargetId; failure: ImageCaptureFailure } }
  | { type: 'disableAutoSnapshot'; payload: { targetId: FeedbackTargetId } }
  | { type: 'onInstall' }
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

// If the action has a payload, a dispatcher for that function takes the payload as its first argument
// otherwise, the dispatcher is a function called with no arguments
type Dispatcher<A extends Action, T extends A['type']> = A extends { type: T; payload: any } ? (payload: A['payload']) => void : () => void

type Dispatchers<A extends Action> = {
  [T in A['type']]: Dispatcher<A, T>
}

type TwitterHandleCache = {
  get(domain: string): Promise<Maybe<string>>
  set(domain: string, handle: string): Promise<void>
}

type FetchRoarFailure =
  | { ok: false; reason: 'response not json'; text: string; details: string }
  | { ok: false; reason: 'response not expected data type'; text: string; details: string }
  | { ok: false; reason: 'bad request'; details: string }
  | { ok: false; reason: 'unauthorized'; details: string }
  | { ok: false; reason: 'service down'; details: string }
  | { ok: false; reason: 'server error'; details: string }
  | { ok: false; reason: 'unknown status'; details: string; status: number }
  | { ok: false; reason: 'timeout'; details: string }
  | { ok: false; reason: 'network down'; details: string }

type FetchRoarResult<T> = { ok: true; data: T } | FetchRoarFailure

type ImageCaptureFailure = { reason: 'file size limit exceeded'; message: string } | { reason: 'unknown'; message: string }

type FeedbackResponseData = {
  url: string
}

type WebsiteResponseData = {
  domain: string
  twitter_handle: null | string
}

type Api = {
  fetchRoar<T extends object>(path: string, init: RequestInit, decoder: any): Promise<FetchRoarResult<T>>
  postFeedback(formData: FormData): Promise<FetchRoarResult<FeedbackResponseData>>
  getWebsite(domain: string): Promise<FetchRoarResult<WebsiteResponseData>>
  getMe(): Promise<FetchRoarResult<User>>
  makeLogoutRequest(): Promise<Response>
}

type ApiHandlers = {
  postTweet(target: FeedbackTarget): Promise<any>
  fetchTwitterHandle(tabId: number, domain: string): Promise<any>
  detectLogin(): Promise<void>
  makeLogoutRequest(): Promise<Response>
}
