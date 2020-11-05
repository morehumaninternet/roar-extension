import { Dispatch } from 'redux'

export function actions(dispatch: Dispatch<BackgroundAction>): DispatchBackgroundActions {
  return {
    startFetchHandle: () =>
      dispatch({
        type: 'START_FETCH_HANDLE',
      }),

    fetchHandleSuccess: handle =>
      dispatch({
        type: 'FETCH_HANDLE_SUCCESS',
        payload: { handle },
      }),

    fetchHandleFailure: error =>
      dispatch({
        type: 'FETCH_HANDLE_FAILURE',
        payload: { error },
      }),

    screenshotCaptureSuccess: screenshot =>
      dispatch({
        type: 'SCREENSHOT_CAPTURE_SUCCESS',
        payload: { screenshot },
      }),

    screenshotCaptureFailure: error =>
      dispatch({
        type: 'SCREENSHOT_CAPTURE_FAILURE',
        payload: { error },
      }),

    postTweetSuccess: tweetResult =>
      dispatch({
        type: 'POST_TWEET_SUCCESS',
        payload: { tweetResult },
      }),

    postTweetFailure: error =>
      dispatch({
        type: 'POST_TWEET_FAILURE',
        payload: { error },
      }),
  }
}
