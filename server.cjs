// Single-process, single-branch publishing server. No third-party dependencies.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const ROOT=__dirname;
const token=()=>crypto.randomBytes(32).toString('hex');
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
function cleanText(x,max=120){if(typeof x!=='string'||!x.trim()||x.length>max)throw Error('Thông tin không hợp lệ');return x.trim();}
function validWeek(x){if(!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;const d=new Date(x+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===x&&d.getUTCDay()===1;}
function sanitizePublication(body){
  if(!body||!validWeek(body.week)||!Array.isArray(body.people)||body.people.length>300)throw Error('Tuần hoặc danh sách không hợp lệ');
  const seen=new Set();
  return {week:body.week,branch:cleanText(body.branch),people:body.people.map(p=>{
    const id=cleanText(p.id,100);if(['__proto__','constructor','prototype'].includes(id)||seen.has(id)||!Array.isArray(p.days)||p.days.length!==7)throw Error('Mã nhân viên không hợp lệ, bị trùng hoặc thiếu ngày');seen.add(id);
    return {id,name:cleanText(p.name),days:p.days.map(day=>{
      if(!Array.isArray(day)||day.length>12)throw Error('Ca không hợp lệ');
      return day.map(s=>{if(!Number.isFinite(s.hours)||s.hours<0||s.hours>24)throw Error('Giờ công không hợp lệ');return {label:cleanText(s.label,60),pos:typeof s.pos==='string'?s.pos.slice(0,100):'',hours:s.hours,bike:s.bike===true};});
    })};
  })};
}
function createServer({dataDir=path.join(process.env.LOCALAPPDATA||require('node:os').homedir(),'CaHoiCS3-server'),adminToken}={}){
  fs.mkdirSync(dataDir,{recursive:true});
  const keyFile=path.join(dataDir,'manager-key.txt'),dbFile=path.join(dataDir,'published.json');
  if(!adminToken){if(!fs.existsSync(keyFile))fs.writeFileSync(keyFile,token(),{mode:0o600,flag:'wx'});adminToken=fs.readFileSync(keyFile,'utf8').trim();}
  if(adminToken.length<32)throw Error('Manager key must be at least 32 characters');
  let state=fs.existsSync(dbFile)?JSON.parse(fs.readFileSync(dbFile,'utf8')):{weeks:{},people:{}};
  function persist(next){const temp=dbFile+'.tmp';fs.writeFileSync(temp,JSON.stringify(next),{mode:0o600});fs.renameSync(temp,dbFile);state=next;}
  // Persist the shared link independently of the manager credential and weekly publications.
  if(!state.teamKey){const next=structuredClone(state);next.teamKey=crypto.createHmac('sha256',adminToken).update('cahoi-team-readonly-v1').digest('hex');persist(next);}
  const files=new Map(['index.html','ui.css','iphone.css','minimal.css','ui.js','history.js','publishing.js','employee.html','employee.css','employee.js','sw.js','manifest.webmanifest','preview.html','DangKyCa-CoSo3.xlsx','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'].map(f=>['/'+f,f]));
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
  files.set('/soft.css','soft.css');
  files.set('/snapshot.js','snapshot.js');
  files.set('/cloud-config.js','cloud-config.js');
  const failures=new Map();
  const server=http.createServer(async(req,res)=>{
    const send=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','SAMEORIGIN');
    let url;try{url=new URL(req.url,'http://local');}catch{return send(400,{error:'Địa chỉ không hợp lệ'});}
    if(url.pathname==='/api/health')return send(200,{ok:true});
    if(url.pathname.startsWith('/api/')){
      const ip=req.socket.remoteAddress,now=Date.now(),limit=failures.get(ip);
      if(limit&&now<limit.until&&limit.count>=30)return send(429,{error:'Thử lại sau một phút'});
      const supplied=(req.headers.authorization||'').replace(/^Bearer /,'');
      const admin=digest(supplied)===digest(adminToken);
      const teamKey=state.teamKey;
      const team=digest(supplied)===digest(teamKey);
      const isManager=url.pathname.startsWith('/api/manager/');
      const person=Object.entries(state.people).find(([,p])=>p.keyHash===digest(supplied));
      if((isManager&&!admin)||(!isManager&&!(url.pathname==='/api/team'?team:person))){
        const entry=limit&&now<limit.until?limit:{count:0,until:now+60000};entry.count++;failures.set(ip,entry);if(failures.size>5000)failures.clear();return send(401,{error:'Mã truy cập không đúng hoặc link đã được thay mới'});
      }
      if(req.method==='GET'&&url.pathname==='/api/manager/status')return send(200,{weeks:Object.keys(state.weeks).sort().reverse()});
      if(req.method==='GET'&&url.pathname==='/api/manager/team-link')return send(200,{key:teamKey});
      if(req.method==='GET'&&url.pathname==='/api/team')return send(200,{weeks:Object.values(state.weeks).sort((a,b)=>b.week.localeCompare(a.week)).map(w=>({week:w.week,branch:w.branch,publishedAt:w.publishedAt,people:w.people.map(p=>({id:p.id,name:p.name,days:p.days}))}))});
      if(req.method==='GET'&&url.pathname==='/api/me'){
        const [id]=person;const weeks=Object.values(state.weeks).sort((a,b)=>b.week.localeCompare(a.week)).filter(w=>w.people.some(p=>p.id===id)).map(w=>{const p=w.people.find(p=>p.id===id);return {week:w.week,branch:w.branch,publishedAt:w.publishedAt,name:p.name,days:p.days};});
        return send(200,{weeks});
      }
      if(req.method!=='POST'||!isManager)return send(405,{error:'Không hỗ trợ thao tác này'});
      if(req.headers['content-type']?.split(';')[0]!=='application/json')return send(415,{error:'Cần dữ liệu JSON'});
      let body;try{let text='',size=0;for await(const chunk of req){size+=chunk.length;if(size>2*1024*1024){send(413,{error:'Dữ liệu quá lớn'});req.resume();return;}text+=chunk;}body=JSON.parse(text);}catch{return send(400,{error:'Không đọc được dữ liệu'});}
      try{
        if(url.pathname==='/api/manager/publish'){
          const pub=sanitizePublication(body);const next=structuredClone(state);const links=[];
          for(const p of pub.people){if(!Object.hasOwn(next.people,p.id)){const key=token();next.people[p.id]={name:p.name,keyHash:digest(key)};links.push({id:p.id,name:p.name,key});}else next.people[p.id].name=p.name;}
          pub.publishedAt=new Date().toISOString();next.weeks[pub.week]=pub;persist(next);
          return send(200,{week:pub.week,publishedAt:pub.publishedAt,links,teamKey,people:pub.people.map(p=>({id:p.id,name:p.name}))});
        }
        if(url.pathname==='/api/manager/rotate'){
          const id=cleanText(body.id,100);if(!Object.hasOwn(state.people,id))return send(404,{error:'Chưa có nhân viên này trên máy chủ'});
          const key=token(),next=structuredClone(state);next.people[id].keyHash=digest(key);persist(next);return send(200,{id,name:next.people[id].name,key});
        }
        return send(404,{error:'Không tìm thấy'});
      }catch(e){if(e.code){console.error('Publication write failed:',e.code);return send(500,{error:'Máy chủ chưa lưu được. Bản đã gửi trước vẫn được giữ.'});}return send(400,{error:e.message});}
    }
    if(req.method!=='GET'&&req.method!=='HEAD')return send(405,{error:'Không hỗ trợ'});
    const file=files.get(url.pathname==='/'?'/index.html':url.pathname);
    if(!file)return send(404,{error:'Không tìm thấy'});
    res.setHeader('Cache-Control','no-cache');res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
    if(req.method==='HEAD')return res.end();fs.createReadStream(path.join(ROOT,file)).on('error',()=>{if(!res.headersSent)res.writeHead(404);res.end();}).pipe(res);
  });
  return server;
}
if(require.main===module){const server=createServer({dataDir:process.env.CAHOI_DATA_DIR,adminToken:process.env.CAHOI_MANAGER_KEY});server.listen(Number(process.env.PORT||4180),process.env.HOST||'127.0.0.1',()=>console.log('Ca Hoi publishing server ready. Default URL: http://127.0.0.1:4180'));}
module.exports={createServer,sanitizePublication};
