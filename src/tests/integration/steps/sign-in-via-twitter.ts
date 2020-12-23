import { expect } from 'chai'
import * as sinon from 'sinon'
import { Mocks } from '../mocks'

type SignInViaTwitterOpts = { browser?: SupportedBrowser }

export function signInViaTwitter(mocks: Mocks, opts: SignInViaTwitterOpts = {}): void {
  describe('sign in via twitter', () => {
    let popupWindow // tslint:disable-line:no-let
    before(() => (popupWindow = mocks.popupWindow()))

    it('transitions to an "authenticating" state when the sign in with twitter button is clicked', async () => {
      const signInButton = mocks.app().querySelector('.sign-in-btn')! as HTMLButtonElement
      signInButton.click()
      expect(mocks.getState().auth).to.have.property('state', 'authenticating')
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('closes the popup window', () => {
      expect(popupWindow.close).to.have.callCount(1)
    })
  })
}
