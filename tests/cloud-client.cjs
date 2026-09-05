const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),session=new Map(),local=new Map();let request;
const ctx=vm.createContext({URL,AbortSignal,console,sessionStorage:{getItem:k=>session.get(k),setItem:(k,v)=>session.set(k,v)},localStorage:{setItem:(k,v)=>local.set(k,v)},toast:()=>{},fetch:async(url,options)=>{request={url,options};return {ok:true,headers:{get:()=> 'application/json'},json:async()=>({key:'test-shared-key'})};}});
vm.runInContext(fs.readFileSync(path.join(root,'cloud-config.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'publishing.js'),'utf8'),ctx);
(async()=>{
 session.set('xepca_manager_key','test-only-not-a-production-key');
 await ctx.managerRequest('team-link');
 assert.equal(request.url,'https://lich-boi-api.huydang-work1.workers.dev/api/manager/team-link');assert.equal(request.options.headers.Authorization,'Bearer test-only-not-a-production-key');assert.equal(request.options.cache,'no-store');
 ctx.rememberManagerKey();assert.equal(local.get('lich_boi_manager_key'),session.get('xepca_manager_key'));
 assert.equal(new URL('employee.html','https://hyungxn.github.io/CaHoiCS3/index.html').pathname,'/CaHoiCS3/employee.html');
 const html=fs.readFileSync(path.join(root,'employee.html'),'utf8');assert.ok(html.indexOf('cloud-config.js')<html.indexOf('employee.js'));
 ctx.fetch=async()=>({ok:false,headers:{get:()=> 'application/json'},json:async()=>({error:'Mã quản lý không đúng'})});await assert.rejects(()=>ctx.managerRequest('publish',{}),/Mã quản lý không đúng/);
 console.log('PASS: cloud endpoint, authorization, persisted key, GitHub Pages subpath, script order, rejection handling.');
})().catch(e=>{console.error(e);process.exitCode=1;});
