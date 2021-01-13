import { sortBy } from 'lodash'

export default function findMatchingHandle(parsedUrl: ParseUrlSuccess, website: Website): Maybe<{ handle: string; matchingDomain: string }> {
  if (website.non_default_twitter_handles?.length && (parsedUrl.subdomain || parsedUrl.firstPath)) {
    const nonDefaultHandles = sortBy(website.non_default_twitter_handles, ({ subdomain, path }) => [subdomain, path]).reverse()

    const matchingHandle = nonDefaultHandles.find(({ subdomain, path }) => {
      const subdomainMatch = !subdomain || parsedUrl.subdomain === subdomain
      const pathMatch = !path || parsedUrl.firstPath === path
      return subdomainMatch && pathMatch
    })

    if (matchingHandle) {
      const subdomain = matchingHandle.subdomain ? `${matchingHandle.subdomain}.` : ''
      const path = matchingHandle.path ? `/${matchingHandle.path}` : ''

      return {
        handle: matchingHandle.twitter_handle,
        matchingDomain: `${subdomain}${website.domain}${path}`,
      }
    }
  }

  if (website.twitter_handle) {
    return {
      handle: website.twitter_handle,
      matchingDomain: website.domain,
    }
  }
}
