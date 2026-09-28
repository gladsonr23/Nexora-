import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const load = name => readFile(new URL(`../dist/${name}`, import.meta.url), 'utf8');

test('session RAG client is loaded and indexes only current-session materials',async () => {
  const [index,client,app]=await Promise.all([load('index.html'),load('rag-client.js'),load('app.js')]);
  assert.match(index,/rag-client\.js/);
  assert.match(client,/item\.sessionId===sessionId/);
  assert.match(client,/\/api\/rag\/index-file/);
  assert.match(client,/\/api\/rag\/reconcile/);
  assert.match(client,/\/api\/rag\/status/);
  assert.match(app,/id="nx-rag-sync"/);
  assert.match(app,/nexora:open-rag-citation/);
});

test('both assistant surfaces share the same session-scoped chat',async () => {
  const avatar=await load('avatar.js');
  assert.match(avatar,/`nexora-rag-chat-\$\{sessionId\}`/);
  assert.match(avatar,/window\.NexoraRag\?\.sync/);
  assert.match(avatar,/\/api\/rag\/chat/);
  assert.match(avatar,/result\.citations/);
});

test('assistant avoids a full session sync for every message and routes tool shortcuts',async () => {
  const [client,avatar]=await Promise.all([load('rag-client.js'),load('avatar.js')]);
  assert.match(client,/ensureReady/);
  assert.match(avatar,/NexoraRag\?\.ensureReady/);
  assert.match(avatar,/target:'#quiz'/);
  assert.match(avatar,/target:'#pattern'/);
});
