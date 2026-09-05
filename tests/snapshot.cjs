const assert=require('node:assert/strict');require('../snapshot.js');
const {pack,unpack}=global.ScheduleSnapshot;
const p={week:'2026-08-31',branch:'Cá Hồi',publishedAt:'2026-09-05T10:00:00Z',people:Array.from({length:18},(_,i)=>({name:'Nhân viên '+i,phone:'PRIVATE',rate:99000,days:Array.from({length:7},(_,d)=>d===6?[]:[{label:'7h-12h30',pos:'Phục vụ',hours:5.5,bike:i===0}])}))};
const encoded=pack(p),decoded=unpack(encoded);assert.equal(decoded.people.length,18);assert.equal(decoded.people[0].days[0][0].hours,5.5);assert.equal(decoded.people[0].name,'Nhân viên 0');assert.ok(!JSON.stringify(decoded).includes('PRIVATE'));assert.ok(!JSON.stringify(decoded).includes('rate'));
p.people[0].days[0]=[];assert.equal(unpack(encoded).people[0].days[0].length,1);assert.equal(unpack(pack(p)).people[0].days[0].length,0);
for(const bad of ['','###','a'.repeat(16001),btoa('[99]')])assert.throws(()=>unpack(bad));
console.log('PASS: Unicode, compact 18-person week ('+encoded.length+' characters), privacy allowlist, immutable old link, updated new link, malformed and oversized input.');
