import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { signInViaTwitter } from './steps/sign-in-via-twitter'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'

describe('authentication failure', () => {
  const mocks = createMocks()

  runBackground(mocks, { allowActionFailure: true })
  mountPopup(mocks, { handle: 'fetched' })
  signInViaTwitter(mocks)
  authenticateViaTwitter(mocks, { unauthorized: true })
})
