function testBrowser(browser: SupportedBrowser, navigator: typeof window.navigator): null | BrowserInfo {
  const str = navigator.userAgent
  const regex = new RegExp(`${browser}\\/([\\d\\.]+)`)
  const matches = str.match(regex)
  if (!matches || !matches[1]) return null
  const [majorVersionStr] = matches[1].split('.')
  if (!majorVersionStr) return null
  const majorVersion = parseInt(majorVersionStr, 10)
  return majorVersion ? { browser, majorVersion } : null
}

export function detectBrowser(navigator: typeof window.navigator): BrowserInfo {
  const browserInfo = testBrowser('Chrome', navigator) || testBrowser('Firefox', navigator)

  if (!browserInfo) {
    return { browser: 'Chrome', majorVersion: 42 }
    throw new Error('Running the extension on an unsupported browser')
  }

  return browserInfo
}
