import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const load = name => readFile(new URL(`../dist/${name}`, import.meta.url), 'utf8')

test('avatar customizer is available from the dashboard and AI assistant', async () => {
  const [app, avatar, index] = await Promise.all([
    load('app.js'), load('avatar.js'), load('index.html')
  ])

  assert.match(index, /avatar\.js/)
  assert.match(app, /id="nx-assistant"/)
  assert.match(app, /id="nx-assistant-customize"/)
  assert.match(avatar, /id="nx-avatar-rail"/)
  assert.match(avatar, /Randomize avatar/)
  assert.match(avatar, /Use default/)
  assert.match(avatar, /Companion nickname/)
  assert.match(avatar, /\/api\/avatar\/nickname/)
  assert.match(avatar, /id="nx-companion-chat"/)
  assert.match(avatar, /\/api\/rag\/chat/)
  assert.match(avatar, /nexora:open-rag-citation/)
})

test('avatar preferences stay local while chat uses the session RAG endpoint', async () => {
  const avatar = await load('avatar.js')

  assert.match(avatar, /nexora-avatar-config/)
  assert.match(avatar, /nexora-avatar-onboarded/)
  assert.match(avatar, /nexora-avatar-nickname/)
  assert.match(avatar, /localStorage\.setItem/)
  assert.match(avatar, /NexoraRag/)
  assert.match(avatar, /nexora-rag-chat-/)
})

test('first-time avatar setup is required before chat', async () => {
  const avatar = await load('avatar.js')
  assert.match(avatar, /data-required/)
  assert.match(avatar, /Complete your avatar setup/)
})
