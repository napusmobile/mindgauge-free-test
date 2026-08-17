const test=require('node:test');const assert=require('node:assert/strict');
const backend=require('../backend/Code.js');
const valid={name:'สมชาย ใจดี',consent:true,submissionId:'mg-1234567890abcdef',submittedAt:'2026-08-17T03:00:00.000Z',durationSeconds:420,score:75,level:'ดี',categories:{numerical:75,logic:50,verbal:100,spatial:75,attention:75},website:''};
test('accepts a minimal valid result payload',()=>assert.equal(backend.validatePayload_(valid).ok,true));
test('rejects missing consent, invalid score, and unexpected answer data',()=>{assert.equal(backend.validatePayload_({...valid,consent:false}).ok,false);assert.equal(backend.validatePayload_({...valid,score:101}).ok,false);assert.equal(backend.validatePayload_({...valid,answers:[1,2]}).error,'UNEXPECTED_FIELD')});
test('honeypot submissions are recognized',()=>assert.equal(backend.validatePayload_({...valid,website:'bot'}).bot,true));
test('email contains escaped tester name and no answer details',()=>{const e=backend.buildEmail_({...valid,name:'<script>A</script>'});assert.match(e.htmlBody,/&lt;script&gt;A/);assert.doesNotMatch(e.htmlBody,/ลำดับถัดไป|คำตอบของคุณ/);assert.match(e.subject,/MindGauge/)});
