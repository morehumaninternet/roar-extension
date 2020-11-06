function tweetFormData(toBeTweeted: ToBeTweeted): FormData {
  const tweetData = new FormData()

  const status = toBeTweeted.feedbackState.editorState.getCurrentContent().getPlainText('\u0001')
  tweetData.append('status', status)

  // Adding all the screenshot files under the same form key - 'screenshots'.
  toBeTweeted.feedbackState.screenshots.forEach(screenshot => tweetData.append('screenshots', screenshot.blob, screenshot.name))

  return tweetData
}

function makeTweetRequest(formData: FormData): Promise<Response> {
  return fetch(`${window.roarServerUrl}/v1/feedback`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
}

export const postTweet = async (toBeTweeted: ToBeTweeted, dispatchBackgroundActions: DispatchBackgroundActions) => {
  try {
    const res = await makeTweetRequest(tweetFormData(toBeTweeted))
    if (res.status !== 201) {
      return dispatchBackgroundActions.postTweetFailure(await res.text())
    }
    const tweetResult = await res.json()
    if (!tweetResult.url) {
      return dispatchBackgroundActions.postTweetFailure({ message: 'Response must include a url' })
    }
    return dispatchBackgroundActions.postTweetSuccess(tweetResult)
  } catch (error) {
    return dispatchBackgroundActions.postTweetFailure(error)
  }
}

function makeHandleRequest(host: string): Promise<Response> {
  const params = { domain: host }
  const requestURL = new URL('v1/website', window.roarServerUrl)
  requestURL.search = new URLSearchParams(params).toString()
  return fetch(requestURL.toString())
}

export const fetchTwitterHandle = async (tabId: number, host: string, dispatchBackgroundActions: DispatchBackgroundActions) => {
  try {
    dispatchBackgroundActions.fetchHandleStart(tabId)
    const res = await makeHandleRequest(host)
    const { twitter_handle } = await res.json()
    return dispatchBackgroundActions.fetchHandleSuccess({ tabId, host, handle: twitter_handle })
  } catch (error) {
    return dispatchBackgroundActions.fetchHandleFailure({ tabId, host, error })
  }
}
