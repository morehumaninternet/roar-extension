import { expect } from 'chai'
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'

describe('welcome on installed', () => {
  const mocks = createMocks()

  runBackground(mocks)

  describe('on installed', () => {
    it('does nothing when the reason is "update"', () => {
      const [callback] = mocks.chrome.runtime.onInstalled.addListener.firstCall.args
      callback({ reason: 'update' })
      expect(mocks.chrome.tabs.create).to.have.callCount(0)
    })

    it('opens the /welcome page when the reason is "install"', () => {
      const [callback] = mocks.chrome.runtime.onInstalled.addListener.firstCall.args
      callback({ reason: 'install' })
      expect(mocks.chrome.tabs.create).to.have.been.calledOnceWithExactly({
        active: true,
        url: 'https://test-roar-server.com/welcome',
      })
    })
  })
})
