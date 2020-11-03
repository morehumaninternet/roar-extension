import { Dispatch } from 'redux'

export function actions(dispatch: Dispatch<BackgroundAction>): DispatchBackgroundActions {
  return {
    screenshotCaptureSuccess: screenshot =>
      dispatch({
        type: 'SCREENSHOT_CAPTURE_SUCCESS',
        payload: { screenshot }
      }),

    screenshotCaptureFailure: error =>
      dispatch({
        type: 'SCREENSHOT_CAPTURE_FAILURE',
        payload: { error }
      }),

    postTweetSuccess: tweetResult =>
      dispatch({
        type: 'POST_TWEET_SUCCESS',
        payload: { tweetResult }
      }),

    postTweetFailure: error =>
      dispatch({
        type: 'POST_TWEET_FAILURE',
        payload: { error }
      })
  }
}
