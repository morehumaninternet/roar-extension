import { expect } from 'chai'
import * as fetchMock from 'fetch-mock'
import { Mocks } from '../mocks'
import { ensureActiveTab } from '../../../selectors'
import { getPlainText } from '../../../draft-js-utils'

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

export function postingFeedback(mocks: Mocks, opts: { handle: string; result: PostFeedbackResult }): void {
  describe(`post feedback (${opts.result})`, () => {
    let priorChromeTabsCreateCallCount: number // tslint:disable-line:no-let

    before(() => {
      priorChromeTabsCreateCallCount = mocks.chrome.tabs.create.callCount
      const response = mockResponse(opts.result)
      fetchMock.mock('https://test-roar-server.com/v1/feedback', response)
    })

    it('makes an API request to post feedback upon clicking the post button', async () => {
      const postButton = mocks.app().querySelector('.twitter-interface button.post-btn')! as HTMLButtonElement
      postButton.click()

      expect(mocks.getState().mostRecentAction.type).to.equal('clickPost')
      await mocks.whenState(state => ensureActiveTab(state).feedbackState.isTweeting)

      const [url, initOpts] = fetchMock.lastCall()!
      expect(url).to.equal('https://test-roar-server.com/v1/feedback')
      expect(initOpts).to.have.all.keys('method', 'credentials', 'body', 'signal')
      expect(initOpts).to.have.property('method', 'POST')
      expect(initOpts).to.have.property('credentials', 'include')

      const body: FormData = initOpts!.body! as any
      expect(body.get('status')).to.equal(`${opts.handle} This is some feedback`)
      expect(body.get('domain')).to.equal('zing.com')
      const screenshot: any = body.get('images') as any
      expect(screenshot.name.startsWith('zing.com')).to.equal(true)
      expect(screenshot.name.endsWith('.png')).to.equal(true)

      const disabledPostButton = mocks.app().querySelector('.post-btn')!
      expect(disabledPostButton).to.have.property('innerHTML', 'Posting...')
      expect(disabledPostButton).to.have.property('disabled', true)
    })

    if (opts.result === 'success') {
      it('creates a new tab with the tweet upon completion and clears the existing feedback', async () => {
        const state = await mocks.whenState(state => !ensureActiveTab(state).feedbackState.isTweeting)
        expect(mocks.chrome.tabs.create).to.have.callCount(1 + priorChromeTabsCreateCallCount)
        expect(mocks.chrome.tabs.create.lastCall.args).to.eql([
          {
            url: 'https://t.co/sometweethash',
            active: true,
          },
        ])
        const activeTab = ensureActiveTab(state)
        expect(getPlainText(activeTab.feedbackState.editorState)).to.equal(`${activeTab.feedbackState.twitterHandle.handle} `)
      })
    } else if (opts.result === 'unauthorized') {
      it('transitions to an unauthed state with a dismissable alert explaining what happened', async () => {
        const state = await mocks.whenState(state => !ensureActiveTab(state).feedbackState.isTweeting)
        expect(mocks.chrome.tabs.create).to.have.callCount(priorChromeTabsCreateCallCount)
        expect(state.auth.state).to.equal('not_authed')
        const alertMessage = mocks.app().querySelector('.alert .alert-message')! as HTMLDivElement
        expect(alertMessage.innerHTML).to.include('Your session ended. Please log in to try again.')
      })
    } else {
      it('stays authenticated and displays an alert', async () => {
        const state = await mocks.whenState(state => !ensureActiveTab(state).feedbackState.isTweeting)
        expect(mocks.chrome.tabs.create).to.have.callCount(priorChromeTabsCreateCallCount)
        expect(state.auth.state).to.equal('authenticated')
        const alertMessage = mocks.app().querySelector('.alert-message')?.innerHTML
        expect(alertMessage).to.include('We encountered a problem on our end. Please try again later.')
      })
    }
  })
}
