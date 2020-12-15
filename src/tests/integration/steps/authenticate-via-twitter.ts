import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'
import { mount } from '../../../popup/mount'

type AuthenticateViaTwitterOpts = {
  browser?: SupportedBrowser
}

export function authenticateViaTwitter(mocks: Mocks, opts: AuthenticateViaTwitterOpts = {}): void {
  if (opts.browser === 'Firefox') {
    return authenticateViaTwitterFirefox(mocks)
  } else {
    return authenticateViaTwitterChrome(mocks)
  }
}

function authenticateViaTwitterFirefox(mocks: Mocks): void {
  describe('authentication via twitter for Firefox', () => {
    before(() => {
      const response = { status: 200, body: { photoUrl: 'https://some-image-url.com/123' } }
      fetchMock.mock('https://test-roar-server.com/v1/me', response)
    })

    after(() => {
      mocks.chrome.tabs.create.reset()
    })

    it('creates a new tab', () => {
      expect(mocks.chrome.tabs.create).to.have.callCount(1)
      expect(mocks.chrome.tabs.create.firstCall.args[0]).to.have.property('url', 'https://test-roar-server.com/v1/auth/twitter')
      expect(mocks.chrome.tabs.create.firstCall.args[0]).to.have.property('active', true)
    })

    it('the popup disconnects when the window unloads', () => {
      const [eventName, callback] = mocks.popupWindow.addEventListener.firstCall.args
      expect(eventName).to.equal('unload')
      expect(callback).to.be.a('function')
      callback()
      expect(mocks.getState().mostRecentAction).to.eql({ type: 'popupDisconnect' })
    })

    it('makes a request to /v1/me to get the current user when the popup mounts again (after the user has logged in in the separate tab)', () => {
      mount(mocks.chrome as any, mocks.popupWindow as any)
    })
  })
}

function authenticateViaTwitterChrome(mocks: Mocks): void {
  describe('authentication via twitter for chrome', () => {
    it('does not create a new tab or close the window', () => {
      expect(mocks.chrome.tabs.create).to.have.callCount(0)
    })

    it('adds an iframe when the sign in with twitter button is clicked', () => {
      const iframe = mocks.app().querySelector('iframe')! as HTMLIFrameElement
      expect(iframe).to.have.property('src', 'https://test-roar-server.com/v1/auth/twitter')
    })

    it('listens for a twitter-auth-success message from the iframe and transitions to an "authenticated" state when received', () => {
      const [eventName, callback] = mocks.popupWindow.addEventListener.lastCall.args
      expect(eventName).to.equal('message')
      callback({
        origin: 'https://test-roar-server.com',
        data: { type: 'twitter-auth-success', photoUrl: 'https://some-image-url.com/123' },
      })
      expect(mocks.getState().auth).to.have.property('state', 'authenticated')
    })

    it('removes the event listener', () => {
      expect(mocks.popupWindow.removeEventListener).to.have.callCount(1)
    })
  })
}
