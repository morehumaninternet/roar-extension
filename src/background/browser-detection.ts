function testBrowser(browser: SupportedBrowser, navigator: typeof window.navigator): null | BrowserInfo {
  const str = navigator.userAgent
  const regex = new RegExp(`${browser}\\/([\\d\\.]+)`)
  const matches = str.match(regex)
  if (!matches || !matches[1]) return null
  const [versionStr] = matches[1].split('.')
  if (!versionStr) return null
  const version = parseInt(versionStr, 10)
  return version ? { browser, version } : null
}

export function detectBrowser(navigator: typeof window.navigator): BrowserInfo {
  const browserInfo = testBrowser('Chrome', navigator) || testBrowser('Firefox', navigator)

  if (!browserInfo) {
    throw new Error('Running the extension on an unsupported browser')
  }

  return browserInfo
}
