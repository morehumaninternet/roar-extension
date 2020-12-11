import { expect } from 'chai'
import { ensureActiveTab } from '../../../selectors'
import { Mocks } from '../mocks'

export function takingScreenshots(mocks: Mocks): void {
  describe('taking screenshots', () => {
    it('takes a screenshot when the TakeScreenshot button is clicked', async () => {
      const tab = ensureActiveTab(mocks.getState())
      expect(tab.feedbackState.images).to.have.lengthOf(1)
      const takeScreenshotButton = mocks.app().querySelector('.TakeScreenshot')! as HTMLButtonElement
      takeScreenshotButton.click()
      mocks.resolveLatestCaptureVisibleTab()
      await mocks.whenState(state => ensureActiveTab(state).feedbackState.images.length === 2)
      const images = mocks.app().querySelectorAll('.image-image')
      expect(images).to.have.lengthOf(2)
    })

    it('deletes a screenshot when the close-btn is clicked', async () => {
      const imageThumbnails = mocks.app().querySelectorAll('.twitter-interface > .images > .image-thumbnail')!
      const secondScreenshotCloseButton = imageThumbnails[1].querySelector('.close-btn') as HTMLButtonElement
      secondScreenshotCloseButton.click()
      await mocks.whenState(state => ensureActiveTab(state).feedbackState.images.length === 1)
    })

    it('disable the take screenshot button when there are 9 images', async () => {
      let imagesLength: number = 1 // tslint:disable-line:no-let
      while (imagesLength < 9) {
        const takeScreenshotButton = mocks.app().querySelector('.TakeScreenshot')! as HTMLButtonElement
        takeScreenshotButton.click()
        expect(mocks.app().querySelectorAll('.image-spinner')).to.have.length(1)
        mocks.resolveLatestCaptureVisibleTab()
        await mocks.whenState(state => ensureActiveTab(state).feedbackState.images.length === imagesLength + 1)
        expect(mocks.app().querySelectorAll('.image-spinner')).to.have.length(0)
        const images = mocks.app().querySelectorAll('.image-image')
        expect(images).to.have.lengthOf(imagesLength + 1)
        imagesLength++
      }

      expect(mocks.app().querySelector('.TakeScreenshot')).to.have.property('disabled', true)
    })
  })
}
