import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { randomUUID } from 'node:crypto';

const readDist = name => readFile(new URL(`../dist/${name}`, import.meta.url), 'utf8');

function createIndexedDbHarness() {
  const records = new Map();
  const makeRequest = result => ({ result, onsuccess: null, onerror: null });
  const objectStore = {
    put(record) {
      const request = makeRequest(undefined);
      queueMicrotask(() => { records.set(record.id, structuredClone(record)); request.onsuccess?.(); });
      return request;
    },
    get(id) {
      const request = makeRequest(undefined);
      queueMicrotask(() => { request.result = structuredClone(records.get(id)); request.onsuccess?.(); });
      return request;
    },
    getAll() {
      const request = makeRequest(undefined);
      queueMicrotask(() => { request.result = [...records.values()].map(record => structuredClone(record)); request.onsuccess?.(); });
      return request;
    },
    delete(id) {
      const request = makeRequest(undefined);
      queueMicrotask(() => { records.delete(id); request.onsuccess?.(); });
      return request;
    }
  };
  return {
    records,
    indexedDB: {
      open() {
        const request = { result: null, onupgradeneeded: null, onsuccess: null, onerror: null };
        const db = {
          objectStoreNames: { contains: () => true },
          createObjectStore: () => objectStore,
          transaction: () => ({
            objectStore: () => objectStore,
            oncomplete: null,
            onerror: null
          }),
          close() {}
        };
        request.result = db;
        queueMicrotask(() => {
          request.onupgradeneeded?.();
          request.onsuccess?.();
        });
        return request;
      }
    }
  };
}

test('Vault keeps uploaded PDFs in browser storage and supports metadata edits and deletion', async () => {
  const source = await readDist('vault-files.js');
  const harness = createIndexedDbHarness();
  const events = [];
  const context = {
    indexedDB: harness.indexedDB,
    crypto: { randomUUID },
    Date,
    Event: class Event { constructor(type) { this.type = type; } },
    dispatchEvent: event => events.push(event.type),
    NexoraSession: { id: 'session-local' }
  };
  context.window = context;
  runInNewContext(source, context);

  const [saved] = await context.NexoraVaultFileStore.putMany(
    [{ name: 'lecture.pdf', type: 'application/pdf', size: 4, blob: new Blob(['pdf']) }],
    { subject: 'Operating Systems', category: 'Lecture Slides' }
  );
  assert.equal(saved.name, 'lecture.pdf');
  assert.equal(saved.subject, 'Operating Systems');
  assert.equal(saved.category, 'Lecture Slides');
  assert.equal((await context.NexoraVaultFileStore.get(saved.id)).blob.size, 4);
  assert.equal((await context.NexoraVaultFileStore.list())[0].sessionId, 'session-local');

  await context.NexoraVaultFileStore.updateMetadata(saved.id, { subject: 'OS', category: 'Notes' });
  assert.equal((await context.NexoraVaultFileStore.get(saved.id)).subject, 'OS');
  await context.NexoraVaultFileStore.remove(saved.id);
  assert.equal(await context.NexoraVaultFileStore.get(saved.id), undefined);
  assert.ok(events.includes('nexora:vault-updated'));
});

test('Vault component uses browser storage and the in-app PDF viewer without auth or API calls', async () => {
  const [index, vault, adapter] = await Promise.all([
    readDist('index.html'),
    readDist('modules-vault.js'),
    readDist('nexora-adapters.js')
  ]);
  assert.match(index, /\.\/vault-files\.js/);
  assert.match(index, /\.\/react-pdf-viewer\.js/);
  assert.ok(index.indexOf('vault-files.js') < index.indexOf('modules-vault.js'));
  assert.match(vault, /fileStore\(\)\.putMany/);
  assert.match(vault, /fileStore\(\)\.list/);
  assert.match(vault, /fileStore\(\)\.updateMetadata/);
  assert.match(vault, /fileStore\(\)\.remove/);
  assert.match(vault, /NexoraPdfViewer\.render/);
  assert.doesNotMatch(vault, /NexoraShared|\bapi\s*\(|NexoraAuth|openAuthenticatedFile|\/api\/|supabase|clerk/i);
  assert.doesNotMatch(adapter, /window\.NexoraVaultFileStore\s*=/);
});
