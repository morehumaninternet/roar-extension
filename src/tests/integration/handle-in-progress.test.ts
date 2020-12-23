import { expect } from 'chai'
import { ensureActiveTab } from '../../selectors'
import { createMocks } from './mocks'
import { mountPopup } from './steps/mount-popup'
import { runBackground } from './steps/run-background'

describe('twitter handle fetching in progress', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })
  const { resolveHandle } = mountPopup(mocks, { alreadyAuthenticated: true, handle: 'resolves later' })

  describe('when we are hovering over the handle', () => {
    it('renders that fetching the handle is in progress', () => {
      const handle = mocks.app().querySelector('.twitter-handle')! as HTMLDivElement
      const popupWindow = mocks.popupWindow()
      const event = new popupWindow.MouseEvent('mouseover', { bubbles: true })
      handle.dispatchEvent(event)

      const tooltip_error_msg = mocks.app().querySelector('.link-tooltip__error')! as HTMLDivElement
      expect(tooltip_error_msg.innerHTML).to.equal('Searching for twitter account...')
    })

    it('renders a link when fetching is done', async () => {
      resolveHandle()
      await mocks.whenState(state => ensureActiveTab(state).feedbackState.twitterHandle.status === 'DONE')

      const handle = mocks.app().querySelector('.twitter-handle')! as HTMLDivElement
      const popupWindow = mocks.popupWindow()
      const event = new popupWindow.MouseEvent('mouseover', { bubbles: true })
      handle.dispatchEvent(event)

      const tooltipLink = mocks.app().querySelector('.link-tooltip__anchor')! as HTMLAnchorElement
      expect(tooltipLink).to.have.property('href', 'https://twitter.com/zing')
      expect(tooltipLink).to.have.property('target', '_blank')
      expect(/^twitter\.com\/zing/.test(tooltipLink.innerHTML)).to.equal(true)
    })
  })
})
