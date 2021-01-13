import { expect } from 'chai'
import { createMocks } from './mocks'
import { runBackground } from './steps/run-background'

describe('monitorChrome', () => {
  const mocks = createMocks()

  runBackground(mocks, { alreadyAuthenticated: true })

  describe('chrome.tabs.onCreated', () => {
    it("adds the newly created tab to the store's state", () => {
      expect(mocks.chrome.tabs.onCreated.addListener).to.have.callCount(1)
      const [callback] = mocks.chrome.tabs.onCreated.addListener.firstCall.args
      callback({
        id: 18,
        windowId: 1,
        active: false,
        url: 'https://www.new.com/abc/def',
      })
      const state = mocks.getState()
      const tab = state.tabs.get(18)!
      expect(tab.id).to.equal(18)
      expect(tab.windowId).to.equal(1)
      expect(tab.parsedUrl).to.eql({
        host: 'new.com',
        hostWithoutSubdomain: 'new.com',
        subdomain: undefined,
        firstPath: 'abc',
        fullWithFirstPath: 'new.com/abc',
        fullWithoutQuery: 'new.com/abc/def',
      })
    })
  })

  describe('chrome.tabs.onRemoved', () => {
    it("removes a tab from the store's state", () => {
      const [callback] = mocks.chrome.tabs.onRemoved.addListener.firstCall.args
      const toRemoveId = 11
      callback(toRemoveId)
      expect(mocks.getState().tabs.get(toRemoveId)).to.equal(undefined)
    })
  })

  describe('chrome.tabs.onUpdated', () => {
    it("updates the appropriate tab change to store's state", () => {
      const [callback] = mocks.chrome.tabs.onUpdated.addListener.firstCall.args

      const changeInfo = {
        id: 16,
        url: 'https://foo.changeinfo.com/abc/def',
      }

      callback(changeInfo.id, changeInfo)

      const state = mocks.getState()
      const tab = state.tabs.get(changeInfo.id)!

      expect(tab.id).to.equal(changeInfo.id)
      expect(tab.parsedUrl).to.eql({
        host: 'foo.changeinfo.com',
        hostWithoutSubdomain: 'changeinfo.com',
        subdomain: 'foo',
        firstPath: 'abc',
        fullWithFirstPath: 'foo.changeinfo.com/abc',
        fullWithoutQuery: 'foo.changeinfo.com/abc/def',
      })
    })
  })

  describe('chrome.tabs.onAttached', () => {
    it("attaches a tab to another window and updates the store's state", () => {
      const [callback] = mocks.chrome.tabs.onAttached.addListener.firstCall.args

      const attachInfo = {
        id: 15,
        windowId: 2,
        newWindowId: 3,
      }

      callback(attachInfo.id, attachInfo)

      const state = mocks.getState()
      const tab = state.tabs.get(attachInfo.id)!

      expect(tab.id).to.equal(attachInfo.id)
      expect(tab.windowId).to.equal(attachInfo.newWindowId)
    })
  })

  describe('chrome.tabs.onActivated', () => {
    it('sets the specified tab as active for a given window and sets any other tabs of that window to be inactive', () => {
      const [callback] = mocks.chrome.tabs.onActivated.addListener.firstCall.args
      const activeInfo: chrome.tabs.TabActiveInfo = { tabId: 13, windowId: 1 }
      callback(activeInfo)

      const { tabs } = mocks.getState()
      expect(tabs.get(13)).to.have.property('active', true)
      expect(tabs.get(12)).to.have.property('active', false)
    })

    it('has no effect for active tabs of other windows', () => {
      const { tabs } = mocks.getState()
      expect(tabs.get(17)).to.have.property('active', true)
    })
  })

  describe('chrome.tabs.onReplaced', () => {
    it("replaces a tab (create and remove) and updates store's state", () => {
      const existingTab = mocks.getState().tabs.get(18)!
      const newTabId = 11

      const [callback] = mocks.chrome.tabs.onReplaced.addListener.firstCall.args
      callback(newTabId, existingTab.id)

      const { tabs } = mocks.getState()

      expect(tabs.get(existingTab.id)).to.equal(undefined)
      expect(tabs.get(newTabId)).to.have.property('id', newTabId)
      expect(tabs.get(newTabId)).to.have.property('windowId', existingTab.windowId)
      expect(tabs.get(newTabId)).to.have.property('active', existingTab.active)
      expect(tabs.get(newTabId)).to.have.property('parsedUrl').that.eql(existingTab.parsedUrl)
    })
  })

  describe('chrome.windows.onCreated', () => {
    it("adds a newly created window to store's state", () => {
      const [callback] = mocks.chrome.windows.onCreated.addListener.firstCall.args
      const win = { id: 4, focused: true }
      callback(win)
      const state = mocks.getState()
      expect(state.focusedWindowId).to.eql(win.id)
    })
  })

  describe('chrome.windows.onRemoved', () => {
    it("deletes a removed window from store's state", () => {
      const [callback] = mocks.chrome.windows.onRemoved.addListener.firstCall.args
      const removedWindow = { id: 4, focused: true }
      callback(removedWindow.id)

      const state = mocks.getState()
      expect(state.focusedWindowId).not.eql(removedWindow.id)
    })
  })

  describe('chrome.windows.onFocusChanged', () => {
    it("changes windows focus status in store's state", () => {
      const [callback] = mocks.chrome.windows.onFocusChanged.addListener.firstCall.args
      const changedWindow = { id: 3, focused: true }
      callback(changedWindow.id)

      const state = mocks.getState()
      expect(state.focusedWindowId).to.equal(changedWindow.id)
    })
  })
})
