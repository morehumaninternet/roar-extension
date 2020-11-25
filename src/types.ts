/// <reference path="../node_modules/@types/draft-js/index.d.ts" />
/// <reference path="../node_modules/immutable/dist/immutable.d.ts" />

type Maybe<T> = T | null | undefined

type SupportedBrowser = 'Firefox' | 'Chrome'

type BrowserInfo = { browser: SupportedBrowser; majorVersion: number }

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
  editingImage: null | EditingImageState
  addingImages: number
  images: ReadonlyArray<Image>
  editorState: Draft.EditorState
  twitterHandle: {
    status: 'NEW' | 'IN_PROGRESS' | 'DONE'
    handle: string | null
  }
}

type CharacterLimit = {
  remaining: number
  percentageCompleted: number
}

type User = { photoUrl?: string }

type Auth = { state: 'not_authed' } | { state: 'auth_failed' } | { state: 'authenticating' } | { state: 'authenticated'; user: User }

type TabInfo = {
  feedbackTargetType: 'tab'
  id: number
  windowId: number
  active: boolean
  url?: string
  domain?: string
  feedbackState: FeedbackState
}

type FeedbackTarget = TabInfo | StoreState['help']

type FeedbackTargetId = FeedbackTarget['id']

type StoreState = {
  browserInfo: BrowserInfo
  focusedWindowId: number
  tabs: Immutable.Map<number, TabInfo>
  auth: Auth
  pickingEmoji: boolean
  help: {
    feedbackTargetType: 'help'
    id: 'help'
    on: boolean
    feedbackState: FeedbackState
  }
  alert: null | string | { __html: string }
  mostRecentAction: Action | { type: 'INITIALIZING' }
}

type NotAuthedState = {
  view: 'NotAuthed'
  signInWithTwitter(): void
}

type AuthenticatingState = {
  view: 'Authenticating'
  browser: SupportedBrowser
  authenticationFailure: Dispatchers<UserAction>['authenticationFailure']
  authenticationSuccess: Dispatchers<UserAction>['authenticationSuccess']
}

type AuthFailedState = {
  view: 'AuthFailed'
  signInWithTwitter(): void
}

type AuthenticatedState = {
  view: 'Authenticated'
  feedback: { exists: true; state: FeedbackState } | { exists: false; reasonDisabledMessage: null | string }
  user: User
  tweeting: null | { at: string }
  helpOn: boolean
  pickingEmoji: boolean
  addImageDisabled: boolean
  deleteImageDisabled: boolean
  postTweetDisabled: boolean
  characterLimit: CharacterLimit
  dispatchUserActions: Dispatchers<UserAction>
}

type AppState = NotAuthedState | AuthenticatingState | AuthFailedState | AuthenticatedState

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
  | { type: 'authenticationSuccess'; payload: { photoUrl?: string } }
  | { type: 'authenticationFailure'; payload: { error: any } }
  | { type: 'dismissAlert' }
  | { type: 'updateEditorState'; payload: { editorState: any } }
  | { type: 'clickPost' }
  | { type: 'togglePickingEmoji' }
  | { type: 'toggleHelp' }
  | { type: 'emojiPicked'; payload: { emoji: string } }
  | { type: 'clickTakeScreenshot' }
  | { type: 'clickDeleteImage'; payload: { imageIndex: number } }
  | { type: 'startEditingImage'; payload: { imageIndex: number } }
  | { type: 'imageUpload'; payload: { file: File } }

type BackgroundAction =
  | { type: 'fetchHandleStart'; payload: { tabId: number } }
  | { type: 'fetchHandleSuccess'; payload: { tabId: number; domain: string; handle: string } }
  | { type: 'fetchHandleFailure'; payload: { tabId: number; domain: string; error: any } }
  | { type: 'postTweetStart'; payload: { targetId: FeedbackTargetId } }
  | { type: 'postTweetSuccess'; payload: { targetId: FeedbackTargetId } }
  | { type: 'postTweetFailure'; payload: { targetId: FeedbackTargetId; error: any } }
  | { type: 'imageCaptureStart'; payload: { targetId: FeedbackTargetId } }
  | { type: 'imageCaptureSuccess'; payload: { targetId: FeedbackTargetId; image: Image } }
  | { type: 'imageCaptureFailure'; payload: { targetId: FeedbackTargetId; error: any } }
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
