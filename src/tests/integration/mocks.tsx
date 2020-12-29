/*
  Creates, for tests running in node.js, objects representing the background window, popup
  window(s), and other globals that otherwise exist only in a browser context.

  By calling createMocks() within a describe block, the mocks will be created within that block.
  While various stubs/mocks are added to the global object, these are handled as part of various
  setup/teardown functions that run before/after the describe blocks. Note that the mocks won't
  work if created outside of a describe block because those setup/teardown functions won't run
  and they are necessary for the mocks functioning properly. If you're making a new integration
  test and not quite sure how to get started, best to copy and paste an existing test and change
  what's different!

  Notably, there is a single backgroundWindow created as part of a mocks instance because there
  should always only ever be one background window over the lifetime of the extension. However,
  we create a mount function here which allows a popupWindow to be created and the popup/mount
  function run against it on demand. This is because the authentication lifecycle often requires
  you to mount/open the popup twice. The first time you are not_authed and will be asked to sign
  in. Clicking that button will create a separate tab outside the popup where you'll log in,
  which also closes the popupWindow (a behavior we code up here as part of the callsFake of
  popupWindow.close). Then after logging in, we detect a redirect to the auth-success page where
  another detectLogin call determines that the user is logged in and transitions the user to an
  authenticated state.

  The globally available browser and chrome objects are mocked here as well. For browser we only
  use a handful of functions we define ourselves. For chrome, we use sinon-chrome with a few
  augmentations to have getBackgroundPage return the background page and have tabs.create close
  a popup window if one exists, both behaviors we can reliably expect from browsers.

  As part of the teardown we also validate that fetchMock was called the appropriate number of
  times with the correct requests. Note that fetchMock adds its own fetch function to the global
  object so we don't do that ourselves here.

  Finally, some functions are added for common operations need by tests, including getting the
  div.app DOM elment via mocks.app(), the current StoreState via mocks.getState(), and allowing
  the tester to await the store state meeting some predicate with mocks.whenState(predicate).
*/

// tslint:disable:no-let readonly-array
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as fetchMock from 'fetch-mock'
import { last } from 'lodash'
import { readFileSync } from 'fs'
import * as sinon from 'sinon'
import * as chrome from 'sinon-chrome'
import { JSDOM, DOMWindow } from 'jsdom'
import { mount } from '../../popup/mount'
import { whenState } from '../../redux-utils'

type MockBrowser = typeof global.browser & {
  tabs: {
    captureVisibleTab: sinon.SinonStub
    get: sinon.SinonStub
  }
}

export type Mocks = {
  backgroundWindow: DOMWindow
  popupWindow(): DOMWindow
  browser: MockBrowser
  chrome: typeof chrome
  mount(): void
  app(): HTMLDivElement
  getState(): StoreState
  whenState(cb: (state: StoreState) => boolean): Promise<StoreState>
  resolveLatestCaptureVisibleTab(): void
  rejectLatestCaptureVisibleTab(): void
}

const popupHTML = readFileSync(`${process.cwd()}/html/popup.html`, { encoding: 'utf-8' })
const screenshotUri = readFileSync(`${__dirname}/screenshotUri`, { encoding: 'utf-8' })

fetchMock.config.overwriteRoutes = true

export function createMocks(): Mocks {
  const backgroundWindow: DOMWindow = new JSDOM('', { url: 'https://should-not-appear.com' }).window

  // TODO: use dependency injection in the codebase to access these
  const backgroundWindowGlobals = {
    Blob: backgroundWindow.Blob,
    FormData: backgroundWindow.FormData,
  }

  let popupWindow: any
  let popupWindowGlobals

  const captureVisibleTabResolvers: any[] = []
  const captureVisibleTabRejecters: any[] = []
  const resolveLatestCaptureVisibleTab = () => {
    const resolver = last(captureVisibleTabResolvers)
    resolver(screenshotUri)
  }
  const rejectLatestCaptureVisibleTab = () => {
    const reject = last(captureVisibleTabRejecters)
    reject(new Error('Could not take screenshot'))
  }

  const browser: MockBrowser = {
    tabs: {
      get: sinon.stub().resolves({ width: 1200, height: 900 }),
      captureVisibleTab(): Promise<any> {
        return new Promise((resolve, reject) => {
          captureVisibleTabResolvers.push(resolve)
          captureVisibleTabRejecters.push(reject)
        })
      },
    },
  } as any

  const setup = () => {
    Object.assign(global, backgroundWindowGlobals)
    chrome.tabs.create.callsFake(() => popupWindow?.close())
    chrome.runtime.getBackgroundPage.callsArgWith(0, backgroundWindow)
  }

  const teardownPopupWindow = () => {
    if (popupWindow) {
      // If the popupWindow was not closed, render a blank div into the app-container
      // before removing globals to trigger any cleanup from the React components themselves
      if (!popupWindow.close.callCount) {
        ReactDOM.render(<div />, popupWindow.document.getElementById('app-container'))
      }
      for (const key in popupWindowGlobals) {
        delete (global as any)[key]
      }
    }
    popupWindow = undefined
    popupWindowGlobals = undefined
  }

  const teardownBackgroundWindow = () => {
    for (const key in backgroundWindowGlobals) {
      delete (global as any)[key]
    }
    chrome.reset()
    const err = !fetchMock.done() && new Error('Fetch not called the expected number of times')
    fetchMock.restore()
    if (err) throw err
  }

  const teardown = () => {
    teardownPopupWindow()
    teardownBackgroundWindow()
    sinon.restore()
    const logError: sinon.SinonStub = global.CONSOLE_ERROR as any
    logError.reset()
  }

  // ReactDOM needs a global window to work with
  const mountPopup = () => {
    popupWindow = new JSDOM(popupHTML, { url: 'https://should-not-appear.com' }).window

    const addEventListener = sinon.spy(popupWindow, 'addEventListener')

    popupWindowGlobals = {
      window: popupWindow,
      location: popupWindow.location,
      document: popupWindow.document,
      Node: popupWindow.Node,
      requestAnimationFrame: sinon.stub().callsArgWith(0),
    }

    Object.assign(global, popupWindowGlobals)

    const close = popupWindow.close.bind(popupWindow)

    // Stub popupWindow.close so we can monitor it and do some teardown when it is closed
    sinon.stub(popupWindow, 'close').callsFake(() => {
      // Call the unload callback on popupWindow close
      const unloadListener = addEventListener.getCalls().find(({ args: [eventName] }) => eventName === 'unload')!
      const [, unloadCallback] = unloadListener.args
      unloadCallback()
      // Call the actual window.close function
      close()

      /* I'm not 100% sure why this can't run on the same tick of the event loop, but without this we see

        Uncaught Error: Should not already be working.
          at performSyncWorkOnRoot (node_modules/react-dom/cjs/react-dom.development.js:22265:13)

        I'm guessing that JSDOM's window.close does some things on the next tick of the event loop itself,
        so we wait for that to finish before tearing everything down ourselves. Since we'll never mount and
        close several popup windows all at once, this is fine.
      */
      process.nextTick(teardownPopupWindow)
    })
    mount(chrome as any, popupWindow as any)
  }

  const app = () => popupWindow.document.querySelector('#app-container > .app') as HTMLDivElement
  const getState = () => backgroundWindow.store.getState()

  before(setup)
  after(teardown)

  return {
    mount: mountPopup,
    backgroundWindow,
    popupWindow(): DOMWindow {
      return popupWindow
    },
    browser,
    chrome,
    app,
    getState,
    resolveLatestCaptureVisibleTab,
    rejectLatestCaptureVisibleTab,
    whenState(cb): Promise<StoreState> {
      return whenState(backgroundWindow.store, cb)
    },
  }
}
