function tweetFormData(target: FeedbackTarget): FormData {
  const tweetData = new FormData()

  const status = target.feedbackState.editorState.getCurrentContent().getPlainText('\u0001')
  tweetData.append('status', status)
  tweetData.append('domain', target.domain!)

  // Adding all the screenshot files under the same form key - 'images'.
  target.feedbackState.images.forEach(image => tweetData.append('images', image.blob, image.name))

  return tweetData
}

export function createHandlers(
  api: Api,
  handleCache: TwitterHandleCache,
  chrome: typeof global.chrome,
  dispatchBackgroundActions: Dispatchers<BackgroundAction>
): ApiHandlers {
  return {
    async postTweet(target: FeedbackTarget) {
      const targetId: FeedbackTargetId = target.id
      dispatchBackgroundActions.postTweetStart({ targetId })

      const result = await api.postFeedback(tweetFormData(target))
      if (result.ok) {
        chrome.tabs.create({ url: result.data.url, active: true })
        return dispatchBackgroundActions.postTweetSuccess({ targetId })
      }

      return dispatchBackgroundActions.postTweetFailure({ targetId, failure: result })
    },

    async fetchTwitterHandle(tabId: number, domain: string) {
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
    },

    async detectLogin(): Promise<void> {
      dispatchBackgroundActions.detectLoginStart()
      dispatchBackgroundActions.detectLoginResult(await api.getMe())
    },

    makeLogoutRequest: api.makeLogoutRequest,
  }
}
