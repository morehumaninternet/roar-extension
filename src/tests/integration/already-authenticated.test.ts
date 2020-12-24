import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'
import { mountPopup } from './steps/mount-popup'

describe('already authenticated when extension loads', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })
  mountPopup(mocks, { alreadyAuthenticated: true, handle: 'exists' })
})
