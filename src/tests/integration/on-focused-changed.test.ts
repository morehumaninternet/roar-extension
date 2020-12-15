import { expect } from 'chai'
import * as sinon from 'sinon'
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'

describe('another window is opened', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })
  mountPopup(mocks, { alreadyAuthenticated: true, handle: 'exists' })

  describe('when another window is focused on', () => {
    let popupWindowClose: sinon.SinonStub // tslint:disable-line:no-let
    before(() => (popupWindowClose = sinon.stub(mocks.popupWindow, 'close')))
    after(() => popupWindowClose.restore())

    it('closes the popup', () => {
      const [callback] = mocks.chrome.windows.onFocusChanged.addListener.firstCall.args
      const anotherWindowId = 3
      callback(anotherWindowId)
      expect(popupWindowClose).to.have.callCount(1)
    })
  })
})
