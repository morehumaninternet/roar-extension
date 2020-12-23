// import { expect } from 'chai'
// import { createMocks } from './mocks'
// import { mountPopup } from './steps/mount-popup'
// import { runBackground } from './steps/run-background'

// describe('welcome on installed', () => {
//   const mocks = createMocks()

//   runBackground(mocks)

//   describe('on installed', () => {
//     it('does nothing when the reason is "update"', () => {
//       const [callback] = mocks.chrome.runtime.onInstalled.addListener.firstCall.args
//       callback({ reason: 'update' })
//       expect(mocks.chrome.tabs.create).to.have.callCount(0)
//       expect(mocks.getState().auth.state).to.equal('not_authed')
//     })

//     it('opens the /welcome page and transitions to an authenticating state when the reason is "install"', () => {
//       const [callback] = mocks.chrome.runtime.onInstalled.addListener.firstCall.args
//       callback({ reason: 'install' })
//       expect(mocks.chrome.tabs.create).to.have.been.calledOnceWithExactly({
//         active: true,
//         url: 'https://test-roar-server.com/welcome',
//       })
//       expect(mocks.getState().auth.state).to.equal('authenticating')
//     })
//   })

//   mountPopup(mocks, { handle: 'exists' })

//   describe('foo', () => {
//     it('is now in a not_authed state', () => {
//       expect(mocks.getState().auth.state).to.equal('not_authed')
//     })

//     it('closes the popup', () => {
//       const [callback] = mocks.chrome.windows.onFocusChanged.addListener.firstCall.args
//       const anotherWindowId = 3
//       callback(anotherWindowId)
//       expect(popupWindowClose).to.have.callCount(1)
//     })
//   })
// })

// describe.only('welcome on installed 2', () => {
//   const mocks = createMocks()

//   runBackground(mocks)

//   describe('on installed', () => {
//     it('does nothing when the reason is "update"', () => {
//       const [callback] = mocks.chrome.runtime.onInstalled.addListener.firstCall.args
//       callback({ reason: 'update' })
//       expect(mocks.chrome.tabs.create).to.have.callCount(0)
//       expect(mocks.getState().auth.state).to.equal('not_authed')
//     })

//     it('opens the /welcome page and transitions to an authenticating state when the reason is "install"', () => {
//       const [callback] = mocks.chrome.runtime.onInstalled.addListener.firstCall.args
//       callback({ reason: 'install' })
//       expect(mocks.chrome.tabs.create).to.have.been.calledOnceWithExactly({
//         active: true,
//         url: 'https://test-roar-server.com/welcome',
//       })
//       expect(mocks.getState().auth.state).to.equal('authenticating')
//     })
//   })

//   mountPopup(mocks, { handle: 'exists' })

//   describe('foo', () => {
//     it('is now in a not_authed state', () => {
//       expect(mocks.getState().auth.state).to.equal('not_authed')
//     })
//   })
// })
