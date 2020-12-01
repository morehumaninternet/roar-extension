import { expect } from 'chai'
import { createMocks } from './mocks'
import { whenState } from '../../redux-utils'
import { ensureActiveTab } from '../../selectors'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { onceAuthenticated } from './steps/once-authenticated'
import { signInViaTwitter } from './steps/sign-in-via-twitter'
import { captureFirstScreenshot } from './steps/capture-first-screenshot'

describe('removing the first screenshot', () => {
  const mocks = createMocks()

  runBackground(mocks)
  mountPopup(mocks, { handle: 'exists' })
  signInViaTwitter(mocks)
  authenticateViaTwitter(mocks)
  onceAuthenticated(mocks)
  captureFirstScreenshot(mocks)

  describe('removing first screenshot', () => {
    it('deletes the first screenshot and immediately has a spinner because the other screenshot is being taken', async () => {
      const firstImage = mocks.app().querySelector('.twitter-interface > .images')!
      const firstScreenshotCloseButton = firstImage.querySelector('.image-thumbnail > .close-button') as HTMLButtonElement
      firstScreenshotCloseButton.click()

      await whenState(mocks.backgroundWindow.store, state => ensureActiveTab(state).feedbackState.images.length === 0)
      await whenState(mocks.backgroundWindow.store, state => ensureActiveTab(state).feedbackState.addingImages === 1)

      expect(mocks.app().querySelectorAll('.image-spinner')).to.have.length(1)
    })

    it('renders the new image that was taken when captureVisibleTab resolves', async () => {
      mocks.resolveLatestCaptureVisibleTab()
      await whenState(mocks.backgroundWindow.store, state => ensureActiveTab(state).feedbackState.images.length === 1)

      expect(mocks.app().querySelectorAll('.image-spinner')).to.have.length(0)
      const images = mocks.app().querySelectorAll('.image-image')
      expect(images).to.have.lengthOf(1)
    })
  })
})
