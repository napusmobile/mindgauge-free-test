const RECIPIENT_='hr.easypaythai@gmail.com';
const CATEGORY_LABELS_={numerical:'การคิดเชิงตัวเลข',logic:'ตรรกะ',verbal:'ภาษาและความสัมพันธ์',spatial:'มิติสัมพันธ์',attention:'ความใส่ใจรายละเอียด'};

function doGet(){return json_({ok:true,service:'MindGauge Result Email',status:'ready'});}

function doPost(e){
  try{
    const raw=e&&e.postData&&e.postData.contents?e.postData.contents:'';
    const payload=JSON.parse(raw||'{}');
    const validation=validatePayload_(payload);
    if(validation.bot)return json_({ok:true,accepted:true});
    if(!validation.ok)return json_({ok:false,error:validation.error});
    const lock=LockService.getScriptLock();
    if(!lock.tryLock(5000))return json_({ok:false,error:'BUSY'});
    try{
      const cache=CacheService.getScriptCache();
      const duplicateKey='sent:'+payload.submissionId;
      if(cache.get(duplicateKey))return json_({ok:true,accepted:true,duplicate:true});
      const bucket='rate:'+Math.floor(Date.now()/600000);
      const count=Number(cache.get(bucket)||0);
      if(count>=20)return json_({ok:false,error:'RATE_LIMIT'});
      if(MailApp.getRemainingDailyQuota()<1)return json_({ok:false,error:'MAIL_QUOTA'});
      const email=buildEmail_(payload);
      MailApp.sendEmail({to:RECIPIENT_,subject:email.subject,htmlBody:email.htmlBody,body:email.textBody,name:'MindGauge Results'});
      cache.put(duplicateKey,'1',21600);cache.put(bucket,String(count+1),600);
      return json_({ok:true,accepted:true,submissionId:payload.submissionId});
    }finally{lock.releaseLock();}
  }catch(err){console.error(err);return json_({ok:false,error:'INVALID_REQUEST'});}
}

function validatePayload_(p){
  if(p&&typeof p.website==='string'&&p.website.trim())return {ok:false,bot:true};
  if(!p||typeof p!=='object')return {ok:false,error:'PAYLOAD_REQUIRED'};
  const allowed=['name','consent','website','submissionId','submittedAt','durationSeconds','score','level','categories'];
  const unexpected=Object.keys(p).filter(k=>!allowed.includes(k));
  if(unexpected.length)return {ok:false,error:'UNEXPECTED_FIELD'};
  const name=typeof p.name==='string'?p.name.trim().replace(/\s+/g,' '):'';
  if(name.length<2||name.length>100)return {ok:false,error:'INVALID_NAME'};
  if(p.consent!==true)return {ok:false,error:'CONSENT_REQUIRED'};
  if(typeof p.submissionId!=='string'||!/^mg-[a-z0-9]{12,64}$/i.test(p.submissionId))return {ok:false,error:'INVALID_SUBMISSION_ID'};
  if(typeof p.submittedAt!=='string'||isNaN(Date.parse(p.submittedAt)))return {ok:false,error:'INVALID_DATE'};
  if(!Number.isInteger(p.durationSeconds)||p.durationSeconds<0||p.durationSeconds>3600)return {ok:false,error:'INVALID_DURATION'};
  if(!Number.isInteger(p.score)||p.score<0||p.score>100)return {ok:false,error:'INVALID_SCORE'};
  if(typeof p.level!=='string'||p.level.length<1||p.level.length>40)return {ok:false,error:'INVALID_LEVEL'};
  if(!p.categories||typeof p.categories!=='object')return {ok:false,error:'INVALID_CATEGORIES'};
  for(const key of Object.keys(CATEGORY_LABELS_)){const value=p.categories[key];if(!Number.isInteger(value)||value<0||value>100)return {ok:false,error:'INVALID_CATEGORY_'+key};}
  return {ok:true,name};
}

function buildEmail_(p){
  const name=escapeHtml_(p.name.trim().replace(/\s+/g,' '));
  const rows=Object.keys(CATEGORY_LABELS_).map(k=>`<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">${CATEGORY_LABELS_[k]}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right"><b>${p.categories[k]}/100</b></td></tr>`).join('');
  const subject=`[MindGauge] ผลการทดสอบ: ${p.name.trim()} — ${p.score}/100`;
  const htmlBody=`<div style="font-family:Arial,sans-serif;max-width:620px;color:#18223e"><h2 style="color:#0c1736">ผลการประเมิน MindGauge</h2><p><b>ผู้ทดสอบ:</b> ${name}</p><p><b>คะแนนรวม:</b> ${p.score}/100<br><b>ระดับ:</b> ${escapeHtml_(p.level)}<br><b>เวลาที่ใช้:</b> ${Math.round(p.durationSeconds/60)} นาที<br><b>เวลาส่ง:</b> ${escapeHtml_(p.submittedAt)}<br><b>Submission ID:</b> ${escapeHtml_(p.submissionId)}</p><table style="width:100%;border-collapse:collapse">${rows}</table><p style="margin-top:20px;color:#6d758b;font-size:12px">แบบประเมินนี้ไม่ใช่การทดสอบ IQ ทางคลินิก และอีเมลนี้ไม่มีคำตอบรายข้อ</p></div>`;
  const textBody=`MindGauge\nผู้ทดสอบ: ${p.name.trim()}\nคะแนนรวม: ${p.score}/100\nระดับ: ${p.level}\nเวลาที่ใช้: ${Math.round(p.durationSeconds/60)} นาที\nSubmission ID: ${p.submissionId}`;
  return {subject,htmlBody,textBody};
}
function escapeHtml_(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}

if(typeof module==='object'&&module.exports)module.exports={validatePayload_,buildEmail_,escapeHtml_};
