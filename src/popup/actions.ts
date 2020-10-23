import { Dispatch } from 'redux'

export function actions(dispatch: Dispatch<UserAction>, getState: () => AppState): DispatchUserActions {
  return {
    popupConnect() {
      return dispatch({ type: 'POPUP_CONNECT' })
    },
    popupDisconnect() {
      return dispatch({ type: 'POPUP_DISCONNECT' })
    },
    dismissAlert() {
      return dispatch({ type: 'DISMISS_ALERT' })
    }
  }
}
