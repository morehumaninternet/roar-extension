import { expect } from 'chai'
import { Mocks } from '../mocks'

export function mountBeforeAuthenticateViaTwitter(mocks: Mocks): void {
  describe(`mount before authentication via twitter`, () => {
    it('is in the authenticating state to start', () => {
      expect(mocks.getState().auth.state).to.equal('authenticating')
    })

    it('makes no request to get the current user after the popup mounts again ', () => {
      mocks.mount()
      expect(mocks.getState().auth.state).to.equal('not_authed')
    })
  })
}
