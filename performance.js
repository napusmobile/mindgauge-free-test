(function(root){
  const BENCHMARK_SECONDS=900;
  function labelFor(index){
    if(index>=80)return 'มีประสิทธิภาพสูง';
    if(index>=65)return 'มีประสิทธิภาพดี';
    if(index>=50)return 'กำลังพัฒนา';
    return 'ควรพัฒนาเพิ่มเติม';
  }
  function calculate(score,durationSeconds,totalQuestions){
    if(!Number.isFinite(score)||score<0||score>100)throw new RangeError('score must be between 0 and 100');
    if(!Number.isFinite(durationSeconds)||durationSeconds<0)throw new RangeError('duration must be zero or greater');
    if(!Number.isInteger(totalQuestions)||totalQuestions<1)throw new RangeError('questions must be a positive integer');
    const safeDuration=Math.max(1,durationSeconds);
    const timeEfficiency=Math.round(Math.min(100,(BENCHMARK_SECONDS/safeDuration)*100));
    const performanceIndex=Math.round((score*.9)+(timeEfficiency*.1));
    const averageSecondsPerQuestion=Math.round(durationSeconds/totalQuestions);
    return{performanceIndex,timeEfficiency,averageSecondsPerQuestion,label:labelFor(performanceIndex)};
  }
  const api={BENCHMARK_SECONDS,calculate,labelFor};
  root.MindGaugePerformance=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
