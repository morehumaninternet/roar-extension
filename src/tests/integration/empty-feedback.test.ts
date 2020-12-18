import { expect } from 'chai'
import { EditorState } from 'draft-js'
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'

describe('empty feedback', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })
  mountPopup(mocks, { handle: 'exists', alreadyAuthenticated: true })

  describe('deleting all feedback', () => {
    it('disables the post button when there is no feedback', () => {
      mocks.backgroundWindow.store.dispatch({
        type: 'updateEditorState',
        payload: { editorState: EditorState.createEmpty() },
      })

      const postButton = mocks.app().querySelector('.post-btn')
      expect(postButton).to.have.property('disabled', true)
    })
  })
})
