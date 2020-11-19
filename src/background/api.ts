function tweetFormData(feedbackState: FeedbackState, domain: string): FormData {
  const tweetData = new FormData()

  const status = feedbackState.editorState.getCurrentContent().getPlainText('\u0001')
  tweetData.append('status', status)

  tweetData.append('domain', domain)

  // Adding all the screenshot files under the same form key - 'screenshots'.
  feedbackState.screenshots.forEach(screenshot => tweetData.append('screenshots', screenshot.blob, screenshot.name))

  return tweetData
}

function makeTweetRequest(formData: FormData): Promise<Response> {
  return fetch(`${window.roarServerUrl}/v1/feedback`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
}

export const postTweet = async (tab: TabInfo, chrome: typeof global.chrome, dispatchBackgroundActions: Dispatchers<BackgroundAction>) => {
  try {
    const res = await makeTweetRequest(tweetFormData(tab.feedbackState, tab.domain!))
    if (res.status !== 201) {
      return dispatchBackgroundActions.postTweetFailure({
        tabId: tab.id,
        error: { message: await res.text() },
      })
    }
    const tweetResult = await res.json()
    if (!tweetResult.url) {
      return dispatchBackgroundActions.postTweetFailure({
        tabId: tab.id,
        error: { message: 'Response must include a url' },
      })
    }
    chrome.tabs.create({ url: tweetResult.url, active: true })
    return dispatchBackgroundActions.postTweetSuccess({ tabId: tab.id })
  } catch (error) {
    return dispatchBackgroundActions.postTweetFailure({ tabId: tab.id, error })
  }
}

function makeHandleRequest(domain: string): Promise<Response> {
  const params = { domain }
  const requestURL = new URL('v1/website', window.roarServerUrl)
  requestURL.search = new URLSearchParams(params).toString()
  return fetch(requestURL.toString())
}

export const fetchTwitterHandle = async (tabId: number, domain: string, dispatchBackgroundActions: Dispatchers<BackgroundAction>) => {
  try {
    dispatchBackgroundActions.fetchHandleStart({ tabId })
    const res = await makeHandleRequest(domain)
    const { twitter_handle } = await res.json()
    return dispatchBackgroundActions.fetchHandleSuccess({ tabId, domain, handle: twitter_handle })
  } catch (error) {
    return dispatchBackgroundActions.fetchHandleFailure({ tabId, domain, error })
  }
}
