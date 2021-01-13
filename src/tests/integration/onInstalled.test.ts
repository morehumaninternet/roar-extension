import { expect } from 'chai'
import { createMocks } from './mocks'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { mountPopup } from './steps/mount-popup'
import { onInstalled } from './steps/onInstalled'
import { runBackground } from './steps/run-background'

describe('noop when onInstalled reason is update', () => {
  const mocks = createMocks()
  runBackground(mocks)
  onInstalled(mocks, { reason: 'update' })
})

describe('authenticated when popup not mounted in between onInstalled when reason is install', () => {
  const mocks = createMocks()
  runBackground(mocks)
  onInstalled(mocks, { reason: 'install' })
  authenticateViaTwitter(mocks)

  describe('after authentication', () => {
    it('is now authenicated', () => {
      expect(mocks.getState().auth.state).to.equal('authenticated')
    })
  })
})

describe('authenticated when popup mounted in between onInstalled when reason is install', () => {
  const mocks = createMocks()
  runBackground(mocks)
  onInstalled(mocks, { reason: 'install' })
  mountPopup(mocks, { handle: 'fetched' })

  describe('first detectLogin', () => {
    it('is now in a not_authed state', () => {
      expect(mocks.getState().auth.state).to.equal('not_authed')
    })

    after(() => mocks.popupWindow().close())
  })

  authenticateViaTwitter(mocks)

  describe('after authentication', () => {
    it('is now authenicated', () => {
      expect(mocks.getState().auth.state).to.equal('authenticated')
    })
  })
})
