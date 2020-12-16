import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'
import { ensureActiveTab, ensureActiveFeedbackTarget } from '../../../selectors'

type PostFeedbackResult = 'success' | 'unauthorized' | '500'

const mockResponse = (result: PostFeedbackResult): fetchMock.MockResponse => {
  switch (result) {
    case 'success':
      return { status: 201, body: { url: 'https://t.co/sometweethash' } }
    case 'unauthorized':
      return { status: 401, body: 'Unauthorized' }
    case '500':
      return { status: 500, body: 'Oh no!' }
  }
}

export function postingFeedback(mocks: Mocks, opts: { result: PostFeedbackResult }): void {
  describe(`post feedback (${opts.result})`, () => {
    before(() => {
      const response = mockResponse(opts.result)
      fetchMock.mock('https://test-roar-server.com/v1/feedback', response)
    })

    it('makes an API request to post feedback upon clicking the post button', async () => {
      const postButton = mocks.app().querySelector('.twitter-interface button.post-btn')! as HTMLButtonElement
      postButton.click()

      expect(mocks.getState().mostRecentAction.type).to.equal('clickPost')
      await mocks.whenState(state => ensureActiveFeedbackTarget(state).feedbackState.isTweeting)

      const [url, opts] = fetchMock.lastCall()!
      expect(url).to.equal('https://test-roar-server.com/v1/feedback')
      expect(opts).to.have.all.keys('method', 'credentials', 'body', 'signal')
      expect(opts).to.have.property('method', 'POST')
      expect(opts).to.have.property('credentials', 'include')

      const body: FormData = opts!.body! as any
      expect(body.get('status')).to.equal('@zing This is some feedback')
      expect(body.get('domain')).to.equal('zing.com')
      const screenshot: any = body.get('images') as any
      expect(screenshot.name.startsWith('zing.com')).to.equal(true)
      expect(screenshot.name.endsWith('.png')).to.equal(true)

      const tweetInProgress = mocks.app().querySelector('.tweet-in-progress')!
      expect(tweetInProgress).to.have.property('innerHTML', 'Tweeting your feedback to @zing')
    })

    if (opts.result === 'success') {
      it('launches a new tab with the tweet upon completion and clears the existing feedback', async () => {
        await mocks.whenState(state => !ensureActiveTab(state).feedbackState.isTweeting)
        expect(mocks.chrome.tabs.create).to.have.been.calledOnceWithExactly({
          url: 'https://t.co/sometweethash',
          active: true,
        })

        const spans = mocks.app().querySelectorAll('.twitter-interface > .DraftEditor-root span[data-text="true"]')
        expect(spans).to.have.length(2)
        expect(spans[0]).to.have.property('innerHTML', '@zing')
        expect(spans[1]).to.have.property('innerHTML', ' ')
      })
    } else if (opts.result === 'unauthorized') {
      it('transitions to an unauthed state with a dismissable alert explaining what happened', async () => {
        const state = await mocks.whenState(state => !ensureActiveTab(state).feedbackState.isTweeting)
        expect(mocks.chrome.tabs.create).to.have.callCount(0)
        expect(state.auth.state).to.equal('not_authed')
        const alertMessage = mocks.app().querySelector('.alert .alert-message')! as HTMLDivElement
        expect(alertMessage.innerHTML).to.equal('Your session ended. Please log in to try again.')
      })
    } else {
      it('stays authenticated and displays an alert', async () => {
        const state = await mocks.whenState(state => !ensureActiveTab(state).feedbackState.isTweeting)
        expect(mocks.chrome.tabs.create).to.have.callCount(0)
        expect(state.auth.state).to.equal('authenticated')
        const alertMessage = mocks.app().querySelector('.alert-message')?.innerHTML
        expect(alertMessage).to.include('We encountered a problem on our end. Please try again later.')
      })
    }
  })
}
