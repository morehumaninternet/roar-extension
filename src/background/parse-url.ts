import { parseDomain } from 'parse-domain'

// Add `https://` as the protocol if none exists. =
export const massageUrlString = (urlString: string): string => {
  const hasProtocol = urlString.startsWith('https://') || urlString.startsWith('http://')
  const withProtocol = hasProtocol ? urlString : `https://${urlString}`
  const withoutWww = withProtocol.replace(/^(https?:\/\/)www\.(.*)$/, '$1$2')
  return withoutWww
}

export const urlOf = (urlString: string): null | URL => {
  try {
    return new URL(massageUrlString(urlString))
  } catch {
    return null
  }
}

export const foo = (urlString?: string): ParseUrlResult => {
  const url = urlString && urlOf(urlString)

  if (!url) {
    return {
      success: false,
      reason: 'Not a url',
    }
  }

  const parsed = parseDomain(url.hostname)

  if (parsed.type === 'INVALID') {
    return {
      success: false,
      reason: parsed.errors[0].message,
    }
  } else if (parsed.type !== 'LISTED') {
    return {
      success: false,
      reason: 'Must specify a listed hostname',
    }
  }

  const tld = parsed.topLevelDomains.join('.')

  const host = url.host
  const subdomain = parsed.subDomains.length ? parsed.subDomains.join('.') : undefined
  const hostWithoutSubDomain = `${parsed.domain}.${tld}`

  const [, firstPath] = url.pathname.split('/')
  const fullWithFirstPath = firstPath ? `${host}/${firstPath}` : host
  return { success: true, host, hostWithoutSubDomain, subdomain, fullWithFirstPath, firstPath: firstPath || undefined }
}

export function parseUrl(urlString?: string): ParseUrlResult {
  const res = foo(urlString)
  console.log('parseUrl', urlString, res)
  return res
}

export const ensureHostname = (urlString?: string): string => {
  const parsed = parseUrl(urlString)
  if (!parsed.success) {
    throw new Error(parsed.reason)
  }
  return parsed.host
}
