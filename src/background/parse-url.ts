import { parseDomain } from 'parse-domain'

export const massageUrlString = (urlString: string): string => {
  const withoutWww = urlString.replace(/^(https?:\/\/)www\.(.*)$/, '$1$2')
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
  if (!urlString) return null
  if (!urlString.startsWith('http')) return null

  const url = urlOf(urlString)

  if (!url) return null

  const parsed = parseDomain(url.hostname)

  if (parsed.type !== 'LISTED') return null

  const tld = parsed.topLevelDomains.join('.')

  const host = url.host
  const subdomain = parsed.subDomains.length ? parsed.subDomains.join('.') : undefined
  const hostWithoutSubdomain = `${parsed.domain}.${tld}`

  const [, firstPath] = url.pathname.split('/')
  const fullWithFirstPath = firstPath ? `${host}/${firstPath}` : host
  return { host, hostWithoutSubdomain, subdomain, fullWithFirstPath, firstPath: firstPath || undefined, fullWithoutQuery: `${host}${url.pathname}` }
}
