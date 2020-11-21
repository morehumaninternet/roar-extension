// tslint:disable:no-let
import { expect } from 'chai'
import { Mocks } from '../mocks'

export function onceAuthenticated(mocks: Mocks) {
  describe('once authenticated', () => {
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
  })
}
