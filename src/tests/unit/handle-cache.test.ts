// tslint:disable:no-let
import { expect } from 'chai'
import { range } from 'lodash'
import * as handleCache from '../../background/handle-cache'

describe('handle-cache', () => {
  let localStorage = {}
  before(() => {
    global.chrome = {
      storage: {
        local: {
          get: cb => cb(localStorage),
          set: updates => (localStorage = { ...localStorage, ...updates }),
        },
      },
    } as any
  })

  after(() => {
    delete (global as any)['chrome']
  })

  it('only retains the latest 50 cached handles', async () => {
    for (const i of range(51)) {
      await handleCache.set(`domain-${i}`, `@${i}`)
    }

    expect(await handleCache.get('domain-0')).to.equal(undefined)
    expect(await handleCache.get('domain-1')).to.equal('@1')
    expect(await handleCache.get('domain-50')).to.equal('@50')
  })
})
