// tslint:disable:no-let
import { expect } from 'chai'
import { range } from 'lodash'
import { createHandleCache } from '../../background/handle-cache'

describe('handle-cache', () => {
  it('only retains the latest 50 cached handles', async () => {
    let localStorage = {}
    const handleCache = createHandleCache({
      storage: {
        local: {
          get: cb => cb(localStorage),
          set: updates => (localStorage = { ...localStorage, ...updates }),
        },
      },
    } as any)

    for (const i of range(51)) {
      handleCache.set(`domain-${i}`, `@${i}`)
    }

    expect(await handleCache.get('domain-0')).to.equal(undefined)
    expect(await handleCache.get('domain-50')).to.equal('@50')
  })
})
