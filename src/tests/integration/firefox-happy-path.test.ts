// tslint:disable:no-let
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'
import { authenticateViaTwitter } from './steps/authenticate-via-twitter'
import { onceAuthenticated } from './steps/once-authenticated'

describe.only('firefox happy path', () => {
  const mocks = createMocks({ browser: 'Firefox' })

  runBackground(mocks)
  mountPopup(mocks)
  authenticateViaTwitter(mocks, { browser: 'Firefox' })
  onceAuthenticated(mocks)
})
