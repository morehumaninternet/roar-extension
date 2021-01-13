import { expect } from 'chai'
import { Mocks } from '../mocks'

export function onInstalled(mocks: Mocks, opts: { reason: 'update' | 'install' }): void {
  describe(`onInstalled with reason: ${opts.reason}`, () => {
    before(() => {
      const [callback] = mocks.chrome.runtime.onInstalled.addListener.firstCall.args
      callback({ reason: opts.reason })
    })

    if (opts.reason === 'update') {
      it('does nothing', () => {
        expect(mocks.chrome.tabs.create).to.have.callCount(0)
        expect(mocks.getState().auth.state).to.equal('not_authed')
      })
    } else {
      it('opens the /roar/welcome page when the reason is "install"', () => {
        expect(mocks.chrome.tabs.create).to.have.been.calledOnceWithExactly({
          active: true,
          url: 'https://test-mhi.org/roar/welcome',
        })
      })
    }
  })
}
