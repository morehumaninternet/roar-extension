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
import { listeners } from './listeners'
import * as apiHandlers from './api-handlers'
import { monitorChrome } from './monitorChrome'

declare global {
  interface Window {
    store: AppStore
  }
}

export function run(backgroundWindow: Window): void {
  // Attach the store to the window so the popup can access it see src/popup/mount.tsx
  const store = (backgroundWindow.store = create())

  // Add a subscription for each listener, passing dependencies to each
  for (const listener of Object.keys(listeners) as ReadonlyArray<Action['type']>) {
    store.on(listener, listeners[listener]!)
  }

  // Monitor various events managed by the chrome API, dispatching relevant information to the store
  // see https://developer.chrome.com/docs/extensions/reference/
  monitorChrome(store.dispatchers, chrome)

  // When a chrome window is created, detect whether the user is already logged in
  apiHandlers.detectLogin()
}
