// tslint:disable:no-let
import { expect } from 'chai'
import * as sinon from 'sinon'
import * as fetchMock from 'fetch-mock'
import { EditorState, Modifier } from 'draft-js'
import { createMocks } from './mocks'
import { whenState } from './util'
import { run } from '../background/run'
import { mount } from '../popup/mount'
import { activeTab, ensureActiveTab } from '../selectors'

describe('happy path', () => {
  const mocks = createMocks()
  after(() => mocks.teardown())

  describe('background:run', () => {
    before(() => run(mocks.backgroundWindow, mocks.browser, mocks.chrome as any))

    it('loads window.store, which starts with an empty state', () => {
      expect(mocks.backgroundWindow).to.have.property('store')
      expect(mocks.backgroundWindow.store.getState()).to.eql({
        popupConnected: false,
        focusedWindowId: -1,
        tabs: new Map(),
        toBeTweeted: null,
        justTweeted: null,
        twitterAuth: 'not_authed',
        pickingEmoji: false,
        alert: null,
        mostRecentAction: { type: 'INITIALIZING' },
      })
    })

    it('sets the focusedWindowId when chrome.windows.getAll calls back', () => {
      expect(mocks.chrome.windows.getAll).to.have.callCount(1)
      const [callback] = mocks.chrome.windows.getAll.firstCall.args
      callback([
        { id: 1, focused: false },
        { id: 2, focused: true },
        { id: 3, focused: false },
      ])
      expect(mocks.backgroundWindow.store.getState()).to.have.property('focusedWindowId', 2)
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
      ])
      const state = mocks.backgroundWindow.store.getState()
      expect(state.tabs.size).to.equal(6)
      const activeTab = ensureActiveTab(state)
      expect(activeTab).to.have.property('id', 14)
      expect(activeTab).to.have.property('windowId', 2)
      expect(activeTab).to.have.property('active', true)
      expect(activeTab).to.have.property('url', 'https://zing.com/abc')
      expect(activeTab).to.have.property('host', 'zing.com')
      expect(activeTab.feedbackState).to.have.property('screenshots').that.eql([])
      expect(activeTab.feedbackState.editorState.getCurrentContent().getPlainText('\u0001')).to.eql('')
    })
  })

  let emojiPickerContainer: HTMLDivElement
  let main: HTMLElement

  describe('popup:mount', () => {
    before(() => mount(mocks.chrome as any, mocks.popupWindow as any))

    it('mounts the app with a button to sign in with twitter', () => {
      const appContainer = mocks.popupWindow.document.getElementById('app-container')!
      const signInWithTwitter = appContainer.querySelector('button')!
      expect(signInWithTwitter).to.have.property('innerHTML', 'Sign in with twitter')
    })

    it('dispatches POPUP_CONNECT, resulting in a screenshot of the active tab getting added to the state', () => {
      const state = mocks.backgroundWindow.store.getState()
      const activeTab = ensureActiveTab(state)
      expect(activeTab.feedbackState.screenshots).to.have.length(1)
      const [screenshot] = activeTab.feedbackState.screenshots
      expect(screenshot.tab.url).to.equal(activeTab.url)
      expect(screenshot.blob).to.be.an.instanceof(Blob)
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

    it('transitions to a { twitterAuth: "authenticating" } state and adds an iframe when the sign in with twitter button is clicked', () => {
      const signInButton = mocks.popupWindow.document.querySelector('#app-container > button')! as HTMLButtonElement
      signInButton.click()
      expect(mocks.backgroundWindow.store.getState()).to.have.property('twitterAuth', 'authenticating')
      const iframe = mocks.popupWindow.document.querySelector('#app-container > iframe')! as HTMLIFrameElement
      expect(iframe).to.have.property('src', 'https://test-roar-server.com/v1/auth/twitter')
    })

    it('listens for a twitter-auth-success message from the iframe and transitions to a { twitterAuth: "authenticated" } state when received', () => {
      expect(addEventListener).to.have.callCount(1)
      const [eventName, callback] = addEventListener.firstCall.args
      expect(eventName).to.equal('message')
      callback({
        origin: 'https://test-roar-server.com',
        data: { type: 'twitter-auth-success' },
      })
      expect(mocks.backgroundWindow.store.getState()).to.have.property('twitterAuth', 'authenticated')
    })

    it('removes the event listener', () => {
      expect(removeEventListener).to.have.callCount(1)
    })
  })

  describe('once authenticated', () => {
    it('renders the app with an emoji picker container and the main element', () => {
      const app = mocks.popupWindow.document.querySelector('#app-container > .app')!
      expect(app.childNodes).to.have.length(2)
      emojiPickerContainer = app.childNodes[0] as any
      main = app.childNodes[1] as any
    })

    it('renders the screenshot', () => {
      const screenshotThumbnail = main.querySelector('.twitter-interface > .screenshots > .screenshot-thumbnail')
      const screenshotUri = activeTab(mocks.backgroundWindow.store.getState())?.feedbackState.screenshots[0].uri
      expect(screenshotThumbnail).to.have.property('src', screenshotUri)
    })

    // Spent too long trying to dispatch events directly to the draft editor.
    // Would be nice, but these issues suggest its too complicated
    // https://github.com/facebook/draft-js/issues/325
    // https://github.com/jsdom/jsdom/issues/1670
    it('can edit the feedback', () => {
      const activeTab = ensureActiveTab(mocks.backgroundWindow.store.getState())

      const editorState: EditorState = activeTab.feedbackState.editorState
      const nextContentState = Modifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), 'This is some feedback')
      const nextEditorState = EditorState.createWithContent(nextContentState)

      mocks.backgroundWindow.store.dispatch({ type: 'UPDATE_EDITOR_STATE', payload: { editorState: nextEditorState } })

      const span = main.querySelector('.twitter-interface > .DraftEditor-root span[data-text="true"]')! as HTMLDivElement

      expect(span).to.have.property('innerHTML', 'This is some feedback')
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
      const postButton = main.querySelector('.twitter-interface button.post-btn')! as HTMLButtonElement
      expect(mocks.backgroundWindow.store.getState()).to.have.property('toBeTweeted', null)
      postButton.click()
      expect(mocks.backgroundWindow.store.getState()).to.have.property('toBeTweeted').that.is.an('object')

      const [url, opts] = fetchMock.lastCall()!
      expect(url).to.equal('https://test-roar-server.com/v1/feedback')
      expect(opts).to.have.all.keys('method', 'credentials', 'body')
      expect(opts).to.have.property('method', 'POST')
      expect(opts).to.have.property('credentials', 'include')

      const body: FormData = opts!.body! as any
      expect(body.get('status')).to.equal('This is some feedback')
      const screenshot: any = body.get('screenshots') as any
      expect(screenshot.name.startsWith('zing.com')).to.equal(true)

      const state = await whenState(mocks.backgroundWindow.store, state => !state.toBeTweeted)
      expect(state.justTweeted).to.eql({ url: 'https://t.co/sometweethash' })
    })
  })
})
