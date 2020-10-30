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
    authenticatedViaTwitter(cookie: string): UserAction {
      return dispatch({ type: 'AUTHENTICATED_VIA_TWITTER', payload: { cookie } })
    },
    dismissAlert(): UserAction {
      return dispatch({ type: 'DISMISS_ALERT' })
    },
    updateEditorState(editorState: any): UserAction {
      return dispatch({ type: 'UPDATE_EDITOR_STATE', payload: { editorState } })
    },
    clickPost(): UserAction {
      return dispatch({ type: 'CLICK_POST' })
    }
  }
}
