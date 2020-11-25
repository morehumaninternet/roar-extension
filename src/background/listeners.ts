import { AppStore } from './store'
import * as images from './images'
import { detectLogin, fetchTwitterHandle, postTweet } from './api'
import { whenState } from '../redux-utils'
import { ensureActiveFeedbackTarget, targetById } from '../selectors'

export function popupConnect(store: AppStore, browser: typeof global.browser): void {
  store.on('popupConnect', state => {
    // For firefox, we open a separate tab that the user authenticatess with. So if they open the popup back up
    // when they're in the authenticating state, we detect if they're logged in and consider it a failure if they
    // aren't logged in
    if (state.browserInfo.browser === 'Firefox' && state.auth.state === 'authenticating') {
      detectLogin(store.dispatchers, { failIfNotLoggedIn: true })
    }

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
    if (target.feedbackState.addingImages + target.feedbackState.images.length < 1) {
      images.takeScreenshot(target, browser.tabs, store.dispatchers)
    }
  })
}

export function clickTakeScreenshot(store: AppStore, browser: typeof global.browser): void {
  store.on('clickTakeScreenshot', state => {
    const target = ensureActiveFeedbackTarget(state)
    images.takeScreenshot(target, browser.tabs, store.dispatchers)
  })
}

export function imageUpload(store: AppStore): void {
  store.on('imageUpload', state => {
    const target = ensureActiveFeedbackTarget(state)
    const { file } = state.mostRecentAction.payload
    images.imageUpload(target.id, file, store.dispatchers)
  })
}

export function signInWithTwitter(store: AppStore, browser: typeof global.browser, chrome: typeof global.chrome): void {
  store.on('signInWithTwitter', state => {
    if (state.browserInfo.browser === 'Firefox') {
      chrome.tabs.create({ url: `${window.roarServerUrl}/v1/auth/twitter`, active: true })
    }
  })
}

// Even if the post button is clicked we may not be ready to tweet yet.
// We have to wait for any in-flight images to be added and for the twitter
// handle to have been fetched. While waiting an alert my fire or we may lose
// the target (perhaps the tab closed). If that happens we say we are ready even
// though we won't actually post the tweet.
export function clickPost(store: AppStore, browser: typeof global.browser, chrome: typeof global.chrome): void {
  store.on('clickPost', state => {
    const targetId = ensureActiveFeedbackTarget(state).id

    function ready(state: StoreState): boolean {
      const target = targetById(state, targetId)
      if (state.alert || !target) return true
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
