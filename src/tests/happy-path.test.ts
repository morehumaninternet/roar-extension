// tslint:disable:no-let
import { expect } from 'chai'
import * as sinon from 'sinon'
import * as fetchMock from 'fetch-mock'
import { Map } from 'immutable'
import { createMocks } from './mocks'
import { whenState } from './util'
import { run } from '../background/run'
import { mount } from '../popup/mount'
import { activeTab, ensureActiveTab } from '../selectors'
import { getPlainText, appendEntity } from '../draft-js-utils'

describe('happy path', () => {
  const mocks = createMocks()
  const app = () => mocks.popupWindow.document.querySelector('#app-container > .app')!
  const getState = () => mocks.backgroundWindow.store.getState()

  let unsubscribe: () => void
  after(() => mocks.teardown())
  after(() => unsubscribe())

  describe('background:run', () => {
    before(() => {
      run(mocks.backgroundWindow, mocks.browser, mocks.chrome as any)
      // Throw an error if ever a Failure event is dispatched
      unsubscribe = mocks.backgroundWindow.store.subscribe(() => {
        const { mostRecentAction } = getState()

        if (mostRecentAction.type.endsWith('Failure')) {
          console.error((mostRecentAction as any).payload.error)
          process.exit(1)
        }
      })
    })

    it('loads window.store, which starts with an empty state', () => {
      const state = getState()
      expect(state.focusedWindowId).to.equal(-1)
      expect(state.tabs).to.be.an.instanceOf(Map)
      expect(state.tabs).to.have.property('size', 0)
      expect(state.auth).to.eql({ state: 'not_authed' })
      expect(state.pickingEmoji).to.equal(false)
      expect(state.help.on).to.equal(false)
      expect(state.help.feedbackState).to.be.an('object')
      expect(state.help.feedbackState.editingScreenshot).to.equal(null)
      expect(state.help.feedbackState.screenshots).to.eql([])
      expect(getPlainText(state.help.feedbackState.editorState)).to.equal('@roarmhi ')
      expect(state.help.feedbackState.twitterHandle).to.eql({ status: 'DONE', handle: '@roarmhi' })
      expect(state.alert).to.equal(null)
      expect(state.mostRecentAction).to.eql({ type: 'INITIALIZING' })
    })

    it('sets the focusedWindowId when chrome.windows.getAll calls back', () => {
      expect(mocks.chrome.windows.getAll).to.have.callCount(1)
      const [callback] = mocks.chrome.windows.getAll.firstCall.args
      callback([
        { id: 1, focused: false },
        { id: 2, focused: true },
        { id: 3, focused: false },
      ])
      expect(getState()).to.have.property('focusedWindowId', 2)
    })

    it('sets the tabs when chrome.tabs.query calls back', () => {
      expect(mocks.chrome.tabs.query).to.have.callCount(1)
      const [query, callback] = mocks.chrome.tabs.query.firstCall.args
      expect(query).to.eql({})
      callback([
        { id: 11, windowId: 1, active: false, url: 'https://foo.com/abc' },
        { id: 12, windowId: 1, active: true, url: 'https://bar.com/abc' },
        { id: 13, windowId: 1, active: false, url: 'https://quux.com/abc' },
        { id: 14, windowId: 2, active: true, url: 'https://zing.com/abc' },
        { id: 15, windowId: 2, active: false, url: 'https://slam.com/abc' },
        { id: 16, windowId: 3, active: true, url: 'https://mop.com/abc' },
        { id: 17, windowId: 3, active: true, url: 'chrome://extensions' },
      ])
      const state = getState()
      expect(state.tabs.size).to.equal(7)

      const activeTab = ensureActiveTab(state)
      expect(activeTab).to.have.property('id', 14)
      expect(activeTab).to.have.property('windowId', 2)
      expect(activeTab).to.have.property('active', true)
      expect(activeTab).to.have.property('url', 'https://zing.com/abc')
      expect(activeTab).to.have.property('domain', 'zing.com')
      expect(activeTab.feedbackState).to.have.property('isTweeting', false)
      expect(activeTab.feedbackState).to.have.property('screenshots').that.eql([])

      expect(state.tabs.get(17)).to.have.property('domain', undefined)
    })

    it("uses the tab's domain as the handle as a placeholder prior to fetching the actual twitter handle", () => {
      const state = getState()
      const activeTab = ensureActiveTab(state)
      expect(getPlainText(activeTab.feedbackState.editorState)).to.equal('@zing.com ')
    })
  })

  describe('popup:mount', () => {
    before(() => {
      fetchMock.mock('https://test-roar-server.com/v1/website?domain=zing.com', { status: 200, body: { twitter_handle: '@zing' } })
    })
    before(() => mocks.browser.tabs.get.withArgs(14).resolves({ width: 1200, height: 900 }))
    before(() => mount(mocks.chrome as any, mocks.popupWindow as any))
    after(() => {
      fetchMock.restore()
    })

    it('mounts the app with a button to sign in with twitter', () => {
      const appContainer = mocks.popupWindow.document.getElementById('app-container')!
      const signInWithTwitter = appContainer.querySelector('button')!
      expect(signInWithTwitter).to.have.property('innerHTML', 'Sign in with twitter')
    })

    it('dispatches popupConnect, resulting in the twitter handle being fetched & a screenshot of the active tab getting added to the state', () => {
      const state = getState()
      const activeTab = ensureActiveTab(state)
      expect(activeTab.feedbackState.screenshots).to.have.length(1)

      const [screenshot] = activeTab.feedbackState.screenshots
      expect(screenshot.tab.id).to.equal(activeTab.id)
      expect(screenshot.tab.url).to.equal(activeTab.url)
      expect(screenshot.tab.width).to.equal(1200)
      expect(screenshot.tab.height).to.equal(900)
      expect(screenshot.blob).to.be.an.instanceof(Blob)

      expect(activeTab.feedbackState.twitterHandle.handle).to.equal('@zing')

      expect(getPlainText(activeTab.feedbackState.editorState)).to.equal('@zing ')
    })
  })

  describe('authentication via twitter', () => {
    let addEventListener: sinon.SinonStub
    let removeEventListener: sinon.SinonStub
    before(() => {
      addEventListener = sinon.stub(mocks.popupWindow, 'addEventListener')
      removeEventListener = sinon.stub(mocks.popupWindow, 'removeEventListener')
    })
    after(() => {
      addEventListener.restore()
      removeEventListener.restore()
    })

    it('transitions to an "authenticating" state and adds an iframe when the sign in with twitter button is clicked', () => {
      const signInButton = app().querySelector('button')! as HTMLButtonElement
      signInButton.click()
      expect(getState().auth).to.have.property('state', 'authenticating')
      const iframe = app().querySelector('iframe')! as HTMLIFrameElement
      expect(iframe).to.have.property('src', 'https://test-roar-server.com/v1/auth/twitter')
    })

    it('listens for a twitter-auth-success message from the iframe and transitions to an "authenticated" state when received', () => {
      expect(addEventListener).to.have.callCount(1)
      const [eventName, callback] = addEventListener.firstCall.args
      expect(eventName).to.equal('message')
      callback({
        origin: 'https://test-roar-server.com',
        data: { type: 'twitter-auth-success', photoUrl: 'https://some-image-url.com/123' },
      })
      expect(getState().auth).to.have.property('state', 'authenticated')
    })

    it('removes the event listener', () => {
      expect(removeEventListener).to.have.callCount(1)
    })
  })

  describe('once authenticated', () => {
    it('renders the app with an emoji picker container and the main element', () => {
      expect(app().childNodes).to.have.length(2)
      expect(app().childNodes[0]).to.have.property('className', 'emoji-picker-container closed')
      expect(app().childNodes[1]).to.have.property('tagName', 'MAIN')
    })

    it('renders the profile image', () => {
      const profileImage = app().querySelector('img.profile-img')!
      expect(profileImage).to.have.property('src', 'https://some-image-url.com/123')
    })

    it('renders the screenshot', () => {
      const screenshotThumbnail = app().querySelector('.twitter-interface > .screenshots > .screenshot-thumbnail')

      const screenshotImage = screenshotThumbnail?.querySelector('.screenshot-image')
      const screenshotUri = activeTab(getState())?.feedbackState.screenshots[0].uri
      expect(screenshotImage).to.have.property('src', screenshotUri)

      // User can't remove screenshots if there's only one
      const closeButton = screenshotThumbnail?.querySelector('.close-button')
      expect(closeButton).to.equal(null)
    })

    it('takes a screenshot when the TakeScreenshot button is clicked', async () => {
      const tab = activeTab(getState())!
      expect(tab.feedbackState.screenshots).to.have.lengthOf(1)
      const takeScreenshotButton = app().querySelector('.TakeScreenshot')! as HTMLButtonElement
      takeScreenshotButton.click()
      await whenState(mocks.backgroundWindow.store, state => ensureActiveTab(state).feedbackState.screenshots.length === 2)
      const screenshotImages = app().querySelectorAll('.screenshot-image')
      expect(screenshotImages).to.have.lengthOf(2)
    })

    it('delete a screenshot when the close-button is clicked', async () => {
      const screenshots = app().querySelectorAll('.twitter-interface > .screenshots')!
      const secondScreenshotCloseButton = screenshots[0].querySelector('.screenshot-thumbnail > .close-button') as HTMLButtonElement

      // If there are two screenshots, the close button should exist
      secondScreenshotCloseButton.click()
      await whenState(mocks.backgroundWindow.store, state => ensureActiveTab(state).feedbackState.screenshots.length === 1)
    })

    it('disable the take screenshot button when there are 9 screenshots', async () => {
      let screenshotsLength: number = 1
      while (screenshotsLength < 9) {
        const takeScreenshotButton = app().querySelector('.TakeScreenshot')! as HTMLButtonElement
        takeScreenshotButton.click()
        await whenState(mocks.backgroundWindow.store, state => ensureActiveTab(state).feedbackState.screenshots.length === screenshotsLength + 1)
        const screenshotImages = app().querySelectorAll('.screenshot-image')
        expect(screenshotImages).to.have.lengthOf(screenshotsLength + 1)
        screenshotsLength++
      }

      expect(app().querySelector('.TakeScreenshot')).to.have.property('disabled', true)
    })

    // it('edit a screenshot when the edit-button is clicked', async () => {
    //   const tab = activeTab(getState())!
    //   expect(tab.feedbackState.editingScreenshot).to.equal(null)
    //   const screenshotEditButton = app().querySelector('.twitter-interface > .screenshots > .screenshot-thumbnail > .edit-button') as HTMLButtonElement
    //   screenshotEditButton.click()
    //   await whenState(mocks.backgroundWindow.store, state => !!ensureActiveTab(state).feedbackState.editingScreenshot)
    // })

    // Spent too long trying to dispatch events directly to the draft editor.
    // Would be nice, but these issues suggest its too complicated
    // https://github.com/facebook/draft-js/issues/325
    // https://github.com/jsdom/jsdom/issues/1670
    it('can edit the feedback', () => {
      const tab = ensureActiveTab(getState())

      mocks.backgroundWindow.store.dispatch({
        type: 'updateEditorState',
        payload: {
          editorState: appendEntity(tab.feedbackState.editorState, 'This is some feedback'),
        },
      })

      const spans = app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
      expect(spans).to.have.length(2)
      expect(spans[0]).to.have.property('innerHTML', '@zing')
      expect(spans[1]).to.have.property('innerHTML', ' This is some feedback')
    })

    it('allows you to give feedback directly to Roar by clicking the help button', async () => {
      const helpButton = app().querySelector('.Help')! as HTMLButtonElement
      helpButton.click()

      const initialSpans = app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
      expect(initialSpans).to.have.length(2)
      expect(initialSpans[0]).to.have.property('innerHTML', '@roarmhi')
      expect(initialSpans[1]).to.have.property('innerHTML', ' ')

      mocks.backgroundWindow.store.dispatch({
        type: 'updateEditorState',
        payload: {
          editorState: appendEntity(getState().help.feedbackState.editorState, 'different feedback'),
        },
      })

      const nextSpans = app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
      expect(nextSpans).to.have.length(2)
      expect(nextSpans[0]).to.have.property('innerHTML', '@roarmhi')
      expect(nextSpans[1]).to.have.property('innerHTML', ' different feedback')
    })

    it('switches back to the tab-specific feedback when you click the help button again', () => {
      const helpButton = app().querySelector('.Help')! as HTMLButtonElement
      helpButton.click()

      const spans = app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
      expect(spans).to.have.length(2)
      expect(spans[0]).to.have.property('innerHTML', '@zing')
      expect(spans[1]).to.have.property('innerHTML', ' This is some feedback')
    })
  })

  describe('posting feedback', () => {
    before(() => {
      fetchMock.mock('https://test-roar-server.com/v1/feedback', { status: 201, body: { url: 'https://t.co/sometweethash' } })
    })
    after(() => {
      fetchMock.restore()
    })

    it('posts feedback upon clicking the post button', () => {
      const postButton = app().querySelector('.twitter-interface button.post-btn')! as HTMLButtonElement
      postButton.click()

      const [url, opts] = fetchMock.lastCall()!
      expect(url).to.equal('https://test-roar-server.com/v1/feedback')
      expect(opts).to.have.all.keys('method', 'credentials', 'body')
      expect(opts).to.have.property('method', 'POST')
      expect(opts).to.have.property('credentials', 'include')

      const body: FormData = opts!.body! as any
      expect(body.get('status')).to.equal('@zing This is some feedback')
      expect(body.get('domain')).to.equal('zing.com')
      const screenshot: any = body.get('screenshots') as any
      expect(screenshot.name.startsWith('zing.com')).to.equal(true)
      expect(screenshot.name.endsWith('.png')).to.equal(true)

      const tweetInProgress = app().querySelector('.tweet-in-progress')!
      expect(tweetInProgress).to.have.property('innerHTML', 'Tweeting your feedback to @zing')
    })

    it('launches a new tab with the tweet upon completion and clears the existing feedback', async () => {
      await whenState(mocks.backgroundWindow.store, state => !ensureActiveTab(state).feedbackState.isTweeting)
      expect(mocks.chrome.tabs.create).to.have.been.calledOnceWithExactly({
        url: 'https://t.co/sometweethash',
        active: true,
      })

      const spans = app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
      expect(spans).to.have.length(2)
      expect(spans[0]).to.have.property('innerHTML', '@zing')
      expect(spans[1]).to.have.property('innerHTML', ' ')
    })
  })
})
