type UserAction = { type: 'POPUP_CONNECT' } | { type: 'POPUP_DISCONNECT' } | { type: 'DISMISS_ALERT' }

type BackgroundAction =
  | {
      type: 'ACTIVE_TAB_DETECTED'
      payload: { activeTab: browser.tabs.Tab; disabledForTab: boolean }
    }
  | { type: 'NO_ACTIVE_TAB_DETECTED' }
  | { type: 'TAB_CLOSED'; payload: { tabId: number } }
  | { type: 'SCREENSHOT_CAPTURE_SUCCESS'; payload: { screenshot: Screenshot } }
  | { type: 'SCREENSHOT_CAPTURE_FAILURE'; payload: { error: any } }

type Action = UserAction | BackgroundAction

type DispatchUserActions = {
  popupConnect(): void
  popupDisconnect(): void
  dismissAlert(): void
}

type DispatchBackgroundActions = {
  activeTabDetected(activeTab: browser.tabs.Tab, disabledForTab: boolean): void
  noActiveTabDetected(): void
  screenshotCaptureSuccess(screenshot: Screenshot): void
  screenshotCaptureFailure(error: any): void
}
