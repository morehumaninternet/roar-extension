import * as React from 'react'

export function UserAvatar({ src, clickLogoff }) {
  return (
    <div className="user-avatar">
      <img className="profile-img" src={src} />
      <div className="dropdown-content">
        <button onClick={clickLogoff}>Logout</button>
      </div>
    </div>
  )
}
