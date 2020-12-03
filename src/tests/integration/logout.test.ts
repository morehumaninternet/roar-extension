import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { whenState } from '../../redux-utils'
import * as fetchMock from 'fetch-mock'

describe('logout', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })
  mountPopup(mocks, { alreadyAuthenticated: true, handle: 'exists' })

  describe('logout button', () => {
    before(() => {
      fetchMock.mock({ url: 'https://test-roar-server.com/v1/logout', method: 'POST' }, 'OK')
    })

    after(() => {
      if (!fetchMock.done()) throw new Error('Fetch not called the expected number of times')
      fetchMock.restore()
    })

    it('transitions to a not_authed state and makes a POST to v1/logout when clicked', async () => {
      const logoutButton = mocks.app().querySelector('.logout-btn')! as HTMLButtonElement
      logoutButton.click()!
      await whenState(mocks.backgroundWindow.store, state => state.auth.state === 'not_authed')
    })
  })
})
