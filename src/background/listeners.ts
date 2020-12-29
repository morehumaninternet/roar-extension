import { AppStore } from './store'
import { whenState } from '../redux-utils'
import { ensureActiveTab, tabById } from '../selectors'
import { maxApiRequestMilliseconds } from './settings'

type ListenerDependencies = {
  apiHandlers: ApiHandlers
  store: AppStore
  images: Images
  createTab: typeof chrome.tabs.create
}

export function popupConnect({ apiHandlers, store, images }: ListenerDependencies): void {
  store.on('popupConnect', state => {
    // We open a separate tab that the user authenticates with. So if they open the popup back up
    // when they're in the authenticating state, we know they're not logged in yet
    if (state.auth.state === 'authenticating') {
      store.dispatchers.detectLoginResult({ ok: false, reason: 'unauthorized', details: 'Opened popup before logging in' })
    }

    const target = ensureActiveTab(state)
    if (target.feedbackState.isTweeting) return

    if (target.feedbackTargetType === 'tab') {
      const tab = target
      if (!tab.domain) return
      // it the handle wasn't fetched before and the tab domain exists,
      // start the fetch process
      if (tab.feedbackState.twitterHandle.status === 'NEW') {
        apiHandlers.fetchTwitterHandle(tab.id, tab.domain)
      }
    }

    // Take an automatic screenshot if we didn't take one before
    if (target.feedbackState.takeAutoSnapshot) {
      images.takeScreenshot(target)
      store.dispatchers.disableAutoSnapshot({ targetId: target.id })
    }
  })
}

export function clickLogout({ apiHandlers, store }: ListenerDependencies): void {
  store.on('clickLogout', state => {
    if (state.auth.state === 'not_authed') {
      apiHandlers.makeLogoutRequest()
    }
  })
}

export function clickTakeScreenshot({ store, images }: ListenerDependencies): void {
  store.on('clickTakeScreenshot', state => {
    const target = ensureActiveTab(state)
    images.takeScreenshot(target)
  })
}

export function imageUpload({ store, images }: ListenerDependencies): void {
  store.on('imageUpload', state => {
    const target = ensureActiveTab(state)
    const { file } = state.mostRecentAction.payload
    images.imageUpload(target.id, file)
  })
}

export function onInstall({ store, createTab }: ListenerDependencies): void {
  store.on('onInstall', state => {
    createTab({ url: `${global.ROAR_SERVER_URL}/welcome`, active: true })
  })
}

export function signInWithTwitter({ store, createTab }: ListenerDependencies): void {
  store.on('signInWithTwitter', state => {
    createTab({ url: `${global.ROAR_SERVER_URL}/v1/auth/twitter`, active: true })
  })
}

// Even if the post button is clicked we may not be ready to tweet yet.
// We have to wait for any in-flight images to be added and for the twitter
// handle to have been fetched. While waiting an alert my fire or we may lose
// the target (perhaps the tab closed). If that happens we say we are ready even
// though we won't actually post the tweet.
export function clickPost({ apiHandlers, store }: ListenerDependencies): void {
  store.on('clickPost', state => {
    const targetId = ensureActiveTab(state).id

    function ready(state: StoreState): boolean {
      const target = tabById(state, targetId)
      if (state.alert || !target) return true
      const imagesReady = !target.feedbackState.addingImages
      const twitterHandleReady = target.feedbackState.twitterHandle.status === 'DONE'
      return imagesReady && twitterHandleReady
    }

    whenState(store, ready, maxApiRequestMilliseconds)
      .then(state => {
        const target = tabById(state, targetId)
        if (!state.alert && target) {
          return apiHandlers.postTweet(target)
        }
      })
      .catch(error => {
        if (error.message === 'timeout') {
          store.dispatchers.postTweetFailure({ targetId, failure: { reason: 'timeout' } })
        }
      })
  })
}
