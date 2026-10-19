import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('planner and quiz load the browser-local Vault handoff and same-origin API', async () => {
  const [html, shared, schedule, quiz] = await Promise.all([
    read('dist/index.html'), read('dist/modules-shared.js'), read('dist/modules-schedule.js'), read('dist/modules-quiz.js')
  ]);
  assert.match(html, /window\.NEXORA_API_BASE\s*=\s*window\.NEXORA_API_BASE\s*\|\|\s*location\.origin/);
  assert.match(html, /src="\.\/modules-schedule\.js"/);
  assert.match(html, /src="\.\/modules-quiz\.js"/);
  assert.match(shared, /NexoraVaultFileStore/);
  assert.match(shared, /vaultMaterialPayload/);
  assert.match(schedule, /listVaultMaterials\(\)/);
  assert.match(schedule, /vaultMaterialPayload\(materialId\)/);
  assert.match(quiz, /listVaultMaterials\(\)/);
  assert.match(quiz, /vaultMaterialPayload\(materialId\)/);
  assert.doesNotMatch(schedule, /api\('\/api\/materials'\)/);
  assert.doesNotMatch(quiz, /api\('\/api\/materials'\)/);
  assert.doesNotMatch(quiz, /\/api\/quizzes\/\$\{state\.quiz\.quizId\}\/attempt/);
});

test('server registers AI-backed plan and quiz generation routes', async () => {
  const server = await read('server/index.js');
  assert.match(server, /url\.pathname === '\/api\/schedule\/generate'/);
  assert.match(server, /url\.pathname === '\/api\/quizzes\/generate'/);
  assert.match(server, /extractPdfWithOcr\(bytes/);
  assert.match(server, /createStudyPlan\(/);
  assert.match(server, /createQuiz\(/);
});
