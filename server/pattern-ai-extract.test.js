import test from 'node:test';
import assert from 'node:assert/strict';
import { extractQuestionsWithAi, reconcileQuestionExtractions } from './pattern-ai-extract.js';

test('merges two AI readings and deterministic parser without duplicate questions',() => {
  const result=reconcileQuestionExtractions(
    [{number:1,text:'Explain process scheduling in an operating system.',marks:5,page:1}],
    [{number:1,text:'Explain process scheduling in the operating system.',marks:5,page:1}],
    [{number:2,text:'What is a semaphore in operating systems?',marks:null,page:1}]
  );
  assert.equal(result.length,2);
  assert.equal(result[0].confidence,'cross-checked');
  assert.equal(result[1].confidence,'single-source');
});

test('uses Gemini and Groq to cross-check OCR text',async () => {
  const payload={questions:[{number:1,text:'Explain deadlock prevention methods.',marks:8,page:1}]};
  const fetchImpl=async url => url.includes('googleapis')
    ? {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(payload)}]}}]})}
    : {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(payload)}}]})};
  const result=await extractQuestionsWithAi([{number:1,text:'1 Explain deadlock prevention methods',tesseract:{text:'1. Explain deadlock prevention methods'},nvidia:{text:'1. Explain deadlock prevention methods'}}],{geminiKey:'x',groqKey:'y',fetchImpl});
  assert.deepEqual(result.providers,['Gemini','Groq']);
  assert.equal(result.questions[0].confidence,'cross-checked');
});

test('uses numeric consensus when one OCR model mistakes 8 marks for 3',() => {
  const result=reconcileQuestionExtractions(
    [{number:1,text:'Explain resource allocation methods.',marks:3,page:1}],
    [{number:1,text:'Explain resource allocation methods.',marks:8,page:1}],
    [{number:1,text:'Explain resource allocation methods.',marks:8,page:1}]
  );
  assert.equal(result[0].marks,8);
});

test('does not publish an unconfirmed single-source mark',() => {
  const result=reconcileQuestionExtractions(
    [{number:1,text:'Explain resource allocation methods.',marks:3,page:1}],
    [],
    []
  );
  assert.equal(result[0].marks,null);
  assert.equal(result[0].markConfidence,'uncertain');
});

test('independent AI numbering replaces a misread parser number without duplicating the question',() => {
  const result=reconcileQuestionExtractions(
    [{number:2,text:'Explain the complete integral of the differential equation.',marks:5,page:1}],
    [],
    [{number:1,text:'Explain the complete integral of the differential equation.',marks:null,page:1}]
  );
  assert.equal(result.length,1);
  assert.equal(result[0].number,2);
  assert.equal(result[0].numberConfidence,'verified');
});

test('does not resolve a question number when independent AI readings disagree',() => {
  const result=reconcileQuestionExtractions(
    [{number:2,text:'Explain the complete integral of the differential equation.',page:1}],
    [{number:3,text:'Explain the complete integral of the differential equation.',page:1}],
    [{number:1,text:'Explain the complete integral of the differential equation.',page:1}]
  );
  assert.deepEqual(result,[]);
});

test('marks parser-only question numbers as unverified',() => {
  const result=reconcileQuestionExtractions([],[],[{number:7,text:'Explain the complete integral of the differential equation.',page:1}]);
  assert.equal(result[0].numberConfidence,'unverified');
});

test('Gemini network failures preserve the underlying cause in OCR verification warnings',async () => {
  const cause=Object.assign(new Error('getaddrinfo ENOTFOUND generativelanguage.googleapis.com'),{code:'ENOTFOUND',hostname:'generativelanguage.googleapis.com'});
  const result=await extractQuestionsWithAi([{number:1,text:'OCR reading'}],{geminiKey:'test-key',fetchImpl:async url=>{
    if(String(url).includes('googleapis')) throw new TypeError('fetch failed',{cause});
    throw new Error('Groq must not be called without a key');
  }});
  assert.match(result.warnings[0],/Gemini network request failed/);
  assert.match(result.warnings[0],/ENOTFOUND/);
});

test('includes all OCR readings in the AI cross-check prompt',async () => {
  const payload={questions:[{number:1,text:'Explain deadlock prevention methods.',marks:null,page:1}]};
  const prompts=[];
  const fetchImpl=async (url,options) => {
    prompts.push(options.body);
    return url.includes('googleapis')
      ? {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(payload)}]}}]})}
      : {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(payload)}}]})};
  };
  await extractQuestionsWithAi([{number:1,text:'selected OCR',tesseract:{text:'local text'},nvidia:{text:'remote text'},llama:{text:'vision text'}}],{geminiKey:'x',groqKey:'y',fetchImpl});
  assert.ok(prompts.some(body=>JSON.stringify(body).includes('vision text')));
  assert.ok(prompts.every(body=>JSON.stringify(body).includes('never rely on NVIDIA alone for a question number')));
});
