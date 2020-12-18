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
  })
}
