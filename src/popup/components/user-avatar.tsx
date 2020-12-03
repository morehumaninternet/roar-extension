import * as React from 'react'

export function UserAvatar({ src, clickLogout }) {
  return (
    <div className="user-avatar">
      <img className="profile-img" src={src} />
      <div className="dropdown-content">
        <button className="logout-btn" onClick={clickLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}
