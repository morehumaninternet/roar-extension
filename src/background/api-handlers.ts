import * as api from './api'
import * as handleCache from './handle-cache'
import { dispatch } from './store'

function tweetFormData(target: FeedbackTarget): FormData {
  const tweetData = new FormData()

  const status = target.feedbackState.editorState.getCurrentContent().getPlainText('\u0001')
  tweetData.append('status', status)
  tweetData.append('domain', target.domain!)

  // Adding all the screenshot files under the same form key - 'images'.
  target.feedbackState.images.forEach(image => tweetData.append('images', image.blob, image.name))

  return tweetData
}

export async function postTweet(target: FeedbackTarget): Promise<void> {
  const targetId: FeedbackTargetId = target.id
  dispatch('postTweetStart', { targetId })

  const result = await api.postFeedback(tweetFormData(target))
  if (result.ok) {
    chrome.tabs.create({ url: result.data.url, active: true })
    return dispatch('postTweetSuccess', { targetId })
  }

  return dispatch('postTweetFailure', { targetId, failure: result })
}

export async function fetchTwitterHandle(tabId: number, domain: string): Promise<void> {
  dispatch('fetchHandleStart', { tabId })

  const cachedHandle = await handleCache.get(domain)
  if (cachedHandle) return dispatch('fetchHandleSuccess', { tabId, website: { domain, ...cachedHandle } })

  // If we didn't find the handle in the cache, fetch the request from the server
  const result = await api.getWebsite(domain)
  if (result.ok) {
    const { data } = result
    if (data.twitter_handle) {
      handleCache.set({
        ...data,
        twitter_handle: data.twitter_handle,
      })
    }
    return dispatch('fetchHandleSuccess', { tabId, website: data })
  }

  return dispatch('fetchHandleFailure', { tabId, domain, failure: result })
}

export async function detectLogin(): Promise<void> {
  dispatch('detectLoginStart')
  dispatch('detectLoginResult', await api.getMe())
}

export const makeLogoutRequest = api.makeLogoutRequest
