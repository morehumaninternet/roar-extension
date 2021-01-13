import { find } from 'lodash'

type HandleCacheEntry = {
  domain: string
  twitter_handle: string
  non_default_twitter_handles: ReadonlyArray<WebsiteNonDefaultTwitterHandle>
}

// All the Twitter handles are cached under the 'handleCache' key.
function getHandleCache(): Promise<ReadonlyArray<HandleCacheEntry>> {
  return new Promise(resolve => chrome.storage.local.get(result => resolve(result.handleCache || [])))
}

export async function get(
  domain: string
): Promise<null | { twitter_handle: string; non_default_twitter_handles: ReadonlyArray<WebsiteNonDefaultTwitterHandle> }> {
  return null
  // const handleCache = await getHandleCache()
  // const matchingEntry = find(handleCache, { domain })
  // if (matchingEntry) {
  //   return {
  //     twitter_handle: matchingEntry.twitter_handle,
  //     non_default_twitter_handles: matchingEntry.non_default_twitter_handles,
  //   }
  // }
  // return null
}

export async function set(entry: HandleCacheEntry): Promise<void> {
  let previousHandleCache = await getHandleCache() // tslint:disable-line:no-let
  if (previousHandleCache.length >= 50) previousHandleCache = previousHandleCache.slice(1)
  const twitterHandleCache = previousHandleCache.concat([entry])
  chrome.storage.local.set({ handleCache: twitterHandleCache })
}

export async function clear(): Promise<void> {
  chrome.storage.local.set({ handleCache: [] })
}
