import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'
import { mount } from '../../../popup/mount'
import { ensureActiveTab } from '../../../selectors'
import { getPlainText } from '../../../draft-js-utils'

const handleDescriptions = {
  cached: 'is cached',
  exists: 'exists for the domain',
  'does not exist': 'does not exist for the domain',
}

type MountPopupOpts = {
  alreadyAuthenticated?: boolean
  handle: keyof typeof handleDescriptions
}

export function mountPopup(mocks: Mocks, opts: MountPopupOpts): void {
  const authDescription = opts.alreadyAuthenticated ? 'when already authed' : 'when not yet authed'
  const handleDescription = handleDescriptions[opts.handle]
  const description = `popup mount ${authDescription} and the twitter handle ${handleDescription}`

  describe(description, () => {
    const twitter_handle = opts.handle === 'does not exist' ? null : '@zing'
    const handleCache = opts.handle === 'cached' ? [{ domain: 'zing.com', twitter_handle }] : []

    before(() => mocks.chrome.storage.local.get.callsArgWith(0, { handleCache }))

    // Expect an API call if the handle is not cached
    if (opts.handle !== 'cached') {
      before(() => {
        fetchMock.mock('https://test-roar-server.com/v1/website?domain=zing.com', { status: 200, body: { twitter_handle } })
      })
    }

    before(() => mocks.browser.tabs.get.withArgs(14).resolves({ width: 1200, height: 900 }))
    before(() => mount(mocks.chrome as any, mocks.popupWindow as any))
    after(() => {
      if (!fetchMock.done()) throw new Error('Fetch not called the expected number of times')
      fetchMock.restore()
    })

    if (!opts.alreadyAuthenticated) {
      it('mounts the app with a button to sign in with twitter', () => {
        const appContainer = mocks.popupWindow.document.getElementById('app-container')!
        const signInWithTwitter = appContainer.querySelector('button')!
        expect(signInWithTwitter.innerHTML).to.match(/.+(Log in with Twitter)$/)
      })
    }

    it('dispatches popupConnect, resulting in the twitter handle being fetched & a call made to captureVisibleTab to get a screenshot', () => {
      const activeTab = ensureActiveTab(mocks.getState())
      expect(activeTab.feedbackState.twitterHandle.handle).to.equal(twitter_handle)
      expect(activeTab.feedbackState.addingImages).to.equal(1)
    })

    if (opts.handle === 'exists') {
      it('caches the handle in chrome.storage.local', () => {
        expect(mocks.chrome.storage.local.set).to.have.been.calledOnceWith({ handleCache: [{ domain: 'zing.com', twitter_handle: '@zing' }] })
      })
    } else {
      it('does not cache the handle', () => {
        expect(mocks.chrome.storage.local.set).to.have.callCount(0)
      })
    }

    it('has the appropriate handle in the editor state', () => {
      const activeTab = ensureActiveTab(mocks.getState())
      const plainText = getPlainText(activeTab.feedbackState.editorState)
      const expectedPlainText = twitter_handle || '@zing.com'
      expect(plainText).to.equal(expectedPlainText + ' ')
    })

    it('adds an event listener for when the window unloads', () => {
      const unloadCall = mocks.popupWindow.addEventListener.getCalls().find(call => call.args[0] === 'unload')!
      const [eventName, callback] = unloadCall.args
      expect(eventName).to.equal('unload')
      expect(callback).to.be.a('function')
    })
  })
}
