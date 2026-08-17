const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
test('web app exposes complete public test and free result flow',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
 ['start-screen','quiz-screen','result-screen','timer','progress-bar','category-results','review-list','tester-name','result-tester-name','consent-send','send-status','question-navigator','skip-btn','answered-count','assessment-promise','easypay-logo','result-duration','performance-index','performance-level','time-efficiency','average-per-question'].forEach(id=>assert.match(html,new RegExp(`id=["']${id}["']`)));
 assert.match(html,/ไม่มี Paywall/); assert.match(html,/คำตอบรายข้อไม่ถูกส่ง/); assert.match(html,/hr\.easypaythai@gmail\.com/);
 assert.match(html,/เวลาที่ใช้/); assert.match(html,/id="timer"[\s\S]*00:00/); assert.match(html,/assets\/easypay-thai-logo\.webp/); assert.match(html,/performance\.js/);
 assert.match(html,/ข้อสอบต้นฉบับของ MindGauge/); assert.match(html,/ข้ามข้อและกลับมาตอบ/); assert.doesNotMatch(html,/MindOrbit/i);
 assert.match(app,/scoreAnswers/); assert.match(app,/localStorage/); assert.match(app,/finishQuiz/); assert.match(app,/renderReview/); assert.match(app,/renderNavigator/); assert.match(app,/firstUnanswered/); assert.match(app,/MindGaugePerformance\.calculate/); assert.match(app,/elapsedSeconds/);
 const css=fs.readFileSync(path.join(root,'styles.css'),'utf8');
 assert.match(css,/repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/@media\(max-width:650px\)[\s\S]*\.shell\{width:calc\(100% - 24px\)\}/);
 assert.match(html,/rel="canonical" href="https:\/\/napusmobile\.github\.io\/mindgauge-free-test\/"/);
 assert.match(html,/property="og:title"/); assert.match(html,/site\.webmanifest/); assert.match(html,/favicon\.svg/);
 for(const file of ['robots.txt','sitemap.xml','site.webmanifest','favicon.svg']) assert.equal(fs.existsSync(path.join(root,file)),true,`${file} must exist`);
});
