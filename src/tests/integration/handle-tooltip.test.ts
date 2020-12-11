import { expect } from 'chai'
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'

describe('handle tooltip', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })
  mountPopup(mocks, { alreadyAuthenticated: true, handle: 'exists' })

  describe('when we are not hovering over the handle', () => {
    it('does not render the tooltip to the screen', () => {
      const tooltip = mocks.app().querySelector('.link-tooltip')
      expect(tooltip).to.equal(null)
    })
  })

  describe('when we are hovering over the handle', () => {
    it('renders a tooltip', () => {
      const handle = mocks.app().querySelector('.tooltip-hover-element')! as HTMLDivElement
      const event = new mocks.popupWindow.MouseEvent('mouseover', { bubbles: true })
      handle.dispatchEvent(event)

      const tooltipLink = mocks.app().querySelector('.link-tooltip__anchor')! as HTMLAnchorElement
      expect(tooltipLink).to.have.property('href', 'https://twitter.com/zing')
      expect(tooltipLink).to.have.property('target', '_blank')
      expect(/^twitter\.com\/zing/.test(tooltipLink.innerHTML)).to.equal(true)
    })

    it('does not remove the tooltip when hovering over it', () => {
      const tooltip = mocks.app().querySelector('.link-tooltip')! as HTMLDivElement
      const event = new mocks.popupWindow.MouseEvent('mouseover', { bubbles: true })
      tooltip.dispatchEvent(event)

      const tooltipLink = mocks.app().querySelector('.link-tooltip__anchor')
      expect(tooltipLink).to.not.equal(null)
    })

    it('removes the tooltip when hovering over something else', () => {
      const postBtn = mocks.app().querySelector('.post-btn')! as HTMLButtonElement
      const event = new mocks.popupWindow.MouseEvent('mouseover', { bubbles: true })
      postBtn.dispatchEvent(event)

      const tooltipLink = mocks.app().querySelector('.link-tooltip__anchor')
      expect(tooltipLink).to.equal(null)
    })
  })
})
