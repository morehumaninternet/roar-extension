import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { signInViaTwitter } from './steps/sign-in-via-twitter'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { expect } from 'chai'

describe('authentication failure', () => {
  const mocks = createMocks()

  runBackground(mocks, { allowActionFailure: true })
  mountPopup(mocks, { handle: 'exists' })
  signInViaTwitter(mocks)
  authenticateViaTwitter(mocks, { unauthorized: true })

  describe('on unauthorized', () => {
    it('goes back to the not-authed view', () => {
      expect(mocks.app().querySelector('.sign-in-btn')!.innerHTML).to.include('Log in with Twitter')
    })

    it('has no alert as incorrect login is handled by twitter itself', () => {
      expect(mocks.app().querySelector('.alert-message')).to.equal(null)
    })
  })
})
