import * as React from 'react'

export function UserAvatar({ src }) {
  return (
    <div className="user-avatar">
      <img className="profile-img" src={src} />
      <div className="dropdown">
        <p className="dropdown-content">Logout</p>
      </div>
    </div>
  )
}