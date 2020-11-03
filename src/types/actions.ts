type UserAction =
  | { type: 'POPUP_CONNECT' }
  | { type: 'POPUP_DISCONNECT' }
  | { type: 'SIGN_IN_WITH_TWITTER' }
  | { type: 'AUTHENTICATED_VIA_TWITTER' }
  | { type: 'DISMISS_ALERT' }
  | { type: 'UPDATE_EDITOR_STATE'; payload: { editorState: any } }
  | { type: 'CLICK_POST' }
  | { type: 'EMOJI_PICKED'; payload: { emoji: string } }
  | { type: 'CLICK_TAKE_SCREENSHOT' }

type BackgroundAction =
  | { type: 'SCREENSHOT_CAPTURE_SUCCESS'; payload: { screenshot: Screenshot } }
  | { type: 'SCREENSHOT_CAPTURE_FAILURE'; payload: { error: any } }
  | { type: 'POST_TWEET_SUCCESS'; payload: { tweetResult: any } }
  | { type: 'POST_TWEET_FAILURE'; payload: { error: any } }
  | { type: 'chrome.windows.getAll'; payload: { windows: chrome.windows.Window[] } }
  | { type: 'chrome.tabs.query'; payload: { tabs: chrome.tabs.Tab[] } }
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
  authenticatedViaTwitter(): void
  dismissAlert(): void
  updateEditorState(editorState: any): void
  clickPost(): void
  emojiPicked(emoji: string): void
  clickTakeScreenshot(): void
}

type DispatchBackgroundActions = {
  screenshotCaptureSuccess(screenshot: Screenshot): void
  screenshotCaptureFailure(error: any): void
  postTweetSuccess(tweetResult: any): void
  postTweetFailure(error: any): void
}
