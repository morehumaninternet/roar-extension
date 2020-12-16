import { AppStore } from './store'
import * as images from './images'
import { makeLogoutRequest } from './api'
import { detectLogin, fetchTwitterHandle, postTweet } from './api-handlers'
import { whenState } from '../redux-utils'
import { ensureActiveFeedbackTarget, targetById, totalImages } from '../selectors'

type ListenerDependencies = {
  store: AppStore
  browser: typeof global.browser
  chrome: typeof global.chrome
  handleCache: TwitterHandleCache
}

export function popupConnect({ store, browser, handleCache }: ListenerDependencies): void {
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
        fetchTwitterHandle(tab.id, tab.domain, store.dispatchers, handleCache)
      }
    }

    // Take an automatic screenshot if we didn't take one before
    if (target.feedbackState.takeAutoSnapshot) {
      images.takeScreenshot(target, browser.tabs, store.dispatchers)
      store.dispatchers.disableAutoSnapshot({ targetId: target.id })
    }
  })
}

export function clickLogout({ store, browser }: ListenerDependencies): void {
  store.on('clickLogout', state => {
    if (state.auth.state === 'not_authed') {
      makeLogoutRequest()
    }
  })
}

export function clickTakeScreenshot({ store, browser }: ListenerDependencies): void {
  store.on('clickTakeScreenshot', state => {
    const target = ensureActiveFeedbackTarget(state)
    images.takeScreenshot(target, browser.tabs, store.dispatchers)
  })
}

export function imageUpload({ store }: ListenerDependencies): void {
  store.on('imageUpload', state => {
    const target = ensureActiveFeedbackTarget(state)
    const { file } = state.mostRecentAction.payload
    images.imageUpload(target.id, file, store.dispatchers)
  })
}

export function signInWithTwitter({ store, chrome }: ListenerDependencies): void {
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
export function clickPost({ store, chrome }: ListenerDependencies): void {
  store.on('clickPost', state => {
    const targetId = ensureActiveFeedbackTarget(state).id

    function ready(state: StoreState): boolean {
      const target = targetById(state, targetId)
      if (state.alert || !target) return true
      const imagesReady = !target.feedbackState.addingImages
      const twitterHandleReady = target.feedbackState.twitterHandle.status === 'DONE'
      return imagesReady && twitterHandleReady
    }

    whenState(store, ready, 5000)
      .then(state => {
        const target = targetById(state, targetId)
        if (!state.alert && target) {
          postTweet(target, chrome, store.dispatchers)
        }
      })
      .catch(error => {
        if (error.message === 'timeout') {
          store.dispatchers.postTweetFailure({ targetId, failure: { reason: 'timeout' } })
        }
      })
  })
}
