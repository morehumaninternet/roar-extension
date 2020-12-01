import { find } from 'lodash'

// All the Twitter handles are cached under the 'handleCache' key.
export function createHandleCache(chrome: typeof global.chrome): TwitterHandleCache {
  function getHandleCache(): Promise<ReadonlyArray<{ domain: string; twitter_handle: string }>> {
    return new Promise(resolve => chrome.storage.local.get(result => resolve(result.handleCache || [])))
  }

  return {
    async get(domain: string): Promise<Maybe<string>> {
      const handleCache = await getHandleCache()
      return find(handleCache, { domain })?.twitter_handle
    },
    async set(domain: string, twitter_handle: string): Promise<void> {
      let previousHandleCache = await getHandleCache() // tslint:disable-line:no-let
      if (previousHandleCache.length >= 50) previousHandleCache = previousHandleCache.slice(1)
      const twitterHandleCache = previousHandleCache.concat([{ domain, twitter_handle }])
      chrome.storage.local.set({ handleCache: twitterHandleCache })
    },
  }
}
