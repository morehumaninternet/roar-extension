import { expect } from 'chai'
import { emptyState } from '../background/store'
import { responders } from '../background/responders'
import { newFeedbackState } from '../background/feedback-state'
import { getPlainText } from '../draft-js-utils'

describe('responders', () => {
  describe('chrome.windows.getAll', () => {
    it('sets the focusedWindowId to be that of the focused window', () => {
      const stateUpdates = responders['chrome.windows.getAll'](emptyState(), {
        windows: [{ id: 1, focused: false } as any, { id: 2, focused: true } as any],
      })
      expect(stateUpdates).to.eql({ focusedWindowId: 2 })
    })

    it('returns no updates if no window is focused', () => {
      const stateUpdates = responders['chrome.windows.getAll'](emptyState(), {
        windows: [{ id: 1, focused: false } as any, { id: 2, focused: false } as any],
      })
      expect(stateUpdates).to.eql({})
    })
  })
  describe('chrome.tabs.onUpdated', () => {
    it('makes a new empty feedback with the updated host, if the url changes', () => {
      const appState: StoreState = emptyState()

      appState.tabs.set(17, {
        feedbackTargetType: 'tab',
        id: 17,
        windowId: 5,
        active: false,
        url: 'https://original-url.com',
        domain: 'original-url.com',
        feedbackState: newFeedbackState({ domain: 'original-url.com' }),
      })

      const stateUpdates = responders['chrome.tabs.onUpdated'](appState, {
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
