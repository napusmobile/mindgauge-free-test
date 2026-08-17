(()=>{
  const Q=MindGauge.QUESTIONS,$=id=>document.getElementById(id);
  const endpoint=()=>window.MINDGAUGE_CONFIG?.resultEndpoint||'';
  let current=0,answers=Array(Q.length).fill(null),elapsedSeconds=0,tick=null,testerName='',startedAt=null,lastPayload=null;
  const screens=['start-screen','quiz-screen','result-screen'];

  function show(id){screens.forEach(s=>$(s).classList.toggle('hidden',s!==id));scrollTo({top:0,behavior:'smooth'})}
  function validName(){return $('tester-name').value.trim().replace(/\s+/g,' ').length>=2}
  function updateStart(){const ok=validName()&&$('consent-send').checked;$('start-btn').disabled=!ok;$('start-error').textContent=ok?'':'กรุณากรอกชื่อและยินยอมส่งผลก่อนเริ่ม'}
  function save(){localStorage.setItem('mindgauge-progress',JSON.stringify({current,answers,elapsedSeconds,testerName,startedAt}))}
  function answeredTotal(){return answers.filter(a=>a!==null).length}
  function firstUnanswered(from=current+1){for(let step=0;step<Q.length;step++){const i=(from+step)%Q.length;if(answers[i]===null)return i}return-1}
  function goTo(index){if(index<0||index>=Q.length)return;current=index;save();render();scrollTo({top:0,behavior:'smooth'})}

  function renderNavigator(){
    const nav=$('question-navigator');nav.innerHTML='';
    Q.forEach((_,i)=>{const b=document.createElement('button');b.type='button';b.className='nav-question'+(answers[i]!==null?' answered':'')+(i===current?' current':'');b.textContent=i+1;b.setAttribute('aria-label',`ไปข้อ ${i+1}${answers[i]!==null?' ตอบแล้ว':''}`);b.setAttribute('aria-current',i===current?'step':'false');b.onclick=()=>goTo(i);nav.appendChild(b)});
    $('answered-count').textContent=`ตอบแล้ว ${answeredTotal()}/${Q.length}`
  }

  function render(){
    const q=Q[current],done=answeredTotal(),pending=firstUnanswered(0);
    $('category-label').textContent=MindGauge.LABELS[q.category];$('question-count').textContent=`ข้อ ${current+1} จาก ${Q.length}`;$('question-text').textContent=q.prompt;$('progress-bar').style.width=`${done/Q.length*100}%`;$('choices').innerHTML='';
    q.choices.forEach((text,i)=>{const b=document.createElement('button');b.className='choice'+(answers[current]===i?' selected':'');const letter=document.createElement('span');letter.className='choice-letter';letter.textContent=String.fromCharCode(65+i);b.append(letter,document.createTextNode(text));b.onclick=()=>{answers[current]=i;save();render()};$('choices').appendChild(b)});
    $('prev-btn').disabled=current===0;
    $('skip-btn').disabled=firstUnanswered()===-1;
    if(current<Q.length-1)$('next-btn').textContent='ข้อต่อไป →';
    else if(pending!==-1)$('next-btn').textContent='กลับไปข้อที่ยังไม่ตอบ →';
    else $('next-btn').textContent='ดูผลคะแนน →';
    $('next-btn').disabled=answers[current]===null;
    renderNavigator()
  }

  function formatDuration(total){const m=Math.floor(total/60),s=total%60;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`}
  function renderTimer(){$('timer').textContent=formatDuration(elapsedSeconds)}
  function updateTimer(){elapsedSeconds++;renderTimer();save()}
  function start(){
    if(!validName()||!$('consent-send').checked){updateStart();return}
    testerName=$('tester-name').value.trim().replace(/\s+/g,' ');startedAt=new Date().toISOString();
    const stored=localStorage.getItem('mindgauge-progress');if(stored){try{const x=JSON.parse(stored);if(Array.isArray(x.answers)&&x.answers.length===Q.length&&x.testerName===testerName){current=x.current||0;answers=x.answers;elapsedSeconds=Math.max(0,x.elapsedSeconds||0);startedAt=x.startedAt||startedAt}}catch{}}
    show('quiz-screen');render();renderTimer();clearInterval(tick);tick=setInterval(updateTimer,1000)
  }

  function makeId(){return 'mg-'+(crypto.randomUUID?crypto.randomUUID().replaceAll('-',''):Date.now().toString(36)+Math.random().toString(36).slice(2))}
  function buildPayload(r,level,performance){const categories={};Object.keys(r.categories).forEach(k=>categories[k]=r.categories[k].percent);return{name:testerName,consent:true,submissionId:makeId(),submittedAt:new Date().toISOString(),durationSeconds:elapsedSeconds,score:r.index,level:level.label,performanceIndex:performance.performanceIndex,performanceLevel:performance.label,timeEfficiency:performance.timeEfficiency,averageSecondsPerQuestion:performance.averageSecondsPerQuestion,categories,website:$('website').value||''}}
  function setSendStatus(text,type,retry=false){$('send-status-text').textContent=text;$('send-status').className='send-status'+(type?' '+type:'');$('retry-send-btn').classList.toggle('hidden',!retry)}
  async function submitResult(payload){
    lastPayload=payload;const url=endpoint();if(!url){setSendStatus('ระบบส่งผลยังไม่พร้อม กรุณาแจ้งฝ่าย HR','error',true);return}
    if(localStorage.getItem('mindgauge-sent-'+payload.submissionId)){setSendStatus('ผลนี้ถูกส่งให้ฝ่าย HR แล้ว','success');return}
    setSendStatus('กำลังส่งผลให้ฝ่าย HR…','');
    try{await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});localStorage.setItem('mindgauge-sent-'+payload.submissionId,'1');setSendStatus('ส่งข้อมูลเข้าสู่ระบบ HR แล้ว','success')}
    catch{setSendStatus('ส่งผลไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง','error',true)}
  }

  function finishQuiz(){
    const pending=firstUnanswered(0);if(pending!==-1){goTo(pending);return}
    clearInterval(tick);localStorage.removeItem('mindgauge-progress');const r=MindGauge.scoreAnswers(answers),level=MindGauge.getLevel(r.percent),performance=MindGaugePerformance.calculate(r.index,elapsedSeconds,Q.length);$('score-percent').textContent=r.index;document.querySelector('.score-ring').style.setProperty('--score',r.percent+'%');$('result-tester-name').textContent=`ผู้ทดสอบ: ${testerName}`;$('result-level').textContent=level.label;$('result-copy').textContent=`ตอบถูก ${r.correct} จาก ${r.total} ข้อ • ดัชนีการให้เหตุผล ${r.index}/100`;
    $('performance-index').textContent=performance.performanceIndex;$('performance-level').textContent=performance.label;$('result-duration').textContent=formatDuration(elapsedSeconds);$('time-efficiency').textContent=`${performance.timeEfficiency}/100`;$('average-per-question').textContent=`${performance.averageSecondsPerQuestion} วินาที`;$('category-results').innerHTML='';
    Object.entries(r.categories).forEach(([k,v])=>{const d=document.createElement('article');d.className='category-card';d.innerHTML=`<div class="category-row"><b>${MindGauge.LABELS[k]}</b><span>${v.correct}/${v.total}</span></div><div class="mini-track"><div style="width:${v.percent}%"></div></div>`;$('category-results').appendChild(d)});
    $('result-disclaimer').textContent=MindGauge.DISCLAIMER;show('result-screen');lastPayload=buildPayload(r,level,performance);submitResult(lastPayload)
  }

  function renderReview(){$('review-list').innerHTML='';Q.forEach((q,i)=>{const hit=answers[i]===q.answer,d=document.createElement('article');d.className='review-item';const h=document.createElement('h4');h.textContent=`ข้อ ${i+1}: ${q.prompt}`;const p1=document.createElement('p');p1.className=hit?'correct':'wrong';p1.textContent=`${hit?'✓':'✗'} คำตอบของคุณ: ${answers[i]===null?'ไม่ได้ตอบ':q.choices[answers[i]]}`;const p2=document.createElement('p');p2.textContent=`คำตอบที่ถูก: ${q.choices[q.answer]}`;const p3=document.createElement('p');p3.textContent=q.explanation;d.append(h,p1,p2,p3);$('review-list').appendChild(d)});$('review-section').classList.remove('hidden');$('review-section').scrollIntoView({behavior:'smooth'})}

  $('tester-name').addEventListener('input',updateStart);$('consent-send').addEventListener('change',updateStart);$('start-btn').onclick=start;
  $('prev-btn').onclick=()=>{if(current>0)goTo(current-1)};
  $('skip-btn').onclick=()=>{const target=firstUnanswered();if(target!==-1)goTo(target)};
  $('next-btn').onclick=()=>{if(answers[current]===null)return;if(current<Q.length-1)goTo(current+1);else{const pending=firstUnanswered(0);pending===-1?finishQuiz():goTo(pending)}};
  $('review-btn').onclick=renderReview;$('retry-send-btn').onclick=()=>lastPayload&&submitResult(lastPayload);
  $('restart-btn').onclick=()=>{answers=Array(Q.length).fill(null);current=0;elapsedSeconds=0;testerName='';startedAt=null;lastPayload=null;localStorage.removeItem('mindgauge-progress');location.reload()};
  $('disclaimer-text').textContent=MindGauge.DISCLAIMER;updateStart();
})();
