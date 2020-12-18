import { expect } from 'chai'
import { appendEntity } from '../../../draft-js-utils'
import { ensureActiveTab } from '../../../selectors'
import { Mocks } from '../mocks'

export function feedbackEditing(mocks: Mocks, opts: { handle: string }): void {
  describe('feedback editing', () => {
    it('can edit the feedback', () => {
      const tab = ensureActiveTab(mocks.getState())

      mocks.backgroundWindow.store.dispatch({
        type: 'updateEditorState',
        payload: {
          editorState: appendEntity(tab.feedbackState.editorState, 'This is some feedback'),
        },
      })

      const spans = mocks.app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
      expect(spans).to.have.length(2)
      expect(spans[0]).to.have.property('innerHTML', opts.handle)
      expect(spans[1]).to.have.property('innerHTML', ' This is some feedback')
    })

    it('allows you to give feedback directly to Roar by clicking the help button', async () => {
      const helpButton = mocks.app().querySelector('.Help')! as HTMLButtonElement
      helpButton.click()

      const initialSpans = mocks.app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
      expect(initialSpans).to.have.length(2)
      expect(initialSpans[0]).to.have.property('innerHTML', '@roarmhi')
      expect(initialSpans[1]).to.have.property('innerHTML', ' ')

      mocks.backgroundWindow.store.dispatch({
        type: 'updateEditorState',
        payload: {
          editorState: appendEntity(mocks.getState().help.feedbackState.editorState, 'different feedback'),
        },
      })

      const nextSpans = mocks.app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
      expect(nextSpans).to.have.length(2)
      expect(nextSpans[0]).to.have.property('innerHTML', '@roarmhi')
      expect(nextSpans[1]).to.have.property('innerHTML', ' different feedback')
    })

    it('switches back to the tab-specific feedback when you click the help button again', () => {
      const helpButton = mocks.app().querySelector('.Help')! as HTMLButtonElement
      helpButton.click()

      const spans = mocks.app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
      expect(spans).to.have.length(2)
      expect(spans[0]).to.have.property('innerHTML', opts.handle)
      expect(spans[1]).to.have.property('innerHTML', ' This is some feedback')
    })
  })
}
