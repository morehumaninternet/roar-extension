import { AppStore } from './store'
import { ensureActiveTab, tabById } from '../selectors'
import { maxApiRequestMilliseconds } from './settings'
import { onLogin } from '../copy'

type ListenerDependencies = {
  apiHandlers: ApiHandlers
  store: AppStore
  images: Images
  chrome: typeof global.chrome
}

export function createListeners({ apiHandlers, store, images, chrome }: ListenerDependencies): Listeners<Action> {
  return {
    popupConnect: state => {
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
    },
    clickLogout: state => {
      if (state.auth.state === 'not_authed') {
        apiHandlers.makeLogoutRequest()
      }
    },
    clickTakeScreenshot: state => {
      const target = ensureActiveTab(state)
      images.takeScreenshot(target)
    },
    imageUpload: state => {
      const target = ensureActiveTab(state)
      const { file } = state.mostRecentAction.payload
      images.imageUpload(target.id, file)
    },
    onInstall: state => {
      chrome.tabs.create({ url: `${global.ROAR_SERVER_URL}/welcome`, active: true })
    },
    signInWithTwitter: state => {
      chrome.tabs.create({ url: `${global.ROAR_SERVER_URL}/v1/auth/twitter`, active: true })
    },
    // Even if the post button is clicked we may not be ready to tweet yet.
    // We have to wait for any in-flight images to be added and for the twitter
    // handle to have been fetched. While waiting an alert my fire or we may lose
    // the target (perhaps the tab closed). If that happens we say we are ready even
    // though we won't actually post the tweet.
    clickPost: state => {
      const targetId = ensureActiveTab(state).id

      function ready(state: StoreState): boolean {
        const target = tabById(state, targetId)
        if (state.alert || !target) return true
        const imagesReady = !target.feedbackState.addingImages
        const twitterHandleReady = target.feedbackState.twitterHandle.status === 'DONE'
        return imagesReady && twitterHandleReady
      }

      store
        .whenState(ready, maxApiRequestMilliseconds)
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
    },
    // When redirected to the /auth-success page, close the tab and detect whether the user is logged in, launching a notification if so
    authSuccess: ({ mostRecentAction }) => {
      chrome.tabs.remove(mostRecentAction.payload.tabId)
      apiHandlers.detectLogin()
      store
        .whenState(({ auth }) => auth.state !== 'detectLogin', maxApiRequestMilliseconds + 1)
        .then(state => {
          if (state.auth.state === 'authenticated') {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: '/img/roar_128.png',
              ...onLogin,
            })
          }
        })
        .catch(global.CONSOLE_ERROR)
    },
  }
}
