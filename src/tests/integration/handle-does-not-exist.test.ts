import { expect } from 'chai'
import { createMocks } from './mocks'
import { mountPopup } from './steps/mount-popup'
import { runBackground } from './steps/run-background'
import { captureFirstScreenshot } from './steps/capture-first-screenshot'
import { takingScreenshots } from './steps/taking-screenshots'
import { postingFeedback } from './steps/posting-feedback'
import { feedbackEditing } from './steps/feedback-editing'

describe.only('twitter handle does not exist for the domain', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })
  mountPopup(mocks, { alreadyAuthenticated: true, handle: 'does not exist' })

  describe('when we are hovering over the handle', () => {
    it('does not render the tooltip to the screen', () => {
      const handle = mocks.app().querySelector('.twitter-handle')! as HTMLDivElement
      const popupWindow = mocks.popupWindow()
      const event = new popupWindow.MouseEvent('mouseover', { bubbles: true })
      handle.dispatchEvent(event)

      const tooltip_error_msg = mocks.app().querySelector('.link-tooltip__error')! as HTMLDivElement
      expect(tooltip_error_msg.innerHTML).to.equal('No twitter account could be found')
    })
  })

  captureFirstScreenshot(mocks)
  takingScreenshots(mocks)
  feedbackEditing(mocks, { handle: '@zing.com' })
  postingFeedback(mocks, { handle: '@zing.com', result: 'success' })
})
