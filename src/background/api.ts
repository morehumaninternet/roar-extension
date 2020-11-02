export const postTweet = async (toBeTweeted: ToBeTweeted, dispatchBackgroundActions: DispatchBackgroundActions) => {
  const tweetData = new FormData()

  const status = toBeTweeted.feedbackState.editorState.getCurrentContent().getPlainText('\u0001')
  tweetData.append('status', status)

  // Adding all the screenshot files under the same form key - 'screenshots'.
  // If there are multiple screenshots, 'screenshots' will be an array of file objects.
  // If there's only one file, 'screenshots' will be a single file object.
  toBeTweeted.feedbackState.screenshots.map((screenshot, index) => {
    tweetData.append(`screenshots`, screenshot.blob, `screenshot name ${index}`)
  })

  try {
    const res = await fetch(`${window.roarServerUrl}/v1/feedback`, {
      method: 'POST',
      credentials: 'include',
      body: tweetData
    })
    if (res.status !== 201) {
      return dispatchBackgroundActions.postTweetFailure(await res.text())
    }
    const tweetResult = await res.json()
    return dispatchBackgroundActions.postTweetSuccess(tweetResult)
  } catch (error) {
    return dispatchBackgroundActions.postTweetFailure(error)
  }
}
