import { createMocks } from './mocks'
import { mountPopup } from './steps/mount-popup'
import { runBackground } from './steps/run-background'

describe('twitter handle does not exist for the domain', () => {
  const mocks = createMocks()

  runBackground(mocks)
  mountPopup(mocks, { handle: 'does not exist' })
})
