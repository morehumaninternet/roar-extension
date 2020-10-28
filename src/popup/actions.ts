import { Dispatch } from 'redux'

export function actions(dispatch: Dispatch<UserAction>, getState: () => AppState): DispatchUserActions {
  return {
    popupConnect() {
      return dispatch({ type: 'POPUP_CONNECT' })
    },
    popupDisconnect() {
      return dispatch({ type: 'POPUP_DISCONNECT' })
    },
    signInWithTwitter() {
      return dispatch({ type: 'SIGN_IN_WITH_TWITTER' })
    },
    authenticatedViaTwitter() {
      return dispatch({ type: 'AUTHENTICATED_VIA_TWITTER' })
    },
    dismissAlert() {
      return dispatch({ type: 'DISMISS_ALERT' })
    }
  }
}
