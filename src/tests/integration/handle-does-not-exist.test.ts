import { expect } from 'chai'
import { createMocks } from './mocks'
import { mountPopup } from './steps/mount-popup'
import { runBackground } from './steps/run-background'

describe('twitter handle does not exist for the domain', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })
  mountPopup(mocks, { alreadyAuthenticated: true, handle: 'does not exist' })

  describe('when we are hovering over the handle', () => {
    it('does not render the tooltip to the screen', () => {
      const handle = mocks.app().querySelector('.tooltip-hover-element')! as HTMLDivElement
      const event = new mocks.popupWindow.MouseEvent('mouseover', { bubbles: true })
      handle.dispatchEvent(event)

      const tooltip_error_msg = mocks.app().querySelector('.link-tooltip__error')! as HTMLDivElement
      expect(tooltip_error_msg.innerHTML).to.equal('No twitter account could be found')
    })
  })
})
