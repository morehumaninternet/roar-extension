// tslint:disable:no-let
import { expect } from 'chai'
import * as sinon from 'sinon'
import { Mocks } from '../mocks'
import { mount } from '../../../popup/mount'

type AuthenticateViaTwitterOpts = {
  browser?: SupportedBrowser
}

export function authenticateViaTwitter(mocks: Mocks, opts: AuthenticateViaTwitterOpts = {}): void {
  describe('authentication via twitter', () => {
    let windowClose: sinon.SinonStub

    before(() => {
      windowClose = sinon.stub(mocks.popupWindow, 'close')
    })
    after(() => {
      mocks.chrome.tabs.create.reset()
      windowClose.restore()
    })

    it('transitions to an "authenticating" state when the sign in with twitter button is clicked', async () => {
      const signInButton = mocks.app().querySelector('button')! as HTMLButtonElement
      signInButton.click()
      expect(mocks.getState().auth).to.have.property('state', 'authenticating')
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    if (opts.browser === 'Firefox') {
      it('creates a new tab', () => {
        expect(5).to.equal(5)
        expect(mocks.chrome.tabs.create).to.have.callCount(1)
        expect(mocks.chrome.tabs.create.firstCall.args[0]).to.have.property('url', 'https://test-roar-server.com/v1/auth/twitter')
        expect(mocks.chrome.tabs.create.firstCall.args[0]).to.have.property('active', true)
      })

      it('closes the popup window', () => {
        expect(windowClose).to.have.callCount(1)
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
    } else {
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
    }
  })
}
