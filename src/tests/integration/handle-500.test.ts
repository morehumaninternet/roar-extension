import { expect } from 'chai'
import { createMocks } from './mocks'
import { mountPopup } from './steps/mount-popup'
import { runBackground } from './steps/run-background'

describe('twitter handle cannot be fetched due to a server error', () => {
  const mocks = createMocks()

  runBackground(mocks, { allowActionFailure: true })
  mountPopup(mocks, { handle: '500' })

  describe('app', () => {
    it('renders an appropriate alert message', () => {
      const alertMessage = mocks.app().querySelector('.alert-message')?.innerHTML
      expect(alertMessage).to.include('We tried to fetch the twitter handle for zing.com but something went wrong.')
    })
  })
})
