function tweetFormData(target: FeedbackTarget): FormData {
  const tweetData = new FormData()

  const status = target.feedbackState.editorState.getCurrentContent().getPlainText('\u0001')
  tweetData.append('status', status)

  if (target.feedbackTargetType === 'tab') {
    tweetData.append('domain', target.domain!)
  } else {
    tweetData.append('help', 'true')
  }

  // Adding all the screenshot files under the same form key - 'images'.
  target.feedbackState.images.forEach(image => tweetData.append('images', image.blob, image.name))

  return tweetData
}

function makeTweetRequest(formData: FormData): Promise<Response> {
  return fetch(`${window.roarServerUrl}/v1/feedback`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
}

export const postTweet = async (target: FeedbackTarget, chrome: typeof global.chrome, dispatchBackgroundActions: Dispatchers<BackgroundAction>) => {
  const targetId: FeedbackTargetId = target.id

  try {
    dispatchBackgroundActions.postTweetStart({ targetId })
    const res = await makeTweetRequest(tweetFormData(target))
    if (res.status !== 201) {
      return dispatchBackgroundActions.postTweetFailure({
        targetId,
        error: { message: await res.text() },
      })
    }
    const tweetResult = await res.json()
    if (!tweetResult.url) {
      return dispatchBackgroundActions.postTweetFailure({
        targetId,
        error: { message: 'Response must include a url' },
      })
    }
    chrome.tabs.create({ url: tweetResult.url, active: true })
    return dispatchBackgroundActions.postTweetSuccess({ targetId })
  } catch (error) {
    return dispatchBackgroundActions.postTweetFailure({ targetId, error })
  }
}

function makeHandleRequest(domain: string): Promise<Response> {
  const params = { domain }
  const requestURL = new URL('v1/website', window.roarServerUrl)
  requestURL.search = new URLSearchParams(params).toString()
  return fetch(requestURL.toString())
}

export const fetchTwitterHandle = async (
  tabId: number,
  domain: string,
  dispatchBackgroundActions: Dispatchers<BackgroundAction>,
  handleCache: TwitterHandleCache
) => {
  try {
    dispatchBackgroundActions.fetchHandleStart({ tabId })

    const cachedHandle = await handleCache.get(domain)
    if (cachedHandle) return dispatchBackgroundActions.fetchHandleSuccess({ tabId, domain, handle: cachedHandle })

    // If we didn't find the handle in the cache, fetch the request from the server
    const res = await makeHandleRequest(domain)
    const { twitter_handle } = await res.json()
    if (twitter_handle) handleCache.set(domain, twitter_handle)

    return dispatchBackgroundActions.fetchHandleSuccess({ tabId, domain, handle: twitter_handle })
  } catch (error) {
    return dispatchBackgroundActions.fetchHandleFailure({ tabId, domain, error })
  }
}

export async function detectLogin(dispatchActions: Dispatchers<Action>, opts: { failIfNotLoggedIn?: boolean } = {}): Promise<void> {
  const requestURL = new URL('v1/me', window.roarServerUrl).toString()
  const response = await fetch(requestURL, { credentials: 'include' })
  if (response.status === 200) {
    const user = await response.json()
    return dispatchActions.authenticationSuccess(user)
  }
  if (opts.failIfNotLoggedIn) {
    dispatchActions.authenticationFailure({ error: { message: 'Not logged in.' } })
  }
}
