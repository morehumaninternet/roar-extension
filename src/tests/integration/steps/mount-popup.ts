import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'
import { mount } from '../../../popup/mount'
import { ensureActiveTab } from '../../../selectors'
import { getPlainText } from '../../../draft-js-utils'
import { mock } from 'fetch-mock'

const handleDescriptions = {
  cached: 'is cached',
  exists: 'exists for the domain',
  'does not exist': 'does not exist for the domain',
  '500': 'cannot be fetched due to a server error',
  'resolves later': 'is resolved later',
}

type MountPopupOpts = {
  alreadyAuthenticated?: boolean
  handle: keyof typeof handleDescriptions
}

type MountPopupReturn = {
  resolveHandle(): void
}

export function mountPopup(mocks: Mocks, opts: MountPopupOpts): MountPopupReturn {
  const authDescription = opts.alreadyAuthenticated ? 'when already authed' : 'when not yet authed'
  const handleDescription = handleDescriptions[opts.handle]
  const description = `popup mount ${authDescription} and the twitter handle ${handleDescription}`

  // Use indirection here so we may pass a resolveHandle callback immediatedly
  // as handleResolver is created later
  let handleResolver // tslint:disable-line:no-let
  const resolveHandle = () => handleResolver()

  describe(description, () => {
    const domain = 'zing.com'
    const twitter_handle = opts.handle === 'does not exist' ? null : '@zing'
    const expectedEditorHandle = ['cached', 'exists'].includes(opts.handle) ? twitter_handle : `@${domain}`
    const handleCache = opts.handle === 'cached' ? [{ domain, twitter_handle }] : []

    before(() => mocks.chrome.storage.local.get.callsArgWith(0, { handleCache }))

    // Expect an API call if the handle is not cached
    if (opts.handle !== 'cached') {
      before(() => {
        const response = opts.handle === '500' ? { status: 500, body: 'I made a huge mistake' } : { status: 200, body: { twitter_handle, domain } }

        // We either provide the response directly or return a promise that resolves with the
        // respnose when the caller calls the handleResolver directly
        const mockResponse: fetchMock.MockResponse | fetchMock.MockResponseFunction =
          opts.handle !== 'resolves later' ? response : new Promise(resolve => (handleResolver = () => resolve(response)))

        fetchMock.mock('https://test-roar-server.com/v1/website?domain=zing.com', mockResponse)
      })
    }

    before(() => mocks.browser.tabs.get.withArgs(14).resolves({ width: 1200, height: 900 }))
    before(() => mocks.mount())

    if (!opts.alreadyAuthenticated) {
      it('mounts the app with a button to sign in with twitter', () => {
        const appContainer = mocks.popupWindow().document.getElementById('app-container')!
        const signInWithTwitter = appContainer.querySelector('button')!
        expect(signInWithTwitter.innerHTML).to.match(/.+(Log in with Twitter)$/)
      })
    }

    it('dispatches popupConnect, resulting in the twitter handle being fetched & a call made to captureVisibleTab to get a screenshot', () => {
      const activeTab = ensureActiveTab(mocks.getState())
      expect(activeTab.feedbackState.addingImages).to.equal(1)
      expect(activeTab.feedbackState.twitterHandle.handle).to.equal(expectedEditorHandle)
    })

    if (opts.handle === 'exists') {
      it('caches the handle in chrome.storage.local', () => {
        expect(mocks.chrome.storage.local.set).to.have.been.calledOnceWith({ handleCache: [{ domain, twitter_handle: '@zing' }] })
      })
    } else {
      it('does not cache the handle', () => {
        expect(mocks.chrome.storage.local.set).to.have.callCount(0)
      })
    }

    it('has the appropriate handle in the editor state', () => {
      const activeTab = ensureActiveTab(mocks.getState())
      const plainText = getPlainText(activeTab.feedbackState.editorState)
      expect(plainText).to.equal(expectedEditorHandle + ' ')
    })

    it('adds an event listener for when the window unloads', () => {
      const unloadCall = mocks
        .popupWindow()
        .addEventListener.getCalls()
        .find(call => call.args[0] === 'unload')!
      const [eventName, callback] = unloadCall.args
      expect(eventName).to.equal('unload')
      expect(callback).to.be.a('function')
    })
  })

  return {
    resolveHandle,
  }
}
