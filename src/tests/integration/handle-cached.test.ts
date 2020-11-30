import { createMocks } from './mocks'
import { mountPopup } from './steps/mount-popup'
import { runBackground } from './steps/run-background'

describe('use existing handle if it is cached', () => {
  const mocks = createMocks()

  runBackground(mocks)
  mountPopup(mocks, { handleCached: true })
})
