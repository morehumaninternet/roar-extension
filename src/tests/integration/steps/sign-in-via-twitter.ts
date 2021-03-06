import { expect } from 'chai'
import { Mocks } from '../mocks'

export function signInViaTwitter(mocks: Mocks): void {
  describe('sign in via twitter', () => {
    let popupWindow // tslint:disable-line:no-let
    before(() => (popupWindow = mocks.popupWindow()))

    it('creates a new tab at /v1/auth/twitter when the sign in button is clicked', () => {
      const signInButton = mocks.app().querySelector('.sign-in-btn')! as HTMLButtonElement
      signInButton.click()
      expect(mocks.chrome.tabs.create).to.have.callCount(1)
      expect(mocks.chrome.tabs.create.firstCall.args[0]).to.have.property('url', `https://test-roar-server.com/v1/auth/twitter`)
      expect(mocks.chrome.tabs.create.firstCall.args[0]).to.have.property('active', true)
    })

    it('closes the popup window', () => {
      expect(popupWindow.close).to.have.callCount(1)
    })

    it('the popup disconnects when the window unloads', () => {
      expect(mocks.getState().mostRecentAction).to.eql({ type: 'popupDisconnect' })
    })
  })
}
