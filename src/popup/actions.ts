import { Dispatch } from 'redux'

export function actions(dispatch: Dispatch<UserAction>, getState: () => AppState): DispatchUserActions {
  return {
    popupConnect(): UserAction {
      return dispatch({ type: 'POPUP_CONNECT' })
    },
    popupDisconnect(): UserAction {
      return dispatch({ type: 'POPUP_DISCONNECT' })
    },
    signInWithTwitter(): UserAction {
      return dispatch({ type: 'SIGN_IN_WITH_TWITTER' })
    },
    authenticatedViaTwitter(photoUrl?: string): UserAction {
      return dispatch({ type: 'AUTHENTICATED_VIA_TWITTER', payload: { photoUrl } })
    },
    dismissAlert(): UserAction {
      return dispatch({ type: 'DISMISS_ALERT' })
    },
    updateEditorState(editorState: any): UserAction {
      return dispatch({ type: 'UPDATE_EDITOR_STATE', payload: { editorState } })
    },
    clickPost(): UserAction {
      return dispatch({ type: 'CLICK_POST' })
    },
    togglePickingEmoji(): UserAction {
      return dispatch({ type: 'TOGGLE_PICKING_EMOJI' })
    },
    emojiPicked(emoji: string): UserAction {
      return dispatch({ type: 'EMOJI_PICKED', payload: { emoji } })
    },
    clickTakeScreenshot(): UserAction {
      return dispatch({ type: 'CLICK_TAKE_SCREENSHOT' })
    },
    clickTweet(): UserAction {
      return dispatch({ type: 'CLICK_TWEET' })
    },
  }
}
