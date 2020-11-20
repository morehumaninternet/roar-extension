import { AppStore } from './store'
import * as images from './images'
import { fetchTwitterHandle, postTweet } from './api'
import { whenState } from '../redux-utils'
import { ensureActiveFeedbackTarget, targetById } from '../selectors'

export function popupConnect(store: AppStore, browser: typeof global.browser) {
  store.on('popupConnect', state => {
    const target = ensureActiveFeedbackTarget(state)
    if (target.feedbackState.isTweeting) return

    if (target.feedbackTargetType === 'tab') {
      const tab = target
      if (!tab.domain) return
      // it the handle wasn't fetched before and the tab domain exists,
      // start the fetch process
      if (tab.feedbackState.twitterHandle.status === 'NEW') {
        fetchTwitterHandle(tab.id, tab.domain, store.dispatchers)
      }
    }

    // Take a screenshot if no images currently present for the current feedback target
    if (!target.feedbackState.images.length) {
      images.takeScreenshot(target, browser.tabs, store.dispatchers)
    }
  })
}

export function clickTakeScreenshot(store: AppStore, browser: typeof global.browser) {
  store.on('clickTakeScreenshot', state => {
    const target = ensureActiveFeedbackTarget(state)
    images.takeScreenshot(target, browser.tabs, store.dispatchers)
  })
}

export function imageUpload(store: AppStore) {
  store.on('imageUpload', state => {
    const target = ensureActiveFeedbackTarget(state)
    const { file } = state.mostRecentAction.payload
    images.imageUpload(target.id, file, store.dispatchers)
  })
}

// Even if the post button is clicked we may not be ready to tweet yet.
// We have to wait for any in-flight images to be added and for the twitter
// handle to have been fetched. While waiting an alert my fire or we may lose
// the target (perhaps the tab closed). If that happens we say we are ready even
// though we won't actually post the tweet.
export function clickPost(store: AppStore, browser: typeof global.browser, chrome: typeof global.chrome) {
  store.on('clickPost', state => {
    const targetId = ensureActiveFeedbackTarget(state).id

    function ready(state: StoreState): boolean {
      const target = targetById(state, targetId)
      if (state.alert) return true
      if (!target) return true
      const imagesReady = !target.feedbackState.addingImages
      const twitterHandleReady = target.feedbackState.twitterHandle.status === 'DONE'
      return imagesReady && twitterHandleReady
    }

    whenState(store, ready, 3000)
      .then(state => {
        const target = targetById(state, targetId)
        if (!state.alert && target) {
          postTweet(target, chrome, store.dispatchers)
        }
      })
      .catch(error => {
        console.error(error)
        if (error.message === 'timeout') {
          store.dispatchers.postTweetFailure({ targetId, error: { message: 'Timed out. Please try again later' } })
        }
      })
  })
}
