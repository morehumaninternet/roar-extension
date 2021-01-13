import { expect } from 'chai'
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { signInViaTwitter } from './steps/sign-in-via-twitter'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { captureFirstScreenshot } from './steps/capture-first-screenshot'
import { takingScreenshots } from './steps/taking-screenshots'
import { feedbackEditing } from './steps/feedback-editing'
import { getPlainText } from '../../draft-js-utils'

describe('switch subdomains', () => {
  const mocks = createMocks()

  runBackground(mocks, {
    windows: [{ id: 1, focused: true }],
    tabs: [
      {
        id: 11,
        windowId: 1,
        active: true,
        url: 'https://docs.google.com/document/u/blah',
      },
    ],
  })
  mountPopup(mocks, {
    handle: {
      domain: 'docs.google.com',
      expectedTwitterHandle: '@googledocs',
      response: {
        domain: 'google.com',
        twitter_handle: '@Google',
        non_default_twitter_handles: [
          { path: null, subdomain: 'docs', twitter_handle: '@googledocs' },
          { path: 'maps', subdomain: null, twitter_handle: '@googlemaps' },
        ],
      },
    },
  })
  signInViaTwitter(mocks)
  authenticateViaTwitter(mocks)
  captureFirstScreenshot(mocks)
  takingScreenshots(mocks)
  feedbackEditing(mocks, { handle: '@googledocs' })

  describe('switching urls', () => {
    it('starts with the correct website, twitter handle, and editor state', () => {
      const activeTab = mocks.ensureActiveTab()

      expect(activeTab.website).to.eql({
        domain: 'google.com',
        twitter_handle: '@Google',
        non_default_twitter_handles: [
          { path: null, subdomain: 'docs', twitter_handle: '@googledocs' },
          { path: 'maps', subdomain: null, twitter_handle: '@googlemaps' },
        ],
      })

      expect(activeTab.feedbackState.twitterHandle).to.eql({
        matchingDomain: 'docs.google.com',
        handle: '@googledocs',
      })

      expect(getPlainText(activeTab.feedbackState.editorState)).to.equal('@googledocs This is some feedback')
    })

    it('keeps the existing website, but updates the twitter handle and editor state when moving to a subdomain of the same website with a different twitter handle', () => {
      const [callback] = mocks.chrome.tabs.onUpdated.addListener.firstCall.args

      callback(11, { url: 'https://google.com' })

      const activeTab = mocks.ensureActiveTab()

      expect(activeTab.website).to.eql({
        domain: 'google.com',
        twitter_handle: '@Google',
        non_default_twitter_handles: [
          { path: null, subdomain: 'docs', twitter_handle: '@googledocs' },
          { path: 'maps', subdomain: null, twitter_handle: '@googlemaps' },
        ],
      })

      expect(activeTab.feedbackState.twitterHandle).to.eql({
        matchingDomain: 'google.com',
        handle: '@Google',
      })

      expect(getPlainText(activeTab.feedbackState.editorState)).to.equal('@Google ')
    })

    it('keeps the existing website, but updates the twitter handle and editor state when moving to a path of the same website with a different twitter handle', () => {
      const [callback] = mocks.chrome.tabs.onUpdated.addListener.firstCall.args

      callback(11, { url: 'https://google.com/maps/123' })

      const activeTab = mocks.ensureActiveTab()

      expect(activeTab.website).to.eql({
        domain: 'google.com',
        twitter_handle: '@Google',
        non_default_twitter_handles: [
          { path: null, subdomain: 'docs', twitter_handle: '@googledocs' },
          { path: 'maps', subdomain: null, twitter_handle: '@googlemaps' },
        ],
      })

      expect(activeTab.feedbackState.twitterHandle).to.eql({
        matchingDomain: 'google.com/maps',
        handle: '@googlemaps',
      })

      expect(getPlainText(activeTab.feedbackState.editorState)).to.equal('@googlemaps ')
    })
  })
})
