import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const load = name => readFile(new URL(`../dist/${name}`, import.meta.url), 'utf8');

test('Pattern Detector page is registered and exposes scanned-paper OCR upload', async () => {
  const [index, pattern] = await Promise.all([load('index.html'), load('pattern.js')]);
  assert.match(index, /\.\/pattern\.js/);
  assert.match(pattern, /NexoraRegisterPage\('pattern'/);
  assert.match(pattern, /id="nx-pattern-file"[^>]*multiple/);
  assert.match(pattern, /Scanned PDF pages are read with OCR automatically/);
  assert.doesNotMatch(pattern, /id="nx-pattern-review"/);
  assert.match(pattern, /fetch\(`?\/api\/pattern\/extract/);
});

test('Pattern Detector connects OCR, analysis, and topic refinement endpoints', async () => {
  const [server, pattern] = await Promise.all([readFile(new URL('./index.js', import.meta.url), 'utf8'), load('pattern.js')]);
  assert.match(server, /url\.pathname === '\/api\/pattern\/extract'/);
  assert.match(server, /url\.pathname === '\/api\/pattern\/analyze'/);
  assert.match(server, /url\.pathname === '\/api\/pattern\/topics'/);
  assert.match(pattern, /\/api\/pattern\/extract/);
  assert.match(pattern, /\/api\/pattern\/analyze/);
  assert.match(pattern, /\/api\/pattern\/topics/);
});

test('Pattern Detector saves question papers and analysis reports to the Vault', async () => {
  const [pattern, index, pdf] = await Promise.all([load('pattern.js'), load('index.html'), load('pdf.js')]);
  assert.match(pattern, /NexoraVaultFileStore/);
  assert.match(pattern, /Save report to Vault/);
  assert.match(pattern, /Download PDF/);
  assert.match(pattern, /createPatternReportPdf/);
  assert.match(pattern, /nexora-vault-pattern-reports/);
  assert.match(index, /\.\/pdf\.js/);
  assert.match(pattern, /id="nx-pattern-vault-open"/);
  assert.match(pattern, /id="nx-pattern-vault-picker"/);
  assert.match(pattern, /Add selected from Vault/);
});

test('Pattern Detector keeps working papers session-scoped and supports accumulated uploads', async () => {
  const pattern = await load('pattern.js');
  assert.match(pattern, /sessionStorage\.setItem\('nexora-pattern-papers'/);
  assert.match(pattern, /pendingFiles/);
  assert.match(pattern, /sortPapersByYear/);
  assert.match(pattern, /multiple/);
});

test('topic share chart colors every detected topic without an other-topics bucket', async () => {
  const [pattern, pdf] = await Promise.all([load('pattern.js'), load('pdf.js')]);
  assert.match(pattern, /const slices = ranked/);
  assert.doesNotMatch(pattern, /Other topics/);
  assert.match(pdf, /All \$\{slices\.length\} topics are colored in the wheel/);
  assert.doesNotMatch(pdf, /Other topics/);
});
