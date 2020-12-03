import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { last } from 'lodash'
import { readFileSync } from 'fs'
import * as sinon from 'sinon'
import * as chrome from 'sinon-chrome'
import { JSDOM, DOMWindow } from 'jsdom'
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
  popupWindow: DOMWindow & { addEventListener: sinon.SinonSpy }
  browser: MockBrowser
  chrome: typeof chrome
  app(): HTMLDivElement
  getState(): StoreState
  whenState(cb: (state: StoreState) => boolean): Promise<StoreState>
  resolveLatestCaptureVisibleTab(): void
  rejectLatestCaptureVisibleTab(): void
}

const popupHTML = readFileSync(`${process.cwd()}/html/popup.html`, { encoding: 'utf-8' })
const screenshotUri = readFileSync(`${__dirname}/screenshotUri`, { encoding: 'utf-8' })

export function createMocks(opts: CreateMocksOpts = {}): Mocks {
  const userAgent =
    opts.browser === 'Firefox'
      ? 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:82.0) Gecko/20100101 Firefox/82.0'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'

  const backgroundWindow: Window = { navigator: { userAgent } } as any

  const popupWindow: any = new JSDOM(popupHTML, { url: 'https://should-not-appear.com' }).window
  popupWindow.roarServerUrl = 'https://test-roar-server.com'

  let addEventListener: sinon.SinonSpy
  let removeEventListener: sinon.SinonSpy

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
      captureVisibleTab() {
        return new Promise((resolve, reject) => {
          captureVisibleTabResolvers.push(resolve)
          captureVisibleTabRejecters.push(reject)
        })
      },
    },
  } as any

  const popupWindowGlobals = {
    window: popupWindow,
    location: popupWindow.location,
    document: popupWindow.document,
    Blob: popupWindow.Blob,
    Node: popupWindow.Node,
    FormData: popupWindow.FormData,
    fetch: popupWindow.fetch,
    requestAnimationFrame: sinon.stub().callsArgWith(0),
  }

  // ReactDOM needs a global window to work
  const setup = () => {
    addEventListener = sinon.spy(popupWindow, 'addEventListener')
    removeEventListener = sinon.spy(popupWindow, 'removeEventListener')
    Object.assign(global, popupWindowGlobals)
    chrome.runtime.getBackgroundPage.callsArgWith(0, backgroundWindow)
  }

  const teardown = () => {
    addEventListener.restore()
    removeEventListener.restore()
    // Render a blank div into the app-container before removing globals to trigger any cleanup from the React components themselves
    ReactDOM.render(<div />, popupWindow.document.getElementById('app-container'))
    for (const key in popupWindowGlobals) {
      delete (global as any)[key]
    }
    chrome.reset()
  }

  const app = () => popupWindow.document.querySelector('#app-container > .app') as HTMLDivElement
  const getState = () => backgroundWindow.store.getState()

  before(setup)
  after(teardown)

  return {
    backgroundWindow,
    popupWindow,
    browser,
    chrome,
    app,
    getState,
    resolveLatestCaptureVisibleTab,
    rejectLatestCaptureVisibleTab,
    whenState(cb) {
      return whenState(backgroundWindow.store, cb)
    },
  }
}
