import { expect } from 'chai'
import * as sinon from 'sinon'
import { Mocks } from '../mocks'

type SignInViaTwitterOpts = { browser?: SupportedBrowser }

export function signInViaTwitter(mocks: Mocks, opts: SignInViaTwitterOpts = {}): void {
  describe('sign in via twitter', () => {
    let windowClose: sinon.SinonStub // tslint:disable-line:no-let

    before(() => (windowClose = sinon.stub(mocks.popupWindow, 'close')))
    after(() => windowClose.restore())

    it('transitions to an "authenticating" state when the sign in with twitter button is clicked', async () => {
      const signInButton = mocks.app().querySelector('button')! as HTMLButtonElement
      signInButton.click()
      expect(mocks.getState().auth).to.have.property('state', 'authenticating')
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('closes the popup window', () => {
      expect(windowClose).to.have.callCount(1)
    })
  })
}
