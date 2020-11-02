function tweetFormData(toBeTweeted: ToBeTweeted): FormData {
  const tweetData = new FormData()

  const status = toBeTweeted.feedbackState.editorState.getCurrentContent().getPlainText('\u0001')
  tweetData.append('status', status)

  // Adding all the screenshot files under the same form key - 'screenshots'.
  toBeTweeted.feedbackState.screenshots.forEach(screenshot => tweetData.append('screenshots', screenshot.blob, screenshot.name))

  return tweetData
}

function makeRequest(formData: FormData): Promise<Response> {
  return fetch(`${window.roarServerUrl}/v1/feedback`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })
}

export const postTweet = async (toBeTweeted: ToBeTweeted, dispatchBackgroundActions: DispatchBackgroundActions) => {
  try {
    const res = await makeRequest(tweetFormData(toBeTweeted))
    if (res.status !== 201) {
      return dispatchBackgroundActions.postTweetFailure(await res.text())
    }
    const tweetResult = await res.json()
    return dispatchBackgroundActions.postTweetSuccess(tweetResult)
  } catch (error) {
    return dispatchBackgroundActions.postTweetFailure(error)
  }
}
