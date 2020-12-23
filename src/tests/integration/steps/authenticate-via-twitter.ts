import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'

type AuthenticateViaTwitterOpts = {
  unauthorized?: boolean
}

export function authenticateViaTwitter(mocks: Mocks, opts: AuthenticateViaTwitterOpts = {}): void {
  describe('authentication via twitter', () => {
    before(() => {
      const response = opts.unauthorized ? { status: 401, body: 'Unauthorized' } : { status: 200, body: { photoUrl: 'https://some-image-url.com/123' } }
      fetchMock.mock('https://test-roar-server.com/v1/me', response)
    })

    it('makes a request to /v1/me to get the current user when the popup mounts again (after the user has logged in in the separate tab)', () => {
      mocks.mount()
    })
  })
}
