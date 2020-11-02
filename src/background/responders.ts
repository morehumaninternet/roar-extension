import { omit } from 'lodash'
import { EditorState, Modifier } from 'draft-js'

export const responders: { [T in Action['type']]: Responder<T> } = {
  POPUP_CONNECT() {
    return { popup: { connected: true, activeTab: null } }
  },
  POPUP_DISCONNECT() {
    return { popup: { connected: false }, alert: null } // closing the popup dismisses any alert
  },
  SIGN_IN_WITH_TWITTER() {
    return { twitterAuth: 'authenticating' }
  },
  AUTHENTICATED_VIA_TWITTER() {
    return { twitterAuth: 'authenticated' }
  },
  DISMISS_ALERT() {
    return { alert: null }
  },
  EMOJI_PICKED(state, action) {
    console.log(action.payload.emoji)
    if (!state.popup.connected || !state.popup.activeTab) {
      throw new Error('Posting a tweet without an active tab is not possible')
    }
    const tabId = state.popup.activeTab.id!
    const { emoji } = action.payload
    const feedback = state.feedbackByTabId[tabId]
    if (!feedback) throw new Error('Feedback should exist at this point')

    const editorState: EditorState = feedback.editorState
    const nextContentState = Modifier.insertText(editorState.getCurrentContent(), editorState.getSelection(), emoji)
    const nextEditorState = EditorState.createWithContent(nextContentState)

    const nextFeedback = {
      screenshots: feedback.screenshots,
      editorState: nextEditorState
    }
    return {
      feedbackByTabId: {
        ...state.feedbackByTabId,
        [tabId]: nextFeedback
      }
    }
  },
  UPDATE_EDITOR_STATE(state, action) {
    if (!state.popup.connected || !state.popup.activeTab) {
      throw new Error('Posting a tweet without an active tab is not possible')
    }
    const tabId = state.popup.activeTab.id!
    const { editorState } = action.payload
    const feedback = state.feedbackByTabId[tabId]
    if (!feedback) throw new Error('Feedback should exist at this point')

    const nextFeedback = {
      screenshots: feedback.screenshots,
      editorState
    }
    return {
      feedbackByTabId: {
        ...state.feedbackByTabId,
        [tabId]: nextFeedback
      }
    }
  },
  CLICK_TAKE_SCREENSHOT() {
    return {}
  },
  CLICK_POST(state) {
    if (!state.popup.connected || !state.popup.activeTab) {
      throw new Error('Posting a tweet without an active tab is not possible')
    }
    const tabId = state.popup.activeTab.id!
    return {
      toBeTweeted: {
        feedbackState: state.feedbackByTabId[tabId],
        tabId
      }
    }
  },
  ACTIVE_TAB_DETECTED(state, action) {
    if (!state.popup.connected) return state
    return {
      popup: {
        connected: true,
        activeTab: action.payload.activeTab,
        disabledForTab: action.payload.disabledForTab
      }
    }
  },
  NO_ACTIVE_TAB_DETECTED() {
    return { alert: 'Could not connect with the active tab. Please retry.' }
  },
  SCREENSHOT_CAPTURE_SUCCESS(state, action) {
    const { screenshot } = action.payload
    const tabId = screenshot.tab.id!
    const feedback = state.feedbackByTabId[tabId] || {
      screenshots: [],
      editorState: EditorState.createEmpty()
    }
    const nextFeedback = {
      screenshots: feedback.screenshots.concat([screenshot]),
      editorState: feedback.editorState
    }
    return {
      feedbackByTabId: {
        ...state.feedbackByTabId,
        [tabId]: nextFeedback
      }
    }
  },
  SCREENSHOT_CAPTURE_FAILURE() {
    return { alert: 'SCREENSHOT FAILURE' }
  },
  TAB_CLOSED(state, action) {
    const { tabId } = action.payload
    return {
      feedbackByTabId: omit(state.feedbackByTabId, tabId)
    }
  },
  POST_TWEET_SUCCESS(_state, action) {
    const { url } = action.payload.tweetResult
    return {
      toBeTweeted: null,
      justTweeted: { url }
    }
  },
  POST_TWEET_FAILURE() {
    return {
      toBeTweeted: null,
      justTweeted: null,
      alert: 'POST TWEET FAILURE'
    }
  }
}
