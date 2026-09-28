import assert from 'node:assert/strict';
import test from 'node:test';
import { answerFromSession, reconcileSessionMaterials, removeRagSession, renameSessionMaterial, retrieveSessionChunks, sessionStatus, upsertSessionMaterial } from './rag.js';

const first='session-a1234567';
const second='session-b1234567';

test('RAG retrieval is isolated to the active session and preserves citations',async () => {
  removeRagSession(first); removeRagSession(second);
  upsertSessionMaterial(first,{id:'os-pdf',name:'Operating Systems.pdf',type:'file',pages:[{page:12,text:'Round robin scheduling assigns each ready process a fixed time quantum in cyclic order.'}]});
  upsertSessionMaterial(second,{id:'db-pdf',name:'Database Systems.pdf',type:'file',pages:[{page:4,text:'Database normalization reduces update anomalies by decomposing relations.'}]});
  const hits=retrieveSessionChunks(first,'What does round robin scheduling assign?');
  assert.equal(hits[0].name,'Operating Systems.pdf');
  assert.equal(hits.some(hit=>hit.name==='Database Systems.pdf'),false);
  const result=await answerFromSession({sessionId:first,question:'Explain round robin scheduling.'},{fetchImpl:async()=>{throw new Error('offline')}});
  assert.match(result.answer,/time quantum/i);
  assert.deepEqual(result.citations.map(item=>[item.filename,item.page]),[['Operating Systems.pdf',12]]);
});

test('RAG returns a grounded refusal when the session has no matching passage',async () => {
  const result=await answerFromSession({sessionId:first,question:'What is photosynthesis?'},{});
  assert.match(result.answer,/could not find enough information/i);
  assert.deepEqual(result.citations,[]);
});

test('session material upserts replace old chunks without affecting other sessions',() => {
  upsertSessionMaterial(first,{id:'os-pdf',name:'Operating Systems.pdf',type:'file',pages:[{page:20,text:'A semaphore is a synchronization primitive used to coordinate concurrent processes.'}]});
  assert.equal(sessionStatus(first).materialCount,1);
  assert.match(retrieveSessionChunks(first,'semaphore synchronization')[0].text,/semaphore/i);
  assert.equal(sessionStatus(second).materialCount,1);
});

test('renaming a Vault item updates RAG citations without re-indexing its text',async () => {
  assert.equal(renameSessionMaterial(first,'os-pdf','CPU Scheduling Notes'),true);
  const result=await answerFromSession({sessionId:first,question:'What is a semaphore?'},{fetchImpl:async()=>{throw new Error('offline')}});
  assert.equal(result.citations[0].filename,'CPU Scheduling Notes');
  assert.match(result.answer,/semaphore/i);
});

test('reconciling a session removes sources that were deleted from Vault',() => {
  upsertSessionMaterial(first,{id:'deleted-source',name:'Deleted notes.txt',type:'file',pages:[{page:1,text:'This material should disappear after it is deleted from Vault.'}]});
  assert.equal(sessionStatus(first).materialCount,2);
  const status=reconcileSessionMaterials(first,['os-pdf']);
  assert.equal(status.materialCount,1);
  assert.equal(retrieveSessionChunks(first,'material disappear').some(item=>item.materialId==='deleted-source'),false);
});

test('Gemini response source IDs are converted to safe session citations',async () => {
  const fetchImpl=async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({answer:'A semaphore coordinates concurrent processes [S1].',sourceIds:['S1','S99']})}]}}]})});
  const result=await answerFromSession({sessionId:first,question:'What does a semaphore do?'},{geminiKey:'test',fetchImpl});
  assert.equal(result.provider,'Gemini');
  assert.equal(result.citations.length,1);
  assert.equal(result.citations[0].materialId,'os-pdf');
});

test('multiple retrieved chunks from one page produce one citation chip',async () => {
  const citationSession='session-citations-123'; removeRagSession(citationSession);
  upsertSessionMaterial(citationSession,{id:'long-page',name:'Concurrency.pdf',type:'file',pages:[{page:7,text:'Semaphore synchronization coordinates concurrent processes. '.repeat(90)}]});
  const fetchImpl=async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({answer:'Semaphores coordinate concurrent processes [S1].',sourceIds:['S1','S2']})}]}}]})});
  const result=await answerFromSession({sessionId:citationSession,question:'How do semaphores coordinate concurrent processes?'},{geminiKey:'test',fetchImpl});
  assert.equal(result.citations.length,1);
  assert.equal(result.citations[0].page,7);
});
