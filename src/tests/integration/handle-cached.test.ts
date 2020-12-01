import { createMocks } from './mocks'
import { mountPopup } from './steps/mount-popup'
import { runBackground } from './steps/run-background'

describe('twitter handle is cached locally', () => {
  const mocks = createMocks()

  runBackground(mocks)
  mountPopup(mocks, { handle: 'cached' })
})
