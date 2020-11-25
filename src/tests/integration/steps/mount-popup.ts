// tslint:disable:no-let
import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'
import { mount } from '../../../popup/mount'
import { ensureActiveTab } from '../../../selectors'
import { getPlainText } from '../../../draft-js-utils'

type MountPopupOpts = {
  alreadyAuthenticated?: boolean
}

export function mountPopup(mocks: Mocks, opts: MountPopupOpts = {}): void {
  const description = opts.alreadyAuthenticated ? 'when already authed' : 'when not yet authed'
  describe('popup mount ' + description, () => {
    before(() => {
      fetchMock.mock('https://test-roar-server.com/v1/website?domain=zing.com', { status: 200, body: { twitter_handle: '@zing' } })
    })
    before(() => mocks.browser.tabs.get.withArgs(14).resolves({ width: 1200, height: 900 }))
    before(() => mount(mocks.chrome as any, mocks.popupWindow as any))
    after(() => {
      if (!fetchMock.done()) throw new Error('Fetch not called the expected number of times')
      fetchMock.restore()
    })

<<<<<<< HEAD
    if (!opts.alreadyAuthenticated) {
      it('mounts the app with a button to sign in with twitter', () => {
        const appContainer = mocks.popupWindow.document.getElementById('app-container')!
        const signInWithTwitter = appContainer.querySelector('button')!
        expect(signInWithTwitter).to.have.property('innerHTML', 'Sign in with twitter')
      })
    }
=======
    it('mounts the app with a button to login in with twitter', () => {
      const appContainer = mocks.popupWindow.document.getElementById('app-container')!
      const signInWithTwitter = appContainer.querySelector('button')!
      expect(signInWithTwitter).to.have.property('innerHTML', 'Log in with Twitter')
    })
>>>>>>> 8ad0810... change sign in with twitter to log in with twitter

    it('dispatches popupConnect, resulting in the twitter handle being fetched & a call made to captureVisibleTab to get a screenshot', () => {
      const activeTab = ensureActiveTab(mocks.getState())

      expect(activeTab.feedbackState.twitterHandle.handle).to.equal('@zing')
      expect(getPlainText(activeTab.feedbackState.editorState)).to.equal('@zing ')
      expect(activeTab.feedbackState.addingImages).to.equal(1)
    })

    it('adds an event listener for when the window unloads', () => {
      const unloadCall = mocks.popupWindow.addEventListener.getCalls().find(call => call.args[0] === 'unload')!
      const [eventName, callback] = unloadCall.args
      expect(eventName).to.equal('unload')
      expect(callback).to.be.a('function')
    })
  })
}
