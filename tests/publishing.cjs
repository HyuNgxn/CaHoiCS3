const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createServer}=require('../server.cjs');
const key='test-manager-key-'.repeat(4),dir=fs.mkdtempSync(path.join(os.tmpdir(),'cahoi-publishing-test-'));
let server;
async function boot(){server=createServer({dataDir:dir,adminToken:key});await new Promise(r=>server.listen(0,'127.0.0.1',r));return 'http://127.0.0.1:'+server.address().port;}
async function stop(){await new Promise(r=>server.close(r));}
(async()=>{
  let base=await boot();
  const call=async(route,body,auth=key)=>{const r=await fetch(base+route,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+auth,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return {code:r.status,data:await r.json(),cache:r.headers.get('cache-control')};};
  const payload={week:'2026-08-31',branch:'Quán thử',people:[{id:'one',name:'An (mẫu)',rate:99999,phone:'PRIVATE',days:Array.from({length:7},(_,d)=>d===0?[{label:'7h-12h30',pos:'Pha chế',hours:5.5,bike:false,privateNote:'SECRET'}]:[])},{id:'two',name:'Bình (mẫu)',days:Array.from({length:7},()=>[])}]};
  assert.equal((await call('/api/manager/publish',payload,'bad')).code,401);
  const first=await call('/api/manager/publish',payload);assert.equal(first.code,200);const a=first.data.links.find(x=>x.id==='one').key,b=first.data.links.find(x=>x.id==='two').key;
  const teamKey=(await call('/api/manager/team-link')).data.key;
  assert.equal(teamKey,first.data.teamKey);
  const shared=await call('/api/team',null,teamKey);assert.equal(shared.data.weeks[0].people.length,2);
  assert.ok(!JSON.stringify(shared.data).includes('PRIVATE'));assert.ok(!JSON.stringify(shared.data).includes('SECRET'));
  assert.equal((await call('/api/team',null,a)).code,401);
  assert.equal((await call('/api/manager/publish',payload,teamKey)).code,401);
  let me=await call('/api/me',null,a);assert.equal(me.code,200);assert.equal(me.cache,'no-store');assert.equal(me.data.weeks[0].days[0][0].hours,5.5);
  for(const secret of ['PRIVATE','SECRET','rate','phone','Bình'])assert.ok(!JSON.stringify(me.data).includes(secret));
  assert.equal((await call('/api/manager/publish',payload,a)).code,401);
  assert.equal((await call('/api/me?id=one',null,b)).data.weeks[0].name,'Bình (mẫu)');
  const draft=structuredClone(payload);draft.people[0].days[0][0].label='12h30-17h30';
  assert.equal((await call('/api/me',null,a)).data.weeks[0].days[0][0].label,'7h-12h30');
  await call('/api/manager/publish',draft);assert.equal((await call('/api/me',null,a)).data.weeks[0].days[0][0].label,'12h30-17h30');
  draft.week='2026-09-07';await call('/api/manager/publish',draft);assert.equal((await call('/api/me',null,a)).data.weeks.length,2);
  const invalid=structuredClone(draft);invalid.week='2026-09-08';assert.equal((await call('/api/manager/publish',invalid)).code,400);
  const unsafe=structuredClone(draft);unsafe.people[0].id='__proto__';assert.equal((await call('/api/manager/publish',unsafe)).code,400);
  assert.equal((await call('/api/manager/rotate',{id:'constructor'})).code,404);
  const rotation=await call('/api/manager/rotate',{id:'one'});assert.equal((await call('/api/me',null,a)).code,401);assert.equal((await call('/api/me',null,rotation.data.key)).code,200);
  for(const file of ['/.server-data/published.json','/server.cjs','/tests/publishing.cjs','/.git/config'])assert.equal((await fetch(base+file)).status,404);
  assert.ok(!fs.readFileSync(path.join(dir,'published.json'),'utf8').includes('SECRET'));
  await stop();base=await boot();assert.equal((await call('/api/me',null,rotation.data.key)).data.weeks.length,2);
  assert.equal((await call('/api/manager/team-link')).data.key,teamKey);
  assert.equal((await call('/api/team',null,teamKey)).data.weeks.length,2);
  assert.equal((await fetch(base+'/employee.html')).status,200);
  console.log('PASS: manager authorization, per-employee isolation, privacy whitelist, drafts vs publication, republish, old weeks, revocation, invalid week, restart persistence, static file allowlist.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{if(server?.listening)await stop();fs.rmSync(dir,{recursive:true,force:true});});
