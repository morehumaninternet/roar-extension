import { expect } from 'chai'
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { ensureActiveTab } from '../../selectors'
import { fromText, getPlainText } from '../../draft-js-utils'

// TODO: Hank to remove this .only when done writing these tests
describe.only('character countdown', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })
  mountPopup(mocks, { alreadyAuthenticated: true, handle: 'exists' })

  describe('when there are many characters remaining', () => {
    it("renders a progress circle that is filled in according to Twitter's 280 character limit", () => {
      const characterCountdown = mocks.app().querySelector('.character-countdown')! as HTMLDivElement
      const progressCircle = characterCountdown.querySelector('circle.progress')! as SVGCircleElement
      const remainingRatio = Number(progressCircle.style.strokeDashoffset) / Number(progressCircle.style.strokeDasharray)
      const numCharacters = getPlainText(ensureActiveTab(mocks.getState()).feedbackState.editorState).length
      const filledInRatio = numCharacters / 280
      expect(remainingRatio + filledInRatio).to.closeTo(1, 0.00000000000001)
    })

    it('renders no text', () => {
      const characterCountdown = mocks.app().querySelector('.character-countdown')! as HTMLDivElement
      const text = characterCountdown.querySelector('svg > text')
      expect(text).to.equal(null)
    })

    // TODO: Hank to fix bug in code
    it('is a progressbar with the an aria-valuenow equal to the filledInRatio', () => {
      const characterCountdown = mocks.app().querySelector('.character-countdown')! as HTMLDivElement
      const numCharacters = getPlainText(ensureActiveTab(mocks.getState()).feedbackState.editorState).length
      const filledInRatio = numCharacters / 280

      expect(Number(characterCountdown.getAttribute('aria-valuenow'))).to.equal(Math.round(filledInRatio * 100))
    })

    it('does not disable posting', () => {
      const postButton = mocks.app().querySelector('.post-btn')! as HTMLButtonElement
      expect(postButton.disabled).to.equal(false)
    })
  })

  describe('when approaching the character limit', () => {
    const almost280Chars = '@zing.com ' + 'x'.repeat(260)
    before(() => {
      mocks.backgroundWindow.store.dispatchers.updateEditorState({
        editorState: fromText(almost280Chars),
      })
    })

    it('renders a more full progress circle', () => {
      // TODO: Hank to write this test
      const characterCountdown = mocks.app().querySelector('.character-countdown')! as HTMLDivElement
      const progressCircle = characterCountdown.querySelector('circle.progress')! as SVGCircleElement
      const remainingRatio = Number(progressCircle.style.strokeDashoffset) / Number(progressCircle.style.strokeDasharray)
      const numCharacters = getPlainText(ensureActiveTab(mocks.getState()).feedbackState.editorState).length
      const filledInRatio = numCharacters / 280
      expect(remainingRatio).to.closeTo(0, 0.1)
      expect(filledInRatio).to.closeTo(1, 0.1)
    })

    it('has a .warning class', () => {
      // TODO: Hank to write this test
      const characterCountdown = mocks.app().querySelector('.character-countdown')! as HTMLDivElement
      expect(characterCountdown.querySelectorAll('svg.warning')).to.have.length(1)
    })

    it('renders the number of characters remaining as a text element', () => {
      // TODO: Hank to write this test
      expect(mocks.app().querySelectorAll('.warning > text')).to.have.length(1)
    })

    it('does not disable posting', () => {
      const postButton = mocks.app().querySelector('.post-btn')! as HTMLButtonElement
      expect(postButton.disabled).to.equal(false)
    })
  })

  describe('when exactly at the character limit', () => {
    const exactly280Chars = '@zing.com ' + 'x'.repeat(270)
    before(() => {
      mocks.backgroundWindow.store.dispatchers.updateEditorState({
        editorState: fromText(exactly280Chars),
      })
    })

    it('renders a full progress circle', () => {
      const progressCircle = mocks.app().querySelector('.character-countdown circle.progress')! as SVGCircleElement
      const remainingRatio = Number(progressCircle.style.strokeDashoffset) / Number(progressCircle.style.strokeDasharray)
      expect(remainingRatio).to.equal(0)
    })

    it('has an aria-valuenow equal to 100', () => {
      // TODO: Hank to write this test
      const characterCountdown = mocks.app().querySelector('.character-countdown')! as HTMLDivElement
      expect(Number(characterCountdown.getAttribute('aria-valuenow'))).to.equal(100)
    })

    it('has a .warning class', () => {
      // TODO: Hank to write this test
      const characterCountdown = mocks.app().querySelector('.character-countdown')! as HTMLDivElement
      expect(characterCountdown.querySelectorAll('svg.warning')).to.have.length(1)
    })

    it('renders zero as the number of characters remaining in a text element', () => {
      // TODO: Hank to write this test
      const characterCountdown = mocks.app().querySelector('.character-countdown')! as HTMLDivElement
      expect(characterCountdown.querySelector('text')?.innerHTML).to.equal('0')
    })

    it('does not disable posting', () => {
      const postButton = mocks.app().querySelector('.post-btn')! as HTMLButtonElement
      expect(postButton.disabled).to.equal(false)
    })
  })

  describe('when over the character limit', () => {
    const over280Chars = '@zing.com ' + 'x'.repeat(280)
    before(() => {
      mocks.backgroundWindow.store.dispatchers.updateEditorState({
        editorState: fromText(over280Chars),
      })
    })

    it('renders no circles', () => {
      // TODO: Hank to write this test
      const characterCountdown = mocks.app().querySelector('.character-countdown')! as HTMLDivElement
      expect(characterCountdown.querySelectorAll('circle')).to.have.length(0)
    })

    it('has an aria-valuenow equal to 100', () => {
      // TODO: Hank to write this test
      const characterCountdown = mocks.app().querySelector('.character-countdown')! as HTMLDivElement
      const variaValuenow = Number(characterCountdown.getAttribute('aria-valuenow'))
      expect(variaValuenow).to.equal(100)
    })

    it('renders the number of characters over the limit in a text element', () => {
      // TODO: Hank to write this test
      const characterCountdown = mocks.app().querySelector('.character-countdown')! as HTMLDivElement
      const overLimitCount = Number(characterCountdown.querySelector('text')?.innerHTML)
      expect(overLimitCount).to.be.above(0)
    })

    it('disables posting', () => {
      // TODO: Hank to write this test
      const postButton = mocks.app().querySelector('.post-btn')! as HTMLButtonElement
      expect(postButton.disabled).to.equal(true)
    })
  })
})
