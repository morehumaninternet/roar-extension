#! /usr/bin/env node
const { assert } = require('chai')
const { IncomingWebhook } = require('@slack/webhook')

// Read a url from the environment variables
const {
  SLACK_ENGINEERING_CHANNEL_WEBHOOK_URL,
  git_branch,
  git_hash,
  artifact_name,
} = process.env
assert.ok(SLACK_ENGINEERING_CHANNEL_WEBHOOK_URL)
assert.ok(git_branch)
assert.ok(git_hash)
assert.ok(artifact_name)

// Initialize
const webhook = new IncomingWebhook(url)

(async () => {
  await webhook.send({
    text: 'foo',
    attachments: [{}]
  })
})()

// text?: string
// link_names?: boolean
// agent?: Agent
// attachments?: MessageAttachment[]
// blocks?: (KnownBlock | Block)[]
// unfurl_links?: boolean
// unfurl_media?: boolean