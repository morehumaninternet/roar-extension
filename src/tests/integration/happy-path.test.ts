import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { onceAuthenticated } from './steps/once-authenticated'
import { signInViaTwitter } from './steps/sign-in-via-twitter'
import { captureFirstScreenshot } from './steps/capture-first-screenshot'
import { takingScreenshots } from './steps/taking-screenshots'
import { postingFeedback } from './steps/posting-feedback'
import { feedbackEditing } from './steps/feedback-editing'

happyPath({ browser: 'Chrome' })
happyPath({ browser: 'Firefox' })

function happyPath(opts: { browser: SupportedBrowser }): void {
  describe('happy path for ' + opts.browser, () => {
    const mocks = createMocks(opts)

    runBackground(mocks)
    mountPopup(mocks, { handle: 'exists' })
    signInViaTwitter(mocks, opts)
    authenticateViaTwitter(mocks, opts)
    onceAuthenticated(mocks)
    captureFirstScreenshot(mocks)
    takingScreenshots(mocks)
    feedbackEditing(mocks)
    postingFeedback(mocks)
  })
}
