import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const load = (name) => readFile(new URL(`../dist/${name}`, import.meta.url), 'utf8')

test('pattern detector exposes multi-file upload without manual OCR review', async () => {
  const app = await load('app.js')

  assert.match(app, /id="nx-pattern-file"[^>]*multiple/)
  assert.doesNotMatch(app, /id="nx-pattern-review"/)
  assert.match(app, /Tesseract and NVIDIA OCR, then Gemini and Groq cross-check/)
})

test('pattern reports and question banks integrate with the Vault', async () => {
  const [app, pattern, index] = await Promise.all([load('app.js'), load('pattern.js'), load('index.html')])

  assert.match(app, /nexora-vault-pattern-reports/)
  assert.match(app, /nexora-vault-papers/)
  assert.match(app, /Open PDF/)
  assert.match(app, /Add to detector/)
  assert.match(pattern, /Save report to Vault/)
  assert.match(pattern, /Download PDF/)
  assert.match(pattern, /createPatternReportPdf/)
  assert.match(index, /vault-files\.js/)
  assert.match(app, /id="nx-vault-file-input"[^>]*multiple/)
  assert.match(app, /id="nx-vault-upload"/)
  assert.match(pattern, /NexoraVaultFileStore/)
  assert.match(app, /Rename/)
  assert.match(app, /id="nx-rename-dialog"/)
  assert.doesNotMatch(app, /window\.prompt/)
  assert.match(index, /vault-files\.js/)
})

test('pattern detector offers upload and selection from Vault', async () => {
  const [app, pattern] = await Promise.all([load('app.js'), load('pattern.js')])

  assert.match(app, /id="nx-pattern-vault-open"/)
  assert.match(app, /id="nx-pattern-vault-picker"/)
  assert.match(app, /Add selected from Vault/)
  assert.match(pattern, /storeFilesInVault/)
})

test('pattern working papers are session-scoped and uploads accumulate', async () => {
  const pattern = await load('pattern.js')
  assert.match(pattern, /sessionStorage\.setItem\('nexora-pattern-papers'/)
  assert.match(pattern, /pendingFiles/)
  assert.match(pattern, /sortPapersByYear/)
})

test('topic share uses the complete colored wheel without a dominant other-topics slice',async () => {
  const [app,pattern,pdf]=await Promise.all([load('app.js'),load('pattern.js'),load('pdf.js')])
  assert.match(app,/Every detected topic is shown as a colored wheel segment/)
  assert.match(pattern,/const slices = ranked/)
  assert.doesNotMatch(pattern,/Other topics/)
  assert.match(pdf,/All \$\{slices\.length\} topics are colored in the wheel/)
  assert.doesNotMatch(pdf,/Other topics/)
})
