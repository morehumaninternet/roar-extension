// tslint:disable:no-let
import { expect } from 'chai'
import * as sinon from 'sinon'
import { Mocks } from '../mocks'

export function authenticateViaTwitter(mocks: Mocks): void {
  describe('authentication via twitter', () => {
    let addEventListener: sinon.SinonStub
    let removeEventListener: sinon.SinonStub
    before(() => {
      addEventListener = sinon.stub(mocks.popupWindow, 'addEventListener')
      removeEventListener = sinon.stub(mocks.popupWindow, 'removeEventListener')
    })
    after(() => {
      addEventListener.restore()
      removeEventListener.restore()
    })

    it('transitions to an "authenticating" state and adds an iframe when the sign in with twitter button is clicked', () => {
      const signInButton = mocks.app().querySelector('button')! as HTMLButtonElement
      signInButton.click()
      expect(mocks.getState().auth).to.have.property('state', 'authenticating')
      const iframe = mocks.app().querySelector('iframe')! as HTMLIFrameElement
      expect(iframe).to.have.property('src', 'https://test-roar-server.com/v1/auth/twitter')
    })

    it('listens for a twitter-auth-success message from the iframe and transitions to an "authenticated" state when received', () => {
      expect(addEventListener).to.have.callCount(1)
      const [eventName, callback] = addEventListener.firstCall.args
      expect(eventName).to.equal('message')
      callback({
        origin: 'https://test-roar-server.com',
        data: { type: 'twitter-auth-success', photoUrl: 'https://some-image-url.com/123' },
      })
      expect(mocks.getState().auth).to.have.property('state', 'authenticated')
    })

    it('removes the event listener', () => {
      expect(removeEventListener).to.have.callCount(1)
    })
  })
}
