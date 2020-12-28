/*
  The true entrypoint of the background script. We use dependency injection in receiving global
  objects from index.ts so that we may more easily test how the background script functions.

  The general pattern of the background script is to create a global store that, at any point in
  time, has the entire application state. Responders, exactly one for each action, return the
  updates to be made to the store state. Listeners have various behaviors which take effect after
  an action has been processed by the store and may call external APIs such as fetch or
  chrome.tabs.create to make API requests, create tabs, or start taking screenshots. The results
  of these functions are then dispatched back to the store. Finally, the background script listens
  for various events including changes to tabs/windows and dispatches them to the store.
*/
import { AppStore, create } from './store'
import * as listeners from './listeners'
import { createHandlers } from './api-handlers'
import { monitorTabs } from './monitorTabs'
import { createHandleCache } from './handle-cache'
import { createApi } from './api'
import { whenState } from '../redux-utils'
import { onLogin } from '../copy'

declare global {
  var ROAR_SERVER_URL: string
  interface Window {
    store: AppStore
  }
}

export function run(backgroundWindow: Window, browser: typeof global.browser, chrome: typeof global.chrome, navigator: typeof window.navigator): void {
  // Create an api object with functions to make API calls to the roar server
  const api = createApi(backgroundWindow)

  // Create an object with get/set functions to cache twitter handles, reducing the number of API calls
  const handleCache = createHandleCache(chrome)

  // Attach the store to the window so the popup can access it see src/popup/mount.tsx
  const store = (backgroundWindow.store = create())

  const apiHandlers = createHandlers(api, handleCache, chrome, store.dispatchers)

  // Add a subscription for each listener, passing dependencies to each
  for (const listener of Object.values(listeners)) {
    listener({ window: backgroundWindow, apiHandlers, store, browser, chrome })
  }

  // Monitor tabs & windows, dispatching relevant information to the store
  monitorTabs(store.dispatchers, chrome)

  // When a chrome window is created, detect whether the user is already logged in, only changing the user's auth state on success
  apiHandlers.detectLogin()

  // When the extension is first installed, open the /welcome page
  chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') store.dispatchers.onInstall()
  })

  // When redirected to the /auth-success page, close the tab and detect whether the user is logged in, launching a notification if so
  chrome.webNavigation.onCommitted.addListener(details => {
    if (details.url === `${ROAR_SERVER_URL}/auth-success` && details.transitionQualifiers.includes('server_redirect')) {
      chrome.tabs.remove(details.tabId)
      apiHandlers.detectLogin()
      whenState(store, ({ auth }) => auth.state === 'authenticated')
        .then(() => {
          const notificationId = 'logged-in'
          chrome.notifications.create(notificationId, {
            type: 'basic',
            iconUrl: '/img/roar_128.png',
            ...onLogin,
          })
        })
        .catch(console.error)
    }
  })
}
