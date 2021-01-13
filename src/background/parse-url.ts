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

export const parseUrl = (urlString?: string): ParseUrlResult => {
  const url = urlString && urlOf(urlString)

  if (!url) return null

  const parsed = parseDomain(url.hostname)

  if (parsed.type !== 'LISTED') return null

  const tld = parsed.topLevelDomains.join('.')

  const host = url.host
  const subdomain = parsed.subDomains.length ? parsed.subDomains.join('.') : undefined
  const hostWithoutSubDomain = `${parsed.domain}.${tld}`

  const [, firstPath] = url.pathname.split('/')
  const fullWithFirstPath = firstPath ? `${host}/${firstPath}` : host
  return { host, hostWithoutSubDomain, subdomain, fullWithFirstPath, firstPath: firstPath || undefined, fullWithoutQuery: `${host}${url.pathname}` }
}

export const hostname = (urlString?: string): undefined | string => {
  const parsed = parseUrl(urlString)
  return parsed?.host
}

export const ensureHostname = (urlString?: string): string => {
  const parsed = parseUrl(urlString)
  if (!parsed) {
    throw new Error(`Expected to be able to parse ${urlString}`)
  }
  return parsed.host
}
