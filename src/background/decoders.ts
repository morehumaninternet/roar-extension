import { JsonDecoder } from 'ts.data.json'

export const FeedbackResponseDataDecoder = JsonDecoder.object<FeedbackResponseData>({ url: JsonDecoder.string }, 'FeedbackResponseData')

export const WebsiteNonDefaultTwitterHandleDecoder = JsonDecoder.object<WebsiteNonDefaultTwitterHandle>(
  {
    subdomain: JsonDecoder.nullable(JsonDecoder.string),
    path: JsonDecoder.nullable(JsonDecoder.string),
    twitter_handle: JsonDecoder.string,
  },
  'WebsiteNonDefaultTwitterHandle'
)

export const UserDecoder = JsonDecoder.object<User>({ photoUrl: JsonDecoder.nullable(JsonDecoder.string) }, 'User')

export const NonDefaultTwitterHandlesDecoder = JsonDecoder.array(WebsiteNonDefaultTwitterHandleDecoder, 'non_default_twitter_handles')

export const WebsiteDecoder = JsonDecoder.object<Website>(
  {
    domain: JsonDecoder.string,
    twitter_handle: JsonDecoder.nullable(JsonDecoder.string),
    non_default_twitter_handles: NonDefaultTwitterHandlesDecoder,
  },
  'Website'
)

// Same as Website, but twitter_handle not optional
export const HandleCacheEntryDecoder = JsonDecoder.object<HandleCacheEntry>(
  {
    domain: JsonDecoder.string,
    twitter_handle: JsonDecoder.string,
    non_default_twitter_handles: NonDefaultTwitterHandlesDecoder,
  },
  'HandleCacheEntry'
)

export const HandleCacheDecoder = JsonDecoder.array(HandleCacheEntryDecoder, 'HandleCache')
