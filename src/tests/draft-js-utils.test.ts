// tslint:disable:no-let
import { expect } from 'chai'
import { fromText, getPlainText, prependHandle, replaceHandle } from '../draft-js-utils'

describe('draft-js-utils', () => {
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
    it("replaces the current handle at the beginning of the editor's content with one provided", () => {
      const editorStateWithHostHandle = prependHandle(fromText('Hello world'), '@cool.com')
      expect(getPlainText(editorStateWithHostHandle)).to.equal('@cool.com Hello world')

      const editorStateWithActualHandle = replaceHandle(editorStateWithHostHandle, '@cool')
      expect(getPlainText(editorStateWithActualHandle)).to.equal('@cool Hello world')
    })

    it('throws an error if the provided handle does not start with @', () => {
      const editorStateWithHostHandle = prependHandle(fromText('Hello world'), '@cool.com')
      expect(() => replaceHandle(editorStateWithHostHandle, 'cool')).to.throw('handle must start with @')
    })

    it('throws an error if the provided editorState does not already have a handle starting with @', () => {
      const editorStateWithNoHandle = fromText('Hello world')
      expect(() => replaceHandle(editorStateWithNoHandle, '@cool')).to.throw('editorState text must start with @')
    })
  })
})
