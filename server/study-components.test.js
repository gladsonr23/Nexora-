import test from 'node:test';
import assert from 'node:assert/strict';
import {createQuiz, createStudyPlan, gradeQuiz} from './study-components.js';

const source = 'Operating systems manage computer hardware and software resources. A process is a program in execution. Memory management allocates and releases memory for programs.';

function fakeProvider(result) {
  return async (_url, options) => {
    const request = JSON.parse(options.body);
    assert.equal(request.generationConfig.responseMimeType, 'application/json');
    return {ok:true, json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(result)}]}}]})};
  };
}

test('creates a bounded study plan with local task IDs and pending state', async () => {
  const result = await createStudyPlan({text:source,subject:'OS',examDate:'2026-11-02',availableHours:2,studyDays:['Monday'],today:'2026-10-19'}, {apiKey:'test',fetchImpl:fakeProvider({subject:'Operating Systems',tasks:[{date:'2026-10-26',topic:'Processes',subtopic:'Process states',durationMinutes:60,priority:'high'}]})});
  assert.equal(result.subject,'Operating Systems');
  assert.equal(result.tasks[0].status,'pending');
  assert.ok(result.tasks[0].taskId);
});

test('rejects a schedule outside selected weekdays', async () => {
  await assert.rejects(createStudyPlan({text:source,subject:'OS',examDate:'2026-11-02',availableHours:2,studyDays:['Monday'],today:'2026-10-19'}, {apiKey:'test',fetchImpl:fakeProvider({subject:'OS',tasks:[{date:'2026-10-27',topic:'Processes',durationMinutes:60}]})}), /outside your selected study days/);
});

test('creates MCQ material and grades quiz answers', async () => {
  const quiz = await createQuiz({text:source,materialName:'os.pdf',subject:'OS',questionType:'mcq',questionCount:5}, {apiKey:'test',fetchImpl:fakeProvider({title:'Processes',questions:Array.from({length:5},(_,i)=>({question:`Question ${i+1}?`,options:['A','B','C','D'],correctAnswer:1,expectedAnswer:'B',explanation:'Because the notes say so.'}))})});
  const attempt = gradeQuiz(quiz,[1,0,1,null,1],70);
  assert.equal(attempt.score,3);
  assert.equal(attempt.totalQuestions,5);
  assert.equal(attempt.percentage,60);
});

test('supports written and term-check quiz answer grading', async () => {
  const quiz = {questionType:'term_check',questions:[{term:'Process',expectedDefinition:'A program in execution'}]};
  assert.equal(gradeQuiz(quiz,['A program in execution']).score,1);
});
