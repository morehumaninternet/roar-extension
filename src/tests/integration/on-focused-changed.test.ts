import { expect } from 'chai'
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'

describe('another window is opened', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })
  mountPopup(mocks, { alreadyAuthenticated: true, handle: 'exists' })

  describe('when another window is focused on', () => {
    it('does not close the popup if the window ID is -1', () => {
      const [callback] = mocks.chrome.windows.onFocusChanged.addListener.firstCall.args
      const anotherWindowId = -1
      callback(anotherWindowId)
      expect(mocks.popupWindow().close).to.have.callCount(0)
    })

    it('closes the popup', () => {
      const popupWindow = mocks.popupWindow()
      const [callback] = mocks.chrome.windows.onFocusChanged.addListener.firstCall.args
      const anotherWindowId = 3
      callback(anotherWindowId)
      expect(popupWindow.close).to.have.callCount(1)
    })
  })
})
