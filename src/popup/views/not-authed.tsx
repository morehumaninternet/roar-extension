import * as React from 'react'

export function NotAuthed({ signInWithTwitter }: Pick<Dispatchers<UserAction>, 'signInWithTwitter'>): JSX.Element {
  return (
    <div className="not-authed">
      <img src="../../../img/roar_128.png" width="128px" height="128px" />
      <button onClick={signInWithTwitter}>
        <img src="../../../img/twitter_logo_blue.png" width="32px" height="32px" />
        Log in with Twitter
      </button>
      <p>
        Built with ❤️ by the team at <a href="<button onClick={signInWithTwitter}>Sign in with twitter</button>">morehumaninternet.org</a>
      </p>
    </div>
  )
}
