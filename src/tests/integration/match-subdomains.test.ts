import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { signInViaTwitter } from './steps/sign-in-via-twitter'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { captureFirstScreenshot } from './steps/capture-first-screenshot'
import { takingScreenshots } from './steps/taking-screenshots'
import { feedbackEditing } from './steps/feedback-editing'
import { postingFeedback } from './steps/posting-feedback'

describe('match subdomain', () => {
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
  postingFeedback(mocks, { domain: 'docs.google.com', handle: '@googledocs', result: 'success' })
})
