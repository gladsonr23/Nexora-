import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('Vercel bundles the runtime files needed to read selectable and scanned PDFs', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const includeFiles = config.functions?.['server.js']?.includeFiles || '';
  const required = [
    'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs',
    'node_modules/pdfjs-dist/wasm/**',
    'node_modules/pdfjs-dist/standard_fonts/**',
    'node_modules/@tesseract.js-data/eng/**'
  ];
  for (const resource of required) {
    assert.match(includeFiles, new RegExp(resource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Missing deployment resource: ${resource}`);
  }
});

test('server PDF parsing explicitly registers the PDF.js worker export', async () => {
  const bridge = await readFile(new URL('./pdfjs.js', import.meta.url), 'utf8');
  const pattern = await readFile(new URL('./pattern.js', import.meta.url), 'utf8');
  const ocr = await readFile(new URL('./pattern-ocr.js', import.meta.url), 'utf8');

  assert.match(bridge, /import \* as pdfjsWorker from ['"]pdfjs-dist\/legacy\/build\/pdf\.worker\.mjs['"]/);
  assert.match(bridge, /globalThis\.pdfjsWorker\s*=\s*pdfjsWorker/);
  assert.match(pattern, /from ['"]\.\/pdfjs\.js['"]/);
  assert.match(ocr, /from ['"]\.\/pdfjs\.js['"]/);
});
