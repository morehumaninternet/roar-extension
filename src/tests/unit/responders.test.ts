import { expect } from 'chai'
import { responders } from '../../background/responders'
import { newStoreState, newFeedbackState } from '../../background/state'
import { getPlainText } from '../../draft-js-utils'

describe('responders', () => {
  describe('chrome.windows.getAll', () => {
    it('sets the focusedWindowId to be that of the focused window', () => {
      const stateUpdates = responders['chrome.windows.getAll'](newStoreState(), {
        windows: [{ id: 1, focused: false } as any, { id: 2, focused: true } as any],
      })
      expect(stateUpdates).to.eql({ focusedWindowId: 2 })
    })

    it('returns no updates if no window is focused', () => {
      const stateUpdates = responders['chrome.windows.getAll'](newStoreState(), {
        windows: [{ id: 1, focused: false } as any, { id: 2, focused: false } as any],
      })
      expect(stateUpdates).to.eql({})
    })
  })
  describe('chrome.tabs.onUpdated', () => {
    it('makes a new empty feedback with the updated domain, if the url changes', () => {
      const storeState: StoreState = newStoreState()

      storeState.tabs = storeState.tabs.set(17, {
        feedbackTargetType: 'tab',
        id: 17,
        windowId: 5,
        active: false,
        url: 'https://original-url.com',
        domain: 'original-url.com',
        feedbackState: newFeedbackState({ domain: 'original-url.com' }),
      })

      const stateUpdates = responders['chrome.tabs.onUpdated'](storeState, {
        tabId: 17,
        changeInfo: { url: 'https://updated.com/abc' },
      })

      expect(stateUpdates).to.have.all.keys('tabs')

      const updatedTab = stateUpdates.tabs!.get(17)!

      expect(updatedTab.url).to.equal('https://updated.com/abc')
      expect(updatedTab.domain).to.equal('updated.com')
      expect(getPlainText(updatedTab.feedbackState.editorState)).to.equal('@updated.com ')
    })
  })
})
