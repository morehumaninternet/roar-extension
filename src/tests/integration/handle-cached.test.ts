import { expect } from 'chai'
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mount } from '../../popup/mount'

describe('use existing handle if it is cached', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })
  mocks.browser.tabs.get.withArgs(14).resolves({ width: 1200, height: 900 })
  mount(mocks.chrome as any, mocks.popupWindow as any)

  it('should not cache the handle if it is already cached', () => {
    // tslint:disable no-unused-expression
    console.log('9'.repeat(200))
    // expect(mocks.chrome.storage.local.get).to.be.calledOnce  ---- TODO - not working
    expect(mocks.chrome.storage.local.set).to.have.not.been.called
    // tslint:enable no-unused-expression
  })
})
