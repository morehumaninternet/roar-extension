import { JsonDecoder } from 'ts.data.json'
import { maxApiRequestMilliseconds } from './settings'
import { FeedbackResponseDataDecoder, WebsiteDecoder, UserDecoder } from './decoders'

export async function fetchRoar<T extends object>(path: string, init: RequestInit, decoder: JsonDecoder.Decoder<T>): Promise<FetchRoarResult<T>> {
  try {
    const controller = new AbortController()
    const promisedResponse = fetch(`${global.ROAR_SERVER_URL}/${path}`, { credentials: 'include', signal: controller.signal, ...init })

    controller.signal.addEventListener('abort', () => controller.abort())
    const timeout = setTimeout(() => controller.abort(), maxApiRequestMilliseconds)
    promisedResponse.finally(() => clearTimeout(timeout))

    const response = await promisedResponse

    if (response.status >= 200 && response.status < 300) {
      const text = await response.text()
      try {
        const json = JSON.parse(text)
        const decoded = decoder.decode(json)
        if (decoded.isOk()) {
          return { ok: true, data: decoded.value }
        } else {
          return { ok: false, reason: 'response not expected data type', text, details: decoded.error }
        }
      } catch (error) {
        return { ok: false, reason: 'response not json', details: error.message, text }
      }
    }
    if (response.status === 400) {
      const details = await response.text()
      return { ok: false, reason: 'bad request', details }
    }
    if (response.status === 401) {
      return { ok: false, reason: 'unauthorized', details: '401 received' }
    }
    if (response.status === 503) {
      const details = await response.text()
      return { ok: false, reason: 'service down', details }
    }
    if (response.status >= 500) {
      const details = await response.text()
      return { ok: false, reason: 'server error', details }
    }
    const details = await response.text()
    return { ok: false, reason: 'unknown status', details, status: response.status }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, reason: 'timeout', details: error.message }
    } else {
      global.CONSOLE_ERROR(error)
      return { ok: false, reason: 'network down', details: error.message }
    }
  }
}

export function postFeedback(formData: FormData): Promise<FetchRoarResult<FeedbackResponseData>> {
  return fetchRoar('v1/feedback', { method: 'POST', body: formData }, FeedbackResponseDataDecoder)
}

export function getWebsite(domain: string): Promise<FetchRoarResult<Website>> {
  const search = new URLSearchParams({ domain })
  return fetchRoar(`v1/website?${search}`, {}, WebsiteDecoder)
}

export function getMe(): Promise<FetchRoarResult<User>> {
  return fetchRoar('v1/me', {}, UserDecoder)
}

export function makeLogoutRequest(): Promise<Response> {
  return fetch(`${global.ROAR_SERVER_URL}/v1/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}
