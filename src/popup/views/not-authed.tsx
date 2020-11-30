import * as React from 'react'

export function NotAuthed({ signInWithTwitter }: Pick<Dispatchers<UserAction>, 'signInWithTwitter'>): JSX.Element {
  return (
    <div className="not-authed">
      <img src="/img/roar_128.png" />
      <button onClick={signInWithTwitter}>
        <img src="/img/twitter_logo_blue.svg" />
        Log in with Twitter
      </button>
      <p>
        Built with ❤️ by the team at{' '}
        <a target="_blank" href="https://morehumaninternet.org">
          morehumaninternet.org
        </a>
      </p>
    </div>
  )
}
