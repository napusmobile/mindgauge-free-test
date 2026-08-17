(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MindGauge = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DISCLAIMER = 'แบบประเมินนี้ใช้ฝึกและประเมินทักษะการให้เหตุผลเบื้องต้น ไม่ใช่การทดสอบ IQ ทางคลินิกหรือการวินิจฉัยทางจิตวิทยา';
  const QUESTIONS = [
    {category:'numerical', prompt:'ลำดับถัดไปคือข้อใด: 2, 6, 12, 20, 30, ?', choices:['36','40','42','44'], answer:2, explanation:'ผลต่างเพิ่มทีละ 2 คือ 4, 6, 8, 10 และ 12 ดังนั้นคำตอบคือ 42'},
    {category:'numerical', prompt:'ลำดับถัดไปคือข้อใด: 81, 27, 9, 3, ?', choices:['0','1','2','6'], answer:1, explanation:'แต่ละจำนวนหารด้วย 3 ต่อเนื่อง ดังนั้น 3 หาร 3 เท่ากับ 1'},
    {category:'numerical', prompt:'เครื่องจักร 4 เครื่องผลิตสินค้า 4 ชิ้นใน 4 นาที หากมี 8 เครื่องผลิตสินค้า 8 ชิ้น จะใช้เวลากี่นาที?', choices:['2 นาที','4 นาที','8 นาที','16 นาที'], answer:1, explanation:'แต่ละเครื่องผลิตหนึ่งชิ้นใน 4 นาที เมื่อจำนวนเครื่องเท่ากับจำนวนชิ้นจึงยังใช้ 4 นาที'},
    {category:'numerical', prompt:'15% ของ 240 เท่ากับเท่าใด?', choices:['24','30','36','40'], answer:2, explanation:'สิบเปอร์เซ็นต์คือ 24 และห้าเปอร์เซ็นต์คือ 12 รวมเป็น 36'},
    {category:'logic', prompt:'ถ้า “นักวิจัยทุกคนเป็นนักอ่าน” และ “ไม่มีนักอ่านคนใดเป็นคนที่ไม่ชอบหนังสือ” ข้อใดต้องเป็นจริง?', choices:['นักวิจัยบางคนไม่ชอบหนังสือ','นักวิจัยไม่มีใครไม่ชอบหนังสือ','คนชอบหนังสือทุกคนเป็นนักวิจัย','สรุปไม่ได้'], answer:1, explanation:'นักวิจัยอยู่ในกลุ่มนักอ่านทั้งหมด และนักอ่านถูกตัดออกจากกลุ่มไม่ชอบหนังสือ'},
    {category:'logic', prompt:'นกมาถึงก่อนเมย์ และบีมมาถึงหลังเมย์ ลำดับที่ถูกต้องคือข้อใด?', choices:['บีม–เมย์–นก','เมย์–นก–บีม','นก–เมย์–บีม','นก–บีม–เมย์'], answer:2, explanation:'นกต้องอยู่ก่อนเมย์ และบีมต้องอยู่หลังเมย์ จึงเป็นนก เมย์ บีม'},
    {category:'logic', prompt:'ถ้าสัญญาณเป็นสีแดง ระบบจะหยุด ขณะนี้ระบบไม่หยุด ข้อใดสมเหตุสมผลที่สุด?', choices:['สัญญาณเป็นสีแดง','สัญญาณไม่เป็นสีแดง','ระบบเสียแน่นอน','ไม่มีข้อสรุปใดเลย'], answer:1, explanation:'จากเงื่อนไข หากเป็นสีแดงต้องหยุด เมื่อไม่หยุดจึงอนุมานได้ว่าไม่เป็นสีแดง'},
    {category:'logic', prompt:'มีหนังสือ 3 เล่ม: แดง น้ำเงิน เขียว วางเรียงกัน โดยแดงไม่อยู่ริม และน้ำเงินอยู่ซ้ายของเขียว ลำดับคือข้อใด?', choices:['น้ำเงิน–แดง–เขียว','เขียว–แดง–น้ำเงิน','แดง–น้ำเงิน–เขียว','น้ำเงิน–เขียว–แดง'], answer:0, explanation:'แดงต้องอยู่ตรงกลาง และน้ำเงินต้องอยู่ซ้ายของเขียว จึงเหลือลำดับเดียว'},
    {category:'verbal', prompt:'หนังสือ : อ่าน มีความสัมพันธ์ใกล้เคียงกับข้อใดมากที่สุด?', choices:['ดนตรี : ฟัง','ดินสอ : กระดาษ','อาหาร : ครัว','รถยนต์ : ถนน'], answer:0, explanation:'หนังสือเป็นสิ่งที่อ่าน เช่นเดียวกับดนตรีเป็นสิ่งที่ฟัง'},
    {category:'verbal', prompt:'ข้อใดแตกต่างจากพวก?', choices:['มะม่วง','กล้วย','แครอท','มะละกอ'], answer:2, explanation:'แครอทเป็นผัก ส่วนตัวเลือกอื่นเป็นผลไม้'},
    {category:'verbal', prompt:'แพทย์ : โรงพยาบาล มีความสัมพันธ์ใกล้เคียงกับข้อใด?', choices:['ครู : โรงเรียน','นักเรียน : หนังสือ','ช่าง : ค้อน','พ่อค้า : เงิน'], answer:0, explanation:'เป็นความสัมพันธ์ระหว่างอาชีพกับสถานที่ทำงานหลัก'},
    {category:'verbal', prompt:'“บางคนที่วิ่งเร็วเป็นนักว่ายน้ำ” ข้อใดสรุปได้แน่นอน?', choices:['นักว่ายน้ำทุกคนวิ่งเร็ว','มีนักว่ายน้ำอย่างน้อยหนึ่งคนที่วิ่งเร็ว','คนวิ่งเร็วทุกคนว่ายน้ำ','ไม่มีนักว่ายน้ำที่วิ่งช้า'], answer:1, explanation:'คำว่า “บางคน” ยืนยันว่ามีอย่างน้อยหนึ่งคนที่อยู่ในทั้งสองกลุ่ม'},
    {category:'spatial', prompt:'ลูกศร ↑ หมุนตามเข็มนาฬิกา 90° จำนวน 2 ครั้ง จะชี้ไปทางใด?', choices:['↑','→','↓','←'], answer:2, explanation:'หมุนครั้งแรกชี้ขวา และครั้งที่สองชี้ลง'},
    {category:'spatial', prompt:'ภาพ “◀ ● |” เมื่อสะท้อนในกระจกแนวตั้งจะใกล้เคียงกับข้อใด?', choices:['| ● ▶','| ● ◀','▶ ● |','◀ | ●'], answer:0, explanation:'ตำแหน่งซ้ายขวาสลับกันและรูปสามเหลี่ยมกลับทิศ จึงเป็นเส้น จุด และลูกศรขวา'},
    {category:'spatial', prompt:'รูปแบบถัดไปคือข้อใด: ○ △ □ ○ △ ?', choices:['○','△','□','◇'], answer:2, explanation:'รูปทรงวนซ้ำเป็นวงกลม สามเหลี่ยม สี่เหลี่ยม ดังนั้นถัดไปคือสี่เหลี่ยม'},
    {category:'spatial', prompt:'หากหันหน้าไปทางทิศเหนือ เลี้ยวขวา เดินไป แล้วเลี้ยวซ้าย ขณะนี้หันหน้าไปทางใด?', choices:['เหนือ','ใต้','ตะวันออก','ตะวันตก'], answer:0, explanation:'จากเหนือเลี้ยวขวาเป็นตะวันออก แล้วเลี้ยวซ้ายกลับเป็นเหนือ'},
    {category:'attention', prompt:'ในชุด “A7B7C7D7E” มีเลข 7 กี่ตัว?', choices:['3','4','5','6'], answer:1, explanation:'เลข 7 ปรากฏหลัง A, B, C และ D รวมทั้งหมด 4 ตัว'},
    {category:'attention', prompt:'ข้อใดสะกดต่างจากตัวอื่น?', choices:['MINDGAUGE','MINDGAUGE','MINDGUAGE','MINDGAUGE'], answer:2, explanation:'ตัวเลือกที่สามสลับตำแหน่งตัวอักษร U และ A'},
    {category:'attention', prompt:'นับตัวอักษร “ก” ในข้อความ “กากบาทกลางกระดาษ” ได้กี่ตัว?', choices:['3','4','5','6'], answer:1, explanation:'มี ก ในคำว่า กากบาท 2 ตัว กลาง 1 ตัว และกระดาษ 1 ตัว รวม 4 ตัว'},
    {category:'attention', prompt:'ชุดใดเหมือนต้นฉบับ “Q8R2-T5M9” ทุกตำแหน่ง?', choices:['Q8R2-T5N9','Q8R2-T5M9','QBR2-T5M9','Q8R2-TSM9'], answer:1, explanation:'ตัวเลือกที่สองตรงกับต้นฉบับทั้งตัวอักษร ตัวเลข และเครื่องหมาย'},
  ];
  const LABELS = {numerical:'การคิดเชิงตัวเลข',logic:'ตรรกะ',verbal:'ภาษาและความสัมพันธ์',spatial:'มิติสัมพันธ์',attention:'ความใส่ใจรายละเอียด'};
  function scoreAnswers(answers) {
    const categories = {};
    Object.keys(LABELS).forEach(k => categories[k] = {correct:0,total:0,percent:0});
    let correct = 0;
    QUESTIONS.forEach((q,i) => { const hit = answers[i] === q.answer; categories[q.category].total++; if(hit){correct++; categories[q.category].correct++;} });
    Object.values(categories).forEach(c => c.percent = Math.round(c.correct/c.total*100));
    const percent = Math.round(correct/QUESTIONS.length*100);
    return {correct, total:QUESTIONS.length, percent, index:percent, categories};
  }
  function getLevel(percent){
    if(percent>=90) return {label:'โดดเด่นมาก',tone:'excellent'};
    if(percent>=70) return {label:'ดี',tone:'good'};
    if(percent>=50) return {label:'ปานกลาง',tone:'average'};
    return {label:'กำลังพัฒนา',tone:'developing'};
  }
  return {QUESTIONS,LABELS,DISCLAIMER,scoreAnswers,getLevel};
});
