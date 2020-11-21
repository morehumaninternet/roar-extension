import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { last } from 'lodash'
import { readFileSync } from 'fs'
import * as sinon from 'sinon'
import * as chrome from 'sinon-chrome'
import { JSDOM, DOMWindow } from 'jsdom'

type MockBrowser = typeof global.browser & {
  tabs: {
    captureVisibleTab: sinon.SinonStub
    get: sinon.SinonStub
  }
}

export type Mocks = {
  backgroundWindow: Window
  popupWindow: DOMWindow
  browser: MockBrowser
  chrome: typeof chrome
  app(): HTMLDivElement
  getState(): StoreState
  resolveLatestCaptureVisibleTab(): void
  rejectLatestCaptureVisibleTab(): void
}

const popupHTML = readFileSync(`${process.cwd()}/html/popup.html`, { encoding: 'utf-8' })
const screenshotUri = readFileSync(`${__dirname}/screenshotUri`, { encoding: 'utf-8' })

export function createMocks(): Mocks {
  const backgroundWindow: Window = {
    navigator: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36',
    },
  } as any

  const popupWindow = new JSDOM(popupHTML).window
  popupWindow.roarServerUrl = 'https://test-roar-server.com'

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
    document: popupWindow.document,
    Blob: popupWindow.Blob,
    Node: popupWindow.Node,
    FormData: popupWindow.FormData,
    fetch: popupWindow.fetch,
    requestAnimationFrame: sinon.stub().callsArgWith(0),
  }

  // ReactDOM needs a global window to work
  const setup = () => {
    Object.assign(global, popupWindowGlobals)
    chrome.runtime.getBackgroundPage.callsArgWith(0, backgroundWindow)
  }

  const teardown = () => {
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

  return { backgroundWindow, popupWindow, browser, chrome, app, getState, resolveLatestCaptureVisibleTab, rejectLatestCaptureVisibleTab }
}
