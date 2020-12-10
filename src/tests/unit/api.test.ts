import * as fetchMock from 'fetch-mock'
import { expect } from 'chai'
import { JsonDecoder } from 'ts.data.json'
import * as api from '../../background/api'
import { createMocks } from '../integration/mocks'

describe('api', () => {
  createMocks()

  describe('fetchRoar', () => {
    async function mockPost(status: number, body: any): Promise<api.FetchRoarResult<{ nice: string }>> {
      fetchMock.mock({ url: 'https://test-roar-server.com/v1/my-cool-route', method: 'POST' }, { status, body })

      return api.fetchRoar(
        'v1/my-cool-route',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ awesome: 'data' }),
        },
        JsonDecoder.object({ nice: JsonDecoder.string }, 'NiceResponseData')
      )
    }

    it('resolves ok: true with the data when the response is in the 200 range with valid json', async () => {
      const result = await mockPost(200, { nice: 'response' })
      expect(result).to.have.property('ok', true)
      expect(result).to.have.property('data').that.eql({ nice: 'response' })
    })

    it('resolves ok: false, reason: "response not json" when the response is in the 200 range but the body is not valid json', async () => {
      const result = await mockPost(200, 'not json')
      expect(result).to.have.property('ok', false)
      expect(result).to.have.property('reason', 'response not json')
      expect(result).to.have.property('text', 'not json')
    })

    it('resolves ok: false, reason: "response not expected data type" when the response is in the 200 range and the body is valid json but not the expected data type', async () => {
      const result = await mockPost(200, { other: 'stuff' })
      expect(result).to.have.property('ok', false)
      expect(result).to.have.property('reason', 'response not expected data type')
      expect(result).to.have.property('text', '{"other":"stuff"}')
      expect(result).to.have.property('details', '<NiceResponseData> decoder failed at key "nice" with error: undefined is not a valid string')
    })

    it('resolves ok: false, reason: "bad request" when the response is 400', async () => {
      const result = await mockPost(400, 'you forgot to set it to wumbo')
      expect(result).to.have.property('ok', false)
      expect(result).to.have.property('reason', 'bad request')
      expect(result).to.have.property('details', 'you forgot to set it to wumbo')
    })

    it('resolves ok: false, reason: "unauthorized" when the response is 401', async () => {
      const result = await mockPost(401, 'Unauthorized')
      expect(result).to.have.property('ok', false)
      expect(result).to.have.property('reason', 'unauthorized')
    })

    it('resolves ok: false, reason: "service down" when the response is 503', async () => {
      const result = await mockPost(503, 'Twitter down')
      expect(result).to.have.property('ok', false)
      expect(result).to.have.property('reason', 'service down')
      expect(result).to.have.property('details', 'Twitter down')
    })

    it('resolves ok: false, reason: "server down" when the response is in the 500 range', async () => {
      const result = await mockPost(500, 'uh oh')
      expect(result).to.have.property('ok', false)
      expect(result).to.have.property('reason', 'server down')
      expect(result).to.have.property('details', 'uh oh')
    })

    it('resolves ok: false, reason: "unknown status" when the response has some other status', async () => {
      const result = await mockPost(418, "I'm a teapot")
      expect(result).to.have.property('ok', false)
      expect(result).to.have.property('reason', 'unknown status')
      expect(result).to.have.property('details', "I'm a teapot")
      expect(result).to.have.property('status', 418)
    })
  })
})
