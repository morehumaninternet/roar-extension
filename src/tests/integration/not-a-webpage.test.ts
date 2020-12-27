import { expect } from 'chai'
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'

describe('authenticated and not a web page', () => {
  const mocks = createMocks()

  runBackground(mocks, {
    alreadyAuthenticated: true,
    windows: [{ id: 1, focused: true }],
    tabs: [{ id: 17, windowId: 1, active: true, url: 'chrome://extensions' }],
  })
  mountPopup(mocks, { alreadyAuthenticated: true, handle: 'never fetched' })

  describe('not a web page', () => {
    it('renders appropriate alert message', () => {
      const alertMessage = mocks.app().querySelector('.alert-message')?.innerHTML
      expect(alertMessage).to.include('Roar does not work on this tab because it is not a web page.')
    })
  })
})
