import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'

type AuthenticateViaTwitterOpts = {
  mountEarly?: boolean
  unauthorized?: boolean
}

export function authenticateViaTwitter(mocks: Mocks, opts: AuthenticateViaTwitterOpts = {}): void {
  let description = opts.unauthorized ? 'unauthorized' : 'authorized' // tslint:disable-line:no-let
  if (opts.mountEarly) description += ' & mounted early'

  describe(`authentication via twitter (${description})`, () => {
    let resolveResponse: () => void // tslint:disable-line:no-let
    before(() => {
      const response = opts.unauthorized ? { status: 401, body: 'Unauthorized' } : { status: 200, body: { photoUrl: 'https://some-image-url.com/123' } }
      fetchMock.mock('https://test-roar-server.com/v1/me', new Promise(resolve => (resolveResponse = () => resolve(response))))
    })

    it('closes the tab that was redirected to the /auth-success page', async () => {
      const tabIdToClose = 802
      const [callback] = mocks.chrome.webNavigation.onCommitted.addListener.firstCall.args
      expect(mocks.chrome.tabs.remove).to.have.callCount(0)
      callback({
        url: 'https://test-roar-server.com/auth-success',
        transitionQualifiers: ['server_redirect'],
        tabId: tabIdToClose,
      })
      expect(mocks.chrome.tabs.remove).to.have.been.calledOnceWithExactly(tabIdToClose)
    })

    it('transitions to a detectLogin auth state', async () => {
      expect(mocks.getState().auth.state).to.equal('detectLogin')
    })

    it('has launched no notification', () => {
      expect(mocks.chrome.notifications.create).to.have.callCount(0)
    })

    if (opts.mountEarly) {
      it('mounts the popup', mocks.mount)

      it('renders the authenticating view', () => {
        expect(mocks.app().querySelector('.authenticating > .authenticating-spinner')).to.have.property('tagName', 'DIV')
      })
    }

    it('transitions out of a detectLogin auth state when the response from the call to /v1/me has come back', async () => {
      resolveResponse()
      await mocks.whenState(({ auth }) => auth.state !== 'detectLogin')
    })

    if (!opts.unauthorized && !opts.mountEarly) {
      it('launches a notification explaining the user is logged in', async () => {
        expect(mocks.chrome.notifications.create).to.have.callCount(1)
        const [notification] = mocks.chrome.notifications.create.firstCall.args
        expect(notification).to.have.property('title', 'Successful login')
      })
    } else {
      it('has launched no notification', () => {
        expect(mocks.chrome.notifications.create).to.have.callCount(0)
      })
    }
  })

  describe(`after authentication via twitter (${description})`, () => {
    if (!opts.mountEarly) {
      before(mocks.mount)
    }

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
