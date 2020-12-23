// tslint:disable:no-let readonly-array
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as fetchMock from 'fetch-mock'
import { pick, last } from 'lodash'
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

type CreateMocksOpts = {
  browser?: SupportedBrowser
}

export type Mocks = {
  backgroundWindow: Window
  popupWindow(): DOMWindow & { addEventListener: sinon.SinonSpy }
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

export function createMocks(opts: CreateMocksOpts = {}): Mocks {
  const userAgent =
    opts.browser === 'Firefox'
      ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:82.0) Gecko/20100101 Firefox/82.0'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'

  const backgroundWindow: any = new JSDOM('', { userAgent, url: 'https://should-not-appear.com' }).window
  backgroundWindow.roarServerUrl = 'https://test-roar-server.com'

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
      get: sinon.stub().throws(),
      captureVisibleTab(): Promise<any> {
        return new Promise((resolve, reject) => {
          captureVisibleTabResolvers.push(resolve)
          captureVisibleTabRejecters.push(reject)
        })
      },
    },
  } as any

  // ReactDOM needs a global window to work
  const setup = () => {
    chrome.tabs.create.callsFake(() => {
      if (popupWindow) {
        popupWindow.close()
      }
    })
    chrome.runtime.getBackgroundPage.callsArgWith(0, backgroundWindow)
    browser.tabs.get.resolves({ width: 1200, height: 900 })
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
    chrome.reset()
    const err = !fetchMock.done() && new Error('Fetch not called the expected number of times')
    fetchMock.restore()
    if (err) throw err
  }

  const teardown = () => {
    teardownPopupWindow()
    teardownBackgroundWindow()
    sinon.restore()
  }

  const mountPopup = () => {
    popupWindow = new JSDOM(popupHTML, { url: 'https://should-not-appear.com' }).window
    popupWindow.roarServerUrl = 'https://test-roar-server.com'

    const addEventListener = sinon.spy(popupWindow, 'addEventListener')
    const removeEventListener = sinon.spy(popupWindow, 'removeEventListener')

    popupWindowGlobals = {
      window: popupWindow,
      location: popupWindow.location,
      document: popupWindow.document,
      Blob: popupWindow.Blob,
      Node: popupWindow.Node,
      FormData: popupWindow.FormData,
      requestAnimationFrame: sinon.stub().callsArgWith(0),
    }

    Object.assign(global, popupWindowGlobals)

    const close = popupWindow.close.bind(popupWindow)
    sinon.stub(popupWindow, 'close').callsFake(() => {
      const [, unloadCallback] = addEventListener.getCalls().find(({ args: [eventName] }) => eventName === 'unload')!.args
      unloadCallback()
      close()
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
    popupWindow() {
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
