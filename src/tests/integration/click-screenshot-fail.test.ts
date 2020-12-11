import { expect } from 'chai'
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { signInViaTwitter } from './steps/sign-in-via-twitter'

describe('screenshotCaptureFailure + clickPost', () => {
  const mocks = createMocks()

  runBackground(mocks, { allowActionFailure: true })
  mountPopup(mocks, { handle: 'exists' })
  signInViaTwitter(mocks)
  authenticateViaTwitter(mocks)

  // See clickPost in src/background/listeners.ts
  describe('on screenshot failure', () => {
    it('does not post the screenshot if capturing the visible tab fails', async () => {
      const postButton = mocks.app().querySelector('.twitter-interface button.post-btn')! as HTMLButtonElement
      postButton.click()

      expect(mocks.getState().mostRecentAction.type).to.equal('clickPost')

      mocks.rejectLatestCaptureVisibleTab()

      const state = await mocks.whenState(state => state.mostRecentAction.type !== 'clickPost')

      expect(state.alertHtml).to.equal(
        'Something went wrong. Please try again. If this error persists, please contact <a href="mailto:support@morehumaninternet.org">support@morehumaninternet.org</a>'
      )
    })
  })
})
