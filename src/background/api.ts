export const postTweet = async (toBeTweeted: ToBeTweeted, dispatchBackgroundActions: DispatchBackgroundActions) => {
  const status = toBeTweeted.feedbackState.editorState.getCurrentContent().getPlainText('\u0001')
  try {
    const res = await fetch(`${window.roarServerUrl}/v1/feedback`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
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
