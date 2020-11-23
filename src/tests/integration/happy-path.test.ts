// tslint:disable:no-let
import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { createMocks } from './mocks'
import { whenState } from '../../redux-utils'
import { activeTab, ensureActiveFeedbackTarget, ensureActiveTab } from '../../selectors'
import { appendEntity } from '../../draft-js-utils'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { onceAuthenticated } from './steps/once-authenticated'
import { signInViaTwitter } from './steps/sign-in-via-twitter'

happyPath({ browser: 'Chrome' })
happyPath({ browser: 'Firefox' })

function happyPath(opts: { browser: SupportedBrowser }): void {
  describe('happy path for ' + opts.browser, () => {
    const mocks = createMocks(opts)

    runBackground(mocks)
    mountPopup(mocks)
    signInViaTwitter(mocks, opts)
    authenticateViaTwitter(mocks, opts)
    onceAuthenticated(mocks)

    describe('images', () => {
      it('renders an image spinner until the screenshot is added', () => {
        const activeTab = ensureActiveTab(mocks.getState())
        expect(activeTab.feedbackState.addingImages).to.equal(1)
        expect(activeTab.feedbackState.images).to.have.length(0)
        expect(mocks.app().querySelectorAll('.image-spinner')).to.have.length(1)
      })

      it('renders the screenshot and removes the spinner once it is added', async () => {
        mocks.resolveLatestCaptureVisibleTab()
        const state = await whenState(mocks.backgroundWindow.store, state => ensureActiveTab(state).feedbackState.addingImages === 0)
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

        // User can't remove images if there's only one
        const closeButton = imageThumbnail?.querySelector('.close-button')
        expect(closeButton).to.equal(null)
      })

      it('takes a screenshot when the TakeScreenshot button is clicked', async () => {
        const tab = activeTab(mocks.getState())!
        expect(tab.feedbackState.images).to.have.lengthOf(1)
        const takeScreenshotButton = mocks.app().querySelector('.TakeScreenshot')! as HTMLButtonElement
        takeScreenshotButton.click()
        mocks.resolveLatestCaptureVisibleTab()
        await whenState(mocks.backgroundWindow.store, state => ensureActiveTab(state).feedbackState.images.length === 2)
        const images = mocks.app().querySelectorAll('.image-image')
        expect(images).to.have.lengthOf(2)
      })

      it('delete a screenshot when the close-button is clicked', async () => {
        const images = mocks.app().querySelectorAll('.twitter-interface > .images')!
        const secondScreenshotCloseButton = images[0].querySelector('.image-thumbnail > .close-button') as HTMLButtonElement

        // If there are two images, the close button should exist
        secondScreenshotCloseButton.click()
        await whenState(mocks.backgroundWindow.store, state => ensureActiveTab(state).feedbackState.images.length === 1)
      })

      it('disable the take screenshot button when there are 9 images', async () => {
        let imagesLength: number = 1
        while (imagesLength < 9) {
          const takeScreenshotButton = mocks.app().querySelector('.TakeScreenshot')! as HTMLButtonElement
          takeScreenshotButton.click()
          expect(mocks.app().querySelectorAll('.image-spinner')).to.have.length(1)
          mocks.resolveLatestCaptureVisibleTab()
          await whenState(mocks.backgroundWindow.store, state => ensureActiveTab(state).feedbackState.images.length === imagesLength + 1)
          expect(mocks.app().querySelectorAll('.image-spinner')).to.have.length(0)
          const images = mocks.app().querySelectorAll('.image-image')
          expect(images).to.have.lengthOf(imagesLength + 1)
          imagesLength++
        }

        expect(mocks.app().querySelector('.TakeScreenshot')).to.have.property('disabled', true)
      })
    })

    describe('feedback editing', () => {
      it('can edit the feedback', () => {
        const tab = ensureActiveTab(mocks.getState())

        mocks.backgroundWindow.store.dispatch({
          type: 'updateEditorState',
          payload: {
            editorState: appendEntity(tab.feedbackState.editorState, 'This is some feedback'),
          },
        })

        const spans = mocks.app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
        expect(spans).to.have.length(2)
        expect(spans[0]).to.have.property('innerHTML', '@zing')
        expect(spans[1]).to.have.property('innerHTML', ' This is some feedback')
      })

      it('allows you to give feedback directly to Roar by clicking the help button', async () => {
        const helpButton = mocks.app().querySelector('.Help')! as HTMLButtonElement
        helpButton.click()

        const initialSpans = mocks.app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
        expect(initialSpans).to.have.length(2)
        expect(initialSpans[0]).to.have.property('innerHTML', '@roarmhi')
        expect(initialSpans[1]).to.have.property('innerHTML', ' ')

        mocks.backgroundWindow.store.dispatch({
          type: 'updateEditorState',
          payload: {
            editorState: appendEntity(mocks.getState().help.feedbackState.editorState, 'different feedback'),
          },
        })

        const nextSpans = mocks.app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
        expect(nextSpans).to.have.length(2)
        expect(nextSpans[0]).to.have.property('innerHTML', '@roarmhi')
        expect(nextSpans[1]).to.have.property('innerHTML', ' different feedback')
      })

      it('switches back to the tab-specific feedback when you click the help button again', () => {
        const helpButton = mocks.app().querySelector('.Help')! as HTMLButtonElement
        helpButton.click()

        const spans = mocks.app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
        expect(spans).to.have.length(2)
        expect(spans[0]).to.have.property('innerHTML', '@zing')
        expect(spans[1]).to.have.property('innerHTML', ' This is some feedback')
      })
    })

    describe('character limit', () => {
      it('disable the post button when the feedback is longer than 280 characters', () => {
        const tab = ensureActiveTab(mocks.getState())

        // Updating the editor state with a long feedback
        mocks.backgroundWindow.store.dispatch({
          type: 'updateEditorState',
          payload: {
            editorState: appendEntity(tab.feedbackState.editorState, 'x'.repeat(281)),
          },
        })

        // Make sure the post button is disabled
        const postButton = mocks.app().querySelector('.twitter-interface button.post-btn')! as HTMLButtonElement
        expect(postButton.disabled).to.equal(true)

        // Update the editor state to the original state
        mocks.backgroundWindow.store.dispatch({
          type: 'updateEditorState',
          payload: {
            editorState: tab.feedbackState.editorState,
          },
        })
      })
    })

    describe('posting feedback', () => {
      before(() => {
        fetchMock.mock('https://test-roar-server.com/v1/feedback', { status: 201, body: { url: 'https://t.co/sometweethash' } })
      })
      after(() => {
        fetchMock.restore()
      })

      it('posts feedback upon clicking the post button', async () => {
        const postButton = mocks.app().querySelector('.twitter-interface button.post-btn')! as HTMLButtonElement
        postButton.click()

        expect(mocks.getState().mostRecentAction.type).to.equal('clickPost')
        await whenState(mocks.backgroundWindow.store, state => ensureActiveFeedbackTarget(state).feedbackState.isTweeting)

        const [url, opts] = fetchMock.lastCall()!
        expect(url).to.equal('https://test-roar-server.com/v1/feedback')
        expect(opts).to.have.all.keys('method', 'credentials', 'body')
        expect(opts).to.have.property('method', 'POST')
        expect(opts).to.have.property('credentials', 'include')

        const body: FormData = opts!.body! as any
        expect(body.get('status')).to.equal('@zing This is some feedback')
        expect(body.get('domain')).to.equal('zing.com')
        const screenshot: any = body.get('images') as any
        expect(screenshot.name.startsWith('zing.com')).to.equal(true)
        expect(screenshot.name.endsWith('.png')).to.equal(true)

        const tweetInProgress = mocks.app().querySelector('.tweet-in-progress')!
        expect(tweetInProgress).to.have.property('innerHTML', 'Tweeting your feedback to @zing')
      })

      it('launches a new tab with the tweet upon completion and clears the existing feedback', async () => {
        await whenState(mocks.backgroundWindow.store, state => !ensureActiveTab(state).feedbackState.isTweeting)
        expect(mocks.chrome.tabs.create).to.have.been.calledOnceWithExactly({
          url: 'https://t.co/sometweethash',
          active: true,
        })

        const spans = mocks.app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
        expect(spans).to.have.length(2)
        expect(spans[0]).to.have.property('innerHTML', '@zing')
        expect(spans[1]).to.have.property('innerHTML', ' ')
      })
    })
  })
}
