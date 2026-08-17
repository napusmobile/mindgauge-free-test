(()=>{
  const Q=MindGauge.QUESTIONS,$=id=>document.getElementById(id);
  const endpoint=()=>window.MINDGAUGE_CONFIG?.resultEndpoint||'';
  let current=0,answers=Array(Q.length).fill(null),seconds=900,tick=null,testerName='',startedAt=null,lastPayload=null;
  const screens=['start-screen','quiz-screen','result-screen'];
  function show(id){screens.forEach(s=>$(s).classList.toggle('hidden',s!==id));scrollTo({top:0,behavior:'smooth'})}
  function validName(){return $('tester-name').value.trim().replace(/\s+/g,' ').length>=2}
  function updateStart(){const ok=validName()&&$('consent-send').checked;$('start-btn').disabled=!ok;$('start-error').textContent=ok?'':'กรุณากรอกชื่อและยินยอมส่งผลก่อนเริ่ม'}
  function save(){localStorage.setItem('mindgauge-progress',JSON.stringify({current,answers,seconds,testerName,startedAt}))}
  function render(){
    const q=Q[current];$('category-label').textContent=MindGauge.LABELS[q.category];$('question-count').textContent=`ข้อ ${current+1} จาก ${Q.length}`;$('question-text').textContent=q.prompt;$('progress-bar').style.width=`${(current+1)/Q.length*100}%`;$('choices').innerHTML='';
    q.choices.forEach((text,i)=>{const b=document.createElement('button');b.className='choice'+(answers[current]===i?' selected':'');const letter=document.createElement('span');letter.className='choice-letter';letter.textContent=String.fromCharCode(65+i);b.append(letter,document.createTextNode(text));b.onclick=()=>{answers[current]=i;save();render()};$('choices').appendChild(b)});
    $('prev-btn').disabled=current===0;$('next-btn').textContent=current===Q.length-1?'ดูผลคะแนน →':'ข้อต่อไป →';$('next-btn').disabled=answers[current]===null
  }
  function updateTimer(){const m=Math.floor(seconds/60),s=seconds%60;$('timer').textContent=`${m}:${String(s).padStart(2,'0')}`;$('timer').classList.toggle('warning',seconds<=60);if(seconds<=0)finishQuiz();else{seconds--;save()}}
  function start(){
    if(!validName()||!$('consent-send').checked){updateStart();return}
    testerName=$('tester-name').value.trim().replace(/\s+/g,' ');startedAt=new Date().toISOString();
    const stored=localStorage.getItem('mindgauge-progress');if(stored){try{const x=JSON.parse(stored);if(Array.isArray(x.answers)&&x.answers.length===Q.length&&x.testerName===testerName){current=x.current||0;answers=x.answers;seconds=Math.max(1,x.seconds||900);startedAt=x.startedAt||startedAt}}catch{}}
    show('quiz-screen');render();clearInterval(tick);updateTimer();tick=setInterval(updateTimer,1000)
  }
  function makeId(){return 'mg-'+(crypto.randomUUID?crypto.randomUUID().replaceAll('-',''):Date.now().toString(36)+Math.random().toString(36).slice(2))}
  function buildPayload(r,level){const categories={};Object.keys(r.categories).forEach(k=>categories[k]=r.categories[k].percent);return{name:testerName,consent:true,submissionId:makeId(),submittedAt:new Date().toISOString(),durationSeconds:Math.max(0,900-seconds),score:r.index,level:level.label,categories,website:$('website').value||''}}
  function setSendStatus(text,type,retry=false){$('send-status-text').textContent=text;$('send-status').className='send-status'+(type?' '+type:'');$('retry-send-btn').classList.toggle('hidden',!retry)}
  async function submitResult(payload){
    lastPayload=payload;const url=endpoint();if(!url){setSendStatus('ระบบส่งผลยังไม่พร้อม กรุณาแจ้งฝ่าย HR','error',true);return}
    if(localStorage.getItem('mindgauge-sent-'+payload.submissionId)){setSendStatus('ผลนี้ถูกส่งให้ฝ่าย HR แล้ว','success');return}
    setSendStatus('กำลังส่งผลให้ฝ่าย HR…','');
    try{await fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});localStorage.setItem('mindgauge-sent-'+payload.submissionId,'1');setSendStatus('ส่งข้อมูลเข้าสู่ระบบ HR แล้ว','success')}
    catch{setSendStatus('ส่งผลไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง','error',true)}
  }
  function finishQuiz(){
    clearInterval(tick);localStorage.removeItem('mindgauge-progress');const r=MindGauge.scoreAnswers(answers),level=MindGauge.getLevel(r.percent);$('score-percent').textContent=r.index;document.querySelector('.score-ring').style.setProperty('--score',r.percent+'%');$('result-tester-name').textContent=`ผู้ทดสอบ: ${testerName}`;$('result-level').textContent=level.label;$('result-copy').textContent=`ตอบถูก ${r.correct} จาก ${r.total} ข้อ • ดัชนีการให้เหตุผล ${r.index}/100`;$('category-results').innerHTML='';
    Object.entries(r.categories).forEach(([k,v])=>{const d=document.createElement('article');d.className='category-card';d.innerHTML=`<div class="category-row"><b>${MindGauge.LABELS[k]}</b><span>${v.correct}/${v.total}</span></div><div class="mini-track"><div style="width:${v.percent}%"></div></div>`;$('category-results').appendChild(d)});
    $('result-disclaimer').textContent=MindGauge.DISCLAIMER;show('result-screen');lastPayload=buildPayload(r,level);submitResult(lastPayload)
  }
  function renderReview(){$('review-list').innerHTML='';Q.forEach((q,i)=>{const hit=answers[i]===q.answer,d=document.createElement('article');d.className='review-item';const h=document.createElement('h4');h.textContent=`ข้อ ${i+1}: ${q.prompt}`;const p1=document.createElement('p');p1.className=hit?'correct':'wrong';p1.textContent=`${hit?'✓':'✗'} คำตอบของคุณ: ${answers[i]===null?'ไม่ได้ตอบ':q.choices[answers[i]]}`;const p2=document.createElement('p');p2.textContent=`คำตอบที่ถูก: ${q.choices[q.answer]}`;const p3=document.createElement('p');p3.textContent=q.explanation;d.append(h,p1,p2,p3);$('review-list').appendChild(d)});$('review-section').classList.remove('hidden');$('review-section').scrollIntoView({behavior:'smooth'})}
  $('tester-name').addEventListener('input',updateStart);$('consent-send').addEventListener('change',updateStart);$('start-btn').onclick=start;$('prev-btn').onclick=()=>{if(current>0){current--;save();render()}};$('next-btn').onclick=()=>{if(current<Q.length-1){current++;save();render()}else finishQuiz()};$('review-btn').onclick=renderReview;$('retry-send-btn').onclick=()=>lastPayload&&submitResult(lastPayload);$('restart-btn').onclick=()=>{answers=Array(Q.length).fill(null);current=0;seconds=900;testerName='';startedAt=null;lastPayload=null;localStorage.removeItem('mindgauge-progress');location.reload()};$('disclaimer-text').textContent=MindGauge.DISCLAIMER;updateStart();
})();
