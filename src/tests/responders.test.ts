import { expect } from 'chai'
import { emptyState } from '../background/store'
import { responders, newFeedbackState } from '../background/responders'
import { getPlainText } from '../draft-js-utils'

describe('responders', () => {
  describe('chrome.tabs.onUpdated', () => {
    it('makes a new empty feedback with the updated host, if the url changes', () => {
      const appState: AppState = { ...emptyState }

      appState.tabs.set(17, {
        id: 17,
        windowId: 5,
        active: false,
        isTweeting: false,
        url: 'https://original-url.com',
        host: 'original-url.com',
        feedbackState: newFeedbackState({ host: 'original-url.com' }),
      })

      const stateUpdates = responders['chrome.tabs.onUpdated'](appState, {
        type: 'chrome.tabs.onUpdated',
        payload: { tabId: 17, changeInfo: { url: 'https://updated.com/abc' } },
      })

      expect(stateUpdates).to.have.all.keys('tabs')

      const updatedTab = stateUpdates.tabs!.get(17)!

      expect(updatedTab.url).to.equal('https://updated.com/abc')
      expect(updatedTab.host).to.equal('updated.com')
      expect(getPlainText(updatedTab.feedbackState.editorState)).to.equal('@updated.com ')
    })
  })
})
