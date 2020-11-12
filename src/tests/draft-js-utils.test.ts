// tslint:disable:no-let
import { expect } from 'chai'
import * as sinon from 'sinon'
import { EditorState, ContentState } from 'draft-js'
import { fromText, getPlainText, appendEntity, prependHandle, replaceHandle } from '../draft-js-utils'

describe.only('draft-js-utils', () => {
  describe('getPlainText', () => {
    it('returns the plain text of a given editor state', () => {
      const editorState = fromText('Hello world')
      expect(getPlainText(editorState)).to.equal('Hello world')
    })
  })

  describe('prependHandle', () => {
    it('places the provided handle in front of whatever text is already present', () => {
      const editorState = fromText('Hello world')
      const nextEditorState = prependHandle(editorState, '@cool')
      expect(getPlainText(nextEditorState)).to.equal('@cool Hello world')
    })

    it('throws an error if the provided handle does not start with @', () => {
      const editorState = fromText('Hello world')
      expect(() => prependHandle(editorState, 'cool')).to.throw('handle must start with @')
    })
  })

  describe('replaceHandle', () => {
    it("replaces the current handle and the beginning of the editor's content with one provided", () => {
      const editorStateWithHostHandle = prependHandle(fromText('Hello world'), '@cool.com')
      const editorStateWithActualHandle = replaceHandle(editorStateWithHostHandle, '@cool')
      expect(getPlainText(editorStateWithActualHandle)).to.equal('@cool Hello world')
    })

    it('throws an error if the provided handle does not start with @', () => {
      const editorStateWithHostHandle = prependHandle(fromText('Hello world'), '@cool.com')
      expect(() => replaceHandle(editorStateWithHostHandle, 'cool')).to.throw('handle must start with @')
    })
  })
})
