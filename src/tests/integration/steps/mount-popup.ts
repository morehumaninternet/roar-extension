import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'
import { ensureActiveTab } from '../../../selectors'
import { getPlainText } from '../../../draft-js-utils'

const handleDescriptions = {
  cached: 'is cached',
  fetched: 'is fetched over the API',
  'does not exist': 'does not exist for the domain',
  '500': 'cannot be fetched due to a server error',
  'resolves later': 'is resolved later',
  'never fetched': 'is never fetched',
}

type MountPopupOpts = {
  alreadyAuthenticated?: boolean

  handle:
    | keyof typeof handleDescriptions
    | {
        domain: string
        response: WebsiteResponseData
        expectedTwitterHandle: string
      }
}

type MountPopupReturn = {
  resolveHandle(): void
}

export function mountPopup(mocks: Mocks, opts: MountPopupOpts): MountPopupReturn {
  const authDescription = opts.alreadyAuthenticated ? 'when already authed' : 'when not yet authed'
  const handle = typeof opts.handle === 'string' ? opts.handle : 'fetched'

  const domain = typeof opts.handle === 'string' ? 'zing.com' : opts.handle.domain

  const twitter_handle = handle === 'does not exist' ? null : typeof opts.handle === 'string' ? '@zing' : opts.handle.expectedTwitterHandle
  const expectedEditorHandle = ['cached', 'fetched'].includes(handle) ? twitter_handle : `@${domain}`
  const handleCache = handle === 'cached' ? [{ domain, twitter_handle, non_default_twitter_handles: [] }] : []

  const response =
    typeof opts.handle !== 'string'
      ? { status: 200, body: opts.handle.response }
      : handle === '500'
      ? { status: 500, body: 'I made a huge mistake' }
      : { status: 200, body: { twitter_handle, domain, non_default_twitter_handles: [] } }

  const handleDescription = handleDescriptions[handle]
  const description = `popup mount ${authDescription} and the twitter handle ${handleDescription}`

  // Use indirection here so we may pass a resolveHandle callback immediatedly
  // as handleResolver is created later
  let handleResolver // tslint:disable-line:no-let
  const resolveHandle = () => handleResolver()

  describe(description, () => {
    before(() => mocks.chrome.storage.local.get.callsArgWith(0, { handleCache }))

    // Expect an API call if the handle is not cached and
    if (handle !== 'cached' && handle !== 'never fetched') {
      before(() => {
        // We either provide the response directly or return a promise that resolves with the
        // respnose when the caller calls the handleResolver directly
        const mockResponse: fetchMock.MockResponse | fetchMock.MockResponseFunction =
          handle !== 'resolves later' ? response : new Promise(resolve => (handleResolver = () => resolve(response)))

        fetchMock.mock(`https://test-roar-server.com/v1/website?domain=${domain}`, mockResponse)
      })
    }

    before(() => mocks.mount())

    if (!opts.alreadyAuthenticated) {
      it('mounts the app with a button to sign in with twitter', () => {
        const appContainer = mocks.popupWindow().document.getElementById('app-container')!
        const signInWithTwitter = appContainer.querySelector('button')!
        expect(signInWithTwitter.innerHTML).to.match(/.+(Log in with Twitter)$/)
      })
    }

    if (handle !== 'never fetched') {
      it('fetches the twitter handle', () => {
        const activeTab = ensureActiveTab(mocks.getState())
        expect(activeTab.feedbackState.twitterHandle.handle).to.equal(expectedEditorHandle)
      })

      it('calls captureVisibleTab to get a screenshot', () => {
        const activeTab = ensureActiveTab(mocks.getState())
        expect(activeTab.feedbackState.addingImages).to.equal(1)
      })
    }

    if (handle === 'fetched') {
      it('caches the handle in chrome.storage.local', () => {
        expect(mocks.chrome.storage.local.set).to.have.been.calledOnceWith({
          handleCache: [response.body],
        })
      })
    } else {
      it('does not cache the handle', () => {
        expect(mocks.chrome.storage.local.set).to.have.callCount(0)
      })
    }

    if (handle !== 'never fetched') {
      it('has the appropriate handle in the editor state', () => {
        const activeTab = ensureActiveTab(mocks.getState())
        const plainText = getPlainText(activeTab.feedbackState.editorState)
        expect(plainText).to.equal(expectedEditorHandle + ' ')
      })
    }
  })

  return {
    resolveHandle,
  }
}
