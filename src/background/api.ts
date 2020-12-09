import { JsonDecoder } from 'ts.data.json'

export type FetchRoarResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'response not json'; text: string; details: string }
  | { ok: false; reason: 'response not expected data type'; text: string; details: string }
  | { ok: false; reason: 'bad request'; details: string }
  | { ok: false; reason: 'unauthorized'; details: string }
  | { ok: false; reason: 'service down'; details: string }
  | { ok: false; reason: 'server down'; details: string }
  | { ok: false; reason: 'unknown status'; details: string; status: number }
  | { ok: false; reason: 'timeout'; details: string }
  | { ok: false; reason: 'network down'; details: string }

export async function fetchRoar<T extends object>(path: string, init: RequestInit, decoder: JsonDecoder.Decoder<T>): Promise<FetchRoarResult<T>> {
  try {
    const controller = new window.AbortController()
    const promisedResponse = fetch(`${window.roarServerUrl}/${path}`, { credentials: 'include', signal: controller.signal, ...init })

    controller.signal.addEventListener('abort', () => controller.abort())
    const timeout = setTimeout(() => controller.abort(), 10000)
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
      return { ok: false, reason: 'server down', details }
    }
    const details = await response.text()
    return { ok: false, reason: 'unknown status', details, status: response.status }
  } catch (error) {
    if (error.name === 'AbortError') {
      return { ok: false, reason: 'timeout', details: error.message }
    } else {
      return { ok: false, reason: 'network down', details: error.message }
    }
  }
}

type FeedbackResponseData = {
  url: string
}

const FeedbackResponseDataDecoder = JsonDecoder.object<FeedbackResponseData>({ url: JsonDecoder.string }, 'FeedbackResponseData')

export function postFeedback(formData: FormData): Promise<FetchRoarResult<FeedbackResponseData>> {
  return fetchRoar('v1/feedback', { method: 'POST', body: formData }, FeedbackResponseDataDecoder)
}

type WebsiteResponseData = {
  domain: string
  twitter_handle: null | string
}

const WebsiteResponseDataDecoder = JsonDecoder.object<WebsiteResponseData>(
  { domain: JsonDecoder.string, twitter_handle: JsonDecoder.nullable(JsonDecoder.string) },
  'WebsiteResponseData'
)

export function getWebsite(domain: string): Promise<FetchRoarResult<WebsiteResponseData>> {
  const search = new URLSearchParams({ domain })
  return fetchRoar(`v1/website?${search}`, {}, WebsiteResponseDataDecoder)
}

const UserDecoder = JsonDecoder.object<User>({ photoUrl: JsonDecoder.nullable(JsonDecoder.string) }, 'User')

export function getMe(): Promise<FetchRoarResult<User>> {
  return fetchRoar('v1/me', {}, UserDecoder)
}

export function makeLogoutRequest(): Promise<Response> {
  return fetch(`${window.roarServerUrl}/v1/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}
