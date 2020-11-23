// tslint:disable:no-let
import { expect } from 'chai'
import { Map } from 'immutable'
import { Mocks } from '../mocks'
import { run } from '../../../background/run'
import { ensureActiveTab } from '../../../selectors'
import { getPlainText } from '../../../draft-js-utils'

export function runBackground(mocks: Mocks, opts: { allowActionFailure: boolean } = { allowActionFailure: false }): void {
  let unsubscribe
  after(() => unsubscribe && unsubscribe())

  describe('background:run', () => {
    before(() => {
      run(mocks.backgroundWindow, mocks.browser, mocks.chrome as any)
      // Throw an error if ever a Failure event is dispatched
      unsubscribe = mocks.backgroundWindow.store.subscribe(() => {
        if (opts.allowActionFailure) return

        const { mostRecentAction } = mocks.getState()

        if (mostRecentAction.type.endsWith('Failure')) {
          console.error((mostRecentAction as any).payload.error)
          process.exit(1)
        }
      })
    })

    it('loads window.store, which starts with an empty state', () => {
      const state = mocks.getState()
      expect(state.focusedWindowId).to.equal(-1)
      expect(state.tabs).to.be.an.instanceOf(Map)
      expect(state.tabs).to.have.property('size', 0)
      expect(state.auth).to.eql({ state: 'not_authed' })
      expect(state.pickingEmoji).to.equal(false)
      expect(state.help.on).to.equal(false)
      expect(state.help.feedbackState).to.be.an('object')
      expect(state.help.feedbackState.addingImages).to.equal(0)
      expect(state.help.feedbackState.editingImage).to.equal(null)
      expect(state.help.feedbackState.images).to.eql([])
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
      expect(mocks.getState()).to.have.property('focusedWindowId', 2)
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
      const state = mocks.getState()
      expect(state.tabs.size).to.equal(7)

      const activeTab = ensureActiveTab(state)
      expect(activeTab).to.have.property('id', 14)
      expect(activeTab).to.have.property('windowId', 2)
      expect(activeTab).to.have.property('active', true)
      expect(activeTab).to.have.property('url', 'https://zing.com/abc')
      expect(activeTab).to.have.property('domain', 'zing.com')
      expect(activeTab.feedbackState).to.have.property('isTweeting', false)
      expect(activeTab.feedbackState).to.have.property('images').that.eql([])

      expect(state.tabs.get(17)).to.have.property('domain', undefined)
    })

    it("uses the tab's domain as the handle as a placeholder prior to fetching the actual twitter handle", () => {
      const state = mocks.getState()
      const activeTab = ensureActiveTab(state)
      expect(getPlainText(activeTab.feedbackState.editorState)).to.equal('@zing.com ')
    })
  })
}