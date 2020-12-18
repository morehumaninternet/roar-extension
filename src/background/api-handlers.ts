import * as api from './api'

function tweetFormData(target: FeedbackTarget): FormData {
  const tweetData = new FormData()

  const status = target.feedbackState.editorState.getCurrentContent().getPlainText('\u0001')
  tweetData.append('status', status)
  tweetData.append('domain', target.domain!)

  // Adding all the screenshot files under the same form key - 'images'.
  target.feedbackState.images.forEach(image => tweetData.append('images', image.blob, image.name))

  return tweetData
}

export const postTweet = async (target: FeedbackTarget, chrome: typeof global.chrome, dispatchBackgroundActions: Dispatchers<BackgroundAction>) => {
  const targetId: FeedbackTargetId = target.id
  dispatchBackgroundActions.postTweetStart({ targetId })

  const result = await api.postFeedback(tweetFormData(target))
  if (result.ok) {
    chrome.tabs.create({ url: result.data.url, active: true })
    return dispatchBackgroundActions.postTweetSuccess({ targetId })
  }

  return dispatchBackgroundActions.postTweetFailure({ targetId, failure: result })
}

export const fetchTwitterHandle = async (
  tabId: number,
  domain: string,
  dispatchBackgroundActions: Dispatchers<BackgroundAction>,
  handleCache: TwitterHandleCache
) => {
  dispatchBackgroundActions.fetchHandleStart({ tabId })

  const cachedHandle = await handleCache.get(domain)
  if (cachedHandle) return dispatchBackgroundActions.fetchHandleSuccess({ tabId, domain, handle: cachedHandle })

  // If we didn't find the handle in the cache, fetch the request from the server
  const result = await api.getWebsite(domain)
  if (result.ok) {
    if (result.data.twitter_handle) handleCache.set(domain, result.data.twitter_handle)
    return dispatchBackgroundActions.fetchHandleSuccess({ tabId, domain, handle: result.data.twitter_handle })
  }

  // TODO: handle different types of errors differently with a common function
  return dispatchBackgroundActions.fetchHandleFailure({ tabId, domain, failure: result })
}

export async function detectLogin(dispatchActions: Dispatchers<Action>, opts: { failIfNotLoggedIn?: boolean } = {}): Promise<void> {
  const result = await api.getMe()
  if (result.ok) {
    return dispatchActions.authenticationSuccess(result.data)
  }
  // TODO: handle different types of errors differently with a common function
  if (opts.failIfNotLoggedIn) {
    dispatchActions.authenticationFailure({ error: { message: 'Not logged in.' } })
  }
}
