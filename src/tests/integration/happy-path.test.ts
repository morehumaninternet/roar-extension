import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { signInViaTwitter } from './steps/sign-in-via-twitter'
import { captureFirstScreenshot } from './steps/capture-first-screenshot'
import { takingScreenshots } from './steps/taking-screenshots'
import { postingFeedback } from './steps/posting-feedback'
import { feedbackEditing } from './steps/feedback-editing'

describe('happy path', () => {
  const mocks = createMocks()

  runBackground(mocks)
  mountPopup(mocks, { handle: 'exists' })
  signInViaTwitter(mocks)
  authenticateViaTwitter(mocks)
  captureFirstScreenshot(mocks)
  takingScreenshots(mocks)
  feedbackEditing(mocks, { handle: '@zing' })
  postingFeedback(mocks, { handle: '@zing', result: 'success' })
})
