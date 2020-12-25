import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'

type AuthenticateViaTwitterOpts = {
  unauthorized?: boolean
}

export function authenticateViaTwitter(mocks: Mocks, opts: AuthenticateViaTwitterOpts = {}): void {
  const description = opts.unauthorized ? 'unauthorized' : 'authorized'

  describe(`authentication via twitter (${description})`, () => {
    before(() => {
      const response = opts.unauthorized ? { status: 401, body: 'Unauthorized' } : { status: 200, body: { photoUrl: 'https://some-image-url.com/123' } }
      fetchMock.mock('https://test-roar-server.com/v1/me', response)
    })

    it('makes a request to /v1/me to get the current user when the popup mounts again (after the user has logged in in the separate tab)', () => {
      mocks.mount()
    })

    if (opts.unauthorized) {
      it('goes back to the not-authed view', () => {
        expect(mocks.app().querySelector('.sign-in-btn')!.innerHTML).to.include('Log in with Twitter')
      })

      it('has no alert as incorrect login is handled by twitter itself', () => {
        expect(mocks.app().querySelector('.alert-message')).to.equal(null)
      })
    } else {
      it('renders the app with an emoji picker container and the main element', () => {
        const authenticatedView = mocks.app().querySelector('.authenticated')!
        expect(authenticatedView.childNodes).to.have.length(2)
        expect(authenticatedView.childNodes[0]).to.have.property('className', 'emoji-picker-container closed')
        expect(authenticatedView.childNodes[1]).to.have.property('tagName', 'MAIN')
      })

      it('renders the profile image', () => {
        const profileImage = mocks.app().querySelector('img.profile-img')!
        expect(profileImage).to.have.property('src', 'https://some-image-url.com/123')
      })
    }
  })
}
