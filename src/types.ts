/// <reference path="../node_modules/@types/draft-js/index.d.ts" />
/// <reference path="../node_modules/immutable/dist/immutable.d.ts" />

// Declare variables that are passed in via rollup.config.js
declare module NodeJS {
  interface Global {
    ROAR_SERVER_URL: string
  }

  interface Global {
    CONSOLE_ERROR: (error: any) => void
  }
}

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

type TwitterHandleState = {
  handle: string
  matchingDomain?: string
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
  twitterHandle: TwitterHandleState
}

type CharacterLimit = {
  remaining: number
  percentageCompleted: number
}

type User = { photoUrl: null | string }

type Auth =
  // The user is not authed and not actively authenticating.
  | { state: 'not_authed' }
  // The user may or may not be authenticated.
  // We enter this state either because chrome is booting up, in which case we may still have an active
  // cookie or because we detected a redirect to the /auth-success page
  // Importantly if the user opens the popup while in this state we don't transition them into another
  // state until we have a detectLoginResult, rendering a spinner in the Authenticating view in the meanwhile.
  // In practice, we transition into this state while the popup isn't mounted so the user should generally be
  // none the wiser.
  | { state: 'detectLogin' }
  // The user is authenticated and we have their user data.
  | { state: 'authenticated'; user: User }

type TabInfo = {
  feedbackTargetType: 'tab'
  id: number
  windowId: number
  active: boolean
  parsedUrl: null | ParseUrlSuccess
  website: 'not fetched' | 'fetching' | 'failure' | Website
  feedbackState: FeedbackState
}

type FeedbackTarget = TabInfo

type FeedbackTargetId = FeedbackTarget['id']

type StoreState = {
  popupConnected: boolean
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
  darkModeOn: boolean
  pickingEmoji: boolean
  addImageDisabled: boolean
  postTweetDisabled: boolean
  websiteFetched: boolean
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
  | { type: 'authSuccess'; payload: { tabId: number } }
  | { type: 'detectLoginStart' }
  | { type: 'detectLoginResult'; payload: FetchRoarResult<{ photoUrl: null | string }> }
  | { type: 'fetchWebsiteStart'; payload: { tabId: number } }
  | { type: 'fetchWebsiteSuccess'; payload: { tabId: number; website: Website } }
  | { type: 'fetchWebsiteFailure'; payload: { tabId: number; domain: string; failure: FetchRoarFailure } }
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

type Listener<A extends Action, T extends A['type']> = (state: StoreState & { mostRecentAction: A & { type: T } }) => void

type Listeners<A extends Action> = {
  [T in A['type']]?: Listener<A, T>
}

type HandleCacheEntry = {
  domain: string
  twitter_handle: string
  non_default_twitter_handles: ReadonlyArray<WebsiteNonDefaultTwitterHandle>
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

type WebsiteNonDefaultTwitterHandle = {
  subdomain: null | string
  path: null | string
  twitter_handle: string
}

type Website = {
  domain: string
  twitter_handle: null | string
  non_default_twitter_handles: ReadonlyArray<WebsiteNonDefaultTwitterHandle>
}

type ParseDomainListed = {
  type: 'LISTED'
  hostname: string
  labels: string
  icann: {
    subDomains: ReadonlyArray<string>
    domain: string
    topLevelDomains: ReadonlyArray<string>
  }
  subDomains: ReadonlyArray<string>
  domain: string
  topLevelDomains: ReadonlyArray<string>
}

type ParseDomainError = {
  type: 'INVALID'
  errors: ReadonlyArray<{
    type: string
    message: string
  }>
}

type ParseDomainResult = ParseDomainListed | ParseDomainError | { type: 'IP' } | { type: 'RESERVED' } | { type: 'NOT_LISTED' }
declare module 'parse-domain' {
  export function parseDomain(hostname: string): ParseDomainResult
}

type ParseUrlSuccess = {
  host: string
  hostWithoutSubDomain: string
  subdomain?: string
  firstPath?: string
  fullWithFirstPath: string
  fullWithoutQuery: string
}

type ParseUrlResult = null | ParseUrlSuccess
