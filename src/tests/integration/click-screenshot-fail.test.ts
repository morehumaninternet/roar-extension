import { expect } from 'chai'
import { createMocks } from './mocks'
import { whenState } from '../../redux-utils'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { signInViaTwitter } from './steps/sign-in-via-twitter'

describe('screenshotCaptureFailure + clickPost', () => {
  const mocks = createMocks()

  runBackground(mocks, { allowActionFailure: true })
  mountPopup(mocks)
  signInViaTwitter(mocks)
  authenticateViaTwitter(mocks)

  // See clickPost in src/background/listeners.ts
  describe('on screenshot failure', () => {
    it('does not post the screenshot if capturing the visible tab fails', async () => {
      const postButton = mocks.app().querySelector('.twitter-interface button.post-btn')! as HTMLButtonElement
      postButton.click()

      expect(mocks.getState().mostRecentAction.type).to.equal('clickPost')

      mocks.rejectLatestCaptureVisibleTab()

      const state = await whenState(mocks.backgroundWindow.store, state => state.mostRecentAction.type !== 'clickPost')

      expect(state.alert).to.equal('Could not take screenshot')
    })
  })
})
