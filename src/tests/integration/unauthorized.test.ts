import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { onceAuthenticated } from './steps/once-authenticated'
import { signInViaTwitter } from './steps/sign-in-via-twitter'
import { captureFirstScreenshot } from './steps/capture-first-screenshot'
import { postingFeedback } from './steps/posting-feedback'
import { feedbackEditing } from './steps/feedback-editing'

describe('unauthorized', () => {
  const mocks = createMocks()

  runBackground(mocks, { allowActionFailure: true })
  mountPopup(mocks, { handle: 'exists' })
  signInViaTwitter(mocks)
  authenticateViaTwitter(mocks)
  onceAuthenticated(mocks)
  captureFirstScreenshot(mocks)
  feedbackEditing(mocks, { handle: '@zing' })
  postingFeedback(mocks, { handle: '@zing', result: 'unauthorized' })
})
