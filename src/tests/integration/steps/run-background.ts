import { expect } from 'chai'
import { find } from 'lodash'
import { Map } from 'immutable'
import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'
import { run } from '../../../background/run'
import { domainOf } from '../../../background/domain'
import { ensureActiveTab } from '../../../selectors'
import { getPlainText } from '../../../draft-js-utils'

type RunBackgroundOpts = {
  windows?: ReadonlyArray<{ id: number; focused: boolean }>
  tabs?: ReadonlyArray<{ id: number; windowId: number; active: boolean; url: string }>
  allowActionFailure?: boolean
  alreadyAuthenticated?: boolean
}

export function runBackground(mocks: Mocks, opts: RunBackgroundOpts = {}): void {
  let unsubscribe // tslint:disable-line:no-let
  after(() => unsubscribe && unsubscribe())

  const windows = opts.windows || [
    { id: 1, focused: false },
    { id: 2, focused: true },
    { id: 3, focused: false },
  ]

  const tabs = opts.tabs || [
    { id: 11, windowId: 1, active: false, url: 'https://foo.com/abc' },
    { id: 12, windowId: 1, active: true, url: 'https://bar.com/abc' },
    { id: 13, windowId: 1, active: false, url: 'https://quux.com/abc' },
    { id: 14, windowId: 2, active: true, url: 'https://zing.com/abc' },
    { id: 15, windowId: 2, active: false, url: 'https://slam.com/abc' },
    { id: 16, windowId: 3, active: false, url: 'https://mop.com/abc' },
    { id: 17, windowId: 3, active: true, url: 'chrome://extensions' },
  ]

  const focusedWindowId = find(windows, { focused: true })!.id
  const activeTab = find(tabs, { windowId: focusedWindowId, active: true })!
  const activeTabDomain = domainOf(activeTab.url)

  describe('run background script', () => {
    before(() => {
      const response = opts.alreadyAuthenticated ? { status: 200, body: { photoUrl: 'https://some-image-url.com/123' } } : { status: 401 }
      fetchMock.mock('https://test-roar-server.com/v1/me', response)
    })

    before(() => {
      run(mocks.backgroundWindow as any)
      // Throw an error if ever a Failure event is dispatched
      unsubscribe = mocks.backgroundWindow.store.subscribe(() => {
        if (opts.allowActionFailure) return

        const { mostRecentAction } = mocks.getState()

        if (mostRecentAction.type.endsWith('Failure')) {
          console.error((mostRecentAction as any).payload.failure)
          process.exit(1)
        }
      })
    })

    it('loads window.store, which starts with an empty state', () => {
      const state = mocks.getState()
      expect(state.focusedWindowId).to.equal(-1)
      expect(state.tabs).to.be.an.instanceOf(Map)
      expect(state.tabs).to.have.property('size', 0)
      expect(state.pickingEmoji).to.equal(false)
      expect(state.alert).to.equal(null)
    })

    if (opts.alreadyAuthenticated) {
      it('is already authenticated', () => {
        expect(mocks.getState().auth).to.eql({ state: 'authenticated', user: { photoUrl: 'https://some-image-url.com/123' } })
      })
    } else {
      it('is not yet authenticated', () => {
        expect(mocks.getState().auth).to.eql({ state: 'not_authed' })
      })
    }

    it('sets the focusedWindowId when chrome.windows.getAll calls back', () => {
      expect(mocks.chrome.windows.getAll).to.have.callCount(1)
      const [callback] = mocks.chrome.windows.getAll.firstCall.args
      callback(windows)
      expect(mocks.getState()).to.have.property('focusedWindowId', focusedWindowId)
    })

    it('sets the tabs when chrome.tabs.query calls back', () => {
      expect(mocks.chrome.tabs.query).to.have.callCount(1)
      const [query, callback] = mocks.chrome.tabs.query.firstCall.args
      expect(query).to.eql({})
      callback(tabs)
      const state = mocks.getState()
      expect(state.tabs.size).to.equal(tabs.length)

      const activeTab = ensureActiveTab(state)
      expect(activeTab).to.have.property('id', activeTab.id)
      expect(activeTab).to.have.property('windowId', activeTab.windowId)
      expect(activeTab).to.have.property('active', true)
      expect(activeTab).to.have.property('url', activeTab.url)
      expect(activeTab.feedbackState).to.have.property('isTweeting', false)
      expect(activeTab.feedbackState).to.have.property('images').that.eql([])
    })

    if (activeTabDomain) {
      it("uses the tab's domain as the handle as a placeholder prior to fetching the actual twitter handle", () => {
        const state = mocks.getState()
        const activeTab = ensureActiveTab(state)
        expect(getPlainText(activeTab.feedbackState.editorState)).to.equal(`@${activeTabDomain} `)
      })
    }
  })
}
