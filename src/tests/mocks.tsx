import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { readFileSync } from 'fs'
import * as sinon from 'sinon'
import * as chrome from 'sinon-chrome'
import { JSDOM, DOMWindow } from 'jsdom'

type MockBrowser = typeof global.browser & {
  tabs: {
    captureVisibleTab: sinon.SinonStub
  }
}

export type Mocks = {
  backgroundWindow: Window
  popupWindow: DOMWindow
  browser: MockBrowser
  chrome: typeof chrome
  teardown(): void
}

const popupHTML = readFileSync(`${process.cwd()}/html/popup.html`, { encoding: 'utf-8' })
const screenshotUri = readFileSync(`${process.cwd()}/src/tests/screenshotUri`, { encoding: 'utf-8' })

export function createMocks(): Mocks {
  const backgroundWindow: Window = {} as any

  chrome.runtime.getBackgroundPage.callsArgWith(0, backgroundWindow)

  const popupWindow = new JSDOM(popupHTML).window
  popupWindow.roarServerUrl = 'https://test-roar-server.com'

  const browser: MockBrowser = {
    tabs: {
      captureVisibleTab: sinon.stub().withArgs({ format: 'png' }).resolves(screenshotUri),
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
  Object.assign(global, popupWindowGlobals)

  const teardown = () => {
    // Render a blank div into the app-container before removing globals to trigger any cleanup from the React components themselves
    ReactDOM.render(<div />, popupWindow.document.getElementById('app-container'))
    for (const key in popupWindowGlobals) {
      delete (global as any)[key]
    }
    chrome.reset()
  }

  return { backgroundWindow, popupWindow, browser, chrome, teardown }
}
