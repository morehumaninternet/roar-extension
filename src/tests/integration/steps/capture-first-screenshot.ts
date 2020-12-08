// tslint:disable:no-let
import { expect } from 'chai'
import { Mocks } from '../mocks'
import { ensureActiveTab } from '../../../selectors'

export function captureFirstScreenshot(mocks: Mocks): void {
  describe('capturing first screenshot', () => {
    it('renders an image spinner until the screenshot is added', () => {
      const activeTab = ensureActiveTab(mocks.getState())
      expect(activeTab.feedbackState.addingImages).to.equal(1)
      expect(activeTab.feedbackState.images).to.have.length(0)
      expect(mocks.app().querySelectorAll('.image-spinner')).to.have.length(1)
    })

    it('renders the screenshot and removes the spinner once it is added', async () => {
      mocks.resolveLatestCaptureVisibleTab()
      const state = await mocks.whenState(state => ensureActiveTab(state).feedbackState.addingImages === 0)
      const activeTab = ensureActiveTab(state)
      expect(activeTab.feedbackState.addingImages).to.equal(0)
      expect(activeTab.feedbackState.images).to.have.length(1)
      const [image] = activeTab.feedbackState.images
      if (image.type === 'imageupload') throw new Error('Expected screenshot')
      expect(image.tab.id).to.equal(activeTab.id)
      expect(image.tab.url).to.equal(activeTab.url)
      expect(image.tab.width).to.equal(1200)
      expect(image.tab.height).to.equal(900)
      expect(image.blob).to.be.an.instanceof(Blob)

      expect(mocks.app().querySelectorAll('.image-spinner')).to.have.length(0)
      const imageThumbnail = mocks.app().querySelector('.twitter-interface > .images > .image-thumbnail')

      const imageImage = imageThumbnail?.querySelector('.image-image')
      expect(imageImage).to.have.property('src', image.uri)
    })
  })
}
