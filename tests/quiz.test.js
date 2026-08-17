const test = require('node:test');
const assert = require('node:assert/strict');
const quiz = require('../quiz.js');

test('contains 20 original questions across five balanced categories', () => {
  assert.equal(quiz.QUESTIONS.length, 20);
  const counts = quiz.QUESTIONS.reduce((m, q) => (m[q.category] = (m[q.category] || 0) + 1, m), {});
  assert.deepEqual(counts, { numerical: 4, logic: 4, verbal: 4, spatial: 4, attention: 4 });
  quiz.QUESTIONS.forEach((q) => {
    assert.equal(q.choices.length, 4);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    assert.ok(q.explanation.length >= 10);
  });
});

test('scores answers and produces category breakdown', () => {
  const correct = quiz.QUESTIONS.map(q => q.answer);
  const result = quiz.scoreAnswers(correct);
  assert.equal(result.correct, 20);
  assert.equal(result.percent, 100);
  assert.equal(result.index, 100);
  Object.values(result.categories).forEach(c => assert.deepEqual(c, { correct: 4, total: 4, percent: 100 }));
});

test('unanswered questions are incorrect and score is bounded', () => {
  const result = quiz.scoreAnswers([]);
  assert.equal(result.correct, 0);
  assert.equal(result.percent, 0);
  assert.equal(result.index, 0);
});

test('result labels are conservative and non-clinical', () => {
  assert.equal(quiz.getLevel(95).label, 'โดดเด่นมาก');
  assert.equal(quiz.getLevel(70).label, 'ดี');
  assert.equal(quiz.getLevel(45).label, 'กำลังพัฒนา');
  assert.match(quiz.DISCLAIMER, /ไม่ใช่.*IQ.*คลินิก/);
});
