import * as React from 'react'

export function UserAvatar({ src, clickLogout }): JSX.Element {
  return (
    <div>
      <div className="user-avatar">
        <img className="profile-img" src={src} />
        <div className="dropdown-content">
          <div className="caret-up"></div>
          <button className="logout-btn" onClick={clickLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
