import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { signInViaTwitter } from './steps/sign-in-via-twitter'
import { captureFirstScreenshot } from './steps/capture-first-screenshot'
import { postingFeedback } from './steps/posting-feedback'
import { feedbackEditing } from './steps/feedback-editing'

unauthorized({ mountEarly: true })
unauthorized({ mountEarly: false })

function unauthorized({ mountEarly }: { mountEarly: boolean }): void {
  let description = 'unauthorized' // tslint:disable-line:no-let
  if (mountEarly) description += ' (mount early)'

  describe(description, () => {
    const mocks = createMocks()

    runBackground(mocks, { allowActionFailure: true })
    mountPopup(mocks, { handle: 'fetched' })
    signInViaTwitter(mocks)
    authenticateViaTwitter(mocks, { mountEarly })
    captureFirstScreenshot(mocks)
    feedbackEditing(mocks, { handle: '@zing' })
    postingFeedback(mocks, { handle: '@zing', result: 'unauthorized' })
  })
}
