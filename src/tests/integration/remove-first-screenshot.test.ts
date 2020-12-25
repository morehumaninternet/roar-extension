import { expect } from 'chai'
import { createMocks } from './mocks'
import { ensureActiveTab } from '../../selectors'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { signInViaTwitter } from './steps/sign-in-via-twitter'
import { captureFirstScreenshot } from './steps/capture-first-screenshot'

describe('removing the first screenshot', () => {
  const mocks = createMocks()

  runBackground(mocks)
  mountPopup(mocks, { handle: 'exists' })
  signInViaTwitter(mocks)
  authenticateViaTwitter(mocks)
  captureFirstScreenshot(mocks)

  describe('removing first screenshot', () => {
    it('deletes the first screenshot and does not take a new one', async () => {
      const firstImage = mocks.app().querySelector('.twitter-interface > .images')!
      const firstScreenshotCloseButton = firstImage.querySelector('.image-thumbnail > .close-btn') as HTMLButtonElement
      firstScreenshotCloseButton.click()

      const state = await mocks.whenState(state => ensureActiveTab(state).feedbackState.images.length === 0)
      const activeTab = ensureActiveTab(state)
      expect(activeTab.feedbackState.addingImages).to.equal(0)
      expect(mocks.app().querySelectorAll('.image-spinner')).to.have.length(0)
    })
  })
})
