const test=require('node:test');
const assert=require('node:assert/strict');
const Performance=require('../performance.js');

test('performance index weights reasoning 90 percent and time 10 percent',()=>{
  const result=Performance.calculate(80,900,20);
  assert.deepEqual(result,{performanceIndex:82,timeEfficiency:100,averageSecondsPerQuestion:45,label:'มีประสิทธิภาพสูง'});
});

test('finishing faster than 15 minutes does not create extra speed bonus',()=>{
  assert.equal(Performance.calculate(80,450,20).timeEfficiency,100);
  assert.equal(Performance.calculate(80,450,20).performanceIndex,82);
});

test('slower completion reduces only the bounded time component',()=>{
  const result=Performance.calculate(80,1800,20);
  assert.equal(result.timeEfficiency,50);
  assert.equal(result.performanceIndex,77);
  assert.equal(result.averageSecondsPerQuestion,90);
});

test('performance calculation rejects out of range inputs',()=>{
  assert.throws(()=>Performance.calculate(101,900,20),/score/i);
  assert.throws(()=>Performance.calculate(80,-1,20),/duration/i);
  assert.throws(()=>Performance.calculate(80,900,0),/questions/i);
});
