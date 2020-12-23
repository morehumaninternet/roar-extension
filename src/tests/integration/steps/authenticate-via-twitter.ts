import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'
import { mount } from '../../../popup/mount'

type AuthenticateViaTwitterOpts = {
  unauthorized?: boolean
}

export function authenticateViaTwitter(mocks: Mocks, opts: AuthenticateViaTwitterOpts = {}): void {
  describe('authentication via twitter', () => {
    before(() => {
      const response = opts.unauthorized ? { status: 401, body: 'Unauthorized' } : { status: 200, body: { photoUrl: 'https://some-image-url.com/123' } }

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
