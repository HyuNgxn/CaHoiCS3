/* Lịch bơi — Cloudflare Worker + D1
 * Bindings required:
 *   DB        D1 database: lich-boi-db
 * Secret required:
 *   MANAGER_KEY (random private value, at least 32 characters)
 */
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'GET,POST,OPTIONS',...extra}});
const digest=async value=>{const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');};
const token=()=>crypto.randomUUID().replaceAll('-','')+crypto.randomUUID().replaceAll('-','');
const clean=(v,max=160)=>typeof v==='string'&&v.trim()&&v.length<=max?v.trim():null;
const validWeek=w=>{if(typeof w!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(w))return false;const d=new Date(`${w}T12:00:00Z`);return Number.isFinite(+d)&&d.toISOString().slice(0,10)===w&&d.getUTCDay()===1;};
function sanitize(body){
  if(!body||!validWeek(body.week)||!clean(body.branch)||!Array.isArray(body.people)||body.people.length>300)throw Error('Dữ liệu tuần không hợp lệ');
  const ids=new Set();
  return {week:body.week,branch:clean(body.branch),people:body.people.map(p=>{
    const id=clean(p.id,100),name=clean(p.name,120);if(!id||!name||ids.has(id)||['__proto__','constructor','prototype'].includes(id)||!Array.isArray(p.days)||p.days.length!==7)throw Error('Nhân viên hoặc ngày không hợp lệ');ids.add(id);
    return {id,name,days:p.days.map(day=>{if(!Array.isArray(day)||day.length>12)throw Error('Ca không hợp lệ');return day.map(s=>{if(!clean(s.label,60)||!Number.isFinite(s.hours)||s.hours<0||s.hours>24)throw Error('Khung giờ không hợp lệ');return {label:s.label.trim(),pos:typeof s.pos==='string'?s.pos.slice(0,100):'',hours:s.hours,bike:s.bike===true};});})};
  })};
}
async function init(env){
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS published_weeks (week TEXT PRIMARY KEY, branch TEXT NOT NULL, schedule_json TEXT NOT NULL, published_at TEXT NOT NULL)`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`).run();
  const row=await env.DB.prepare(`SELECT value FROM settings WHERE key='team_key'`).first();
  if(!row){await env.DB.prepare(`INSERT OR IGNORE INTO settings (key,value) VALUES ('team_key',?)`).bind(token()).run();return (await env.DB.prepare(`SELECT value FROM settings WHERE key='team_key'`).first()).value;}return row.value;
}
async function manager(request,env,url){
  const supplied=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
  if(typeof env.MANAGER_KEY!=='string'||env.MANAGER_KEY.length<32)return json({error:'Chưa cấu hình MANAGER_KEY đủ 32 ký tự'},503);
  if(supplied.length>256||await digest(supplied)!==await digest(env.MANAGER_KEY))return json({error:'Mã quản lý không đúng'},401);
  if(request.method==='GET'&&url.pathname==='/api/manager/team-link')return json({key:await init(env)});
  if(request.method!=='POST')return json({error:'Không hỗ trợ thao tác này'},405);
  if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Cần dữ liệu JSON'},415);
  let body;try{const reader=request.body?.getReader();if(!reader)throw Error();const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>524288){await reader.cancel();return json({error:'Lịch quá lớn (tối đa 512 KB)'},413);}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}body=JSON.parse(new TextDecoder().decode(bytes));}catch{return json({error:'Dữ liệu JSON không hợp lệ'},400);}
  if(url.pathname==='/api/manager/publish'){
    try{const pub=sanitize(body),at=new Date().toISOString();await init(env);await env.DB.prepare(`INSERT INTO published_weeks (week,branch,schedule_json,published_at) VALUES (?,?,?,?) ON CONFLICT(week) DO UPDATE SET branch=excluded.branch,schedule_json=excluded.schedule_json,published_at=excluded.published_at`).bind(pub.week,pub.branch,JSON.stringify(pub.people),at).run();return json({week:pub.week,publishedAt:at,teamKey:await init(env),people:pub.people.map(p=>({id:p.id,name:p.name})),links:[]});}catch(e){return json({error:e.message||'Không lưu được lịch'},400);}
  }
  return json({error:'Không tìm thấy'},404);
}
async function team(env){
  const rows=await env.DB.prepare(`SELECT week,branch,schedule_json,published_at FROM published_weeks ORDER BY week DESC`).all();
  return {weeks:(rows.results||[]).map(r=>({week:r.week,branch:r.branch,publishedAt:r.published_at,people:JSON.parse(r.schedule_json)}))};
}
export default {async fetch(request,env){
  if(request.method==='OPTIONS')return new Response(null,{headers:{'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'GET,POST,OPTIONS'}});
  const url=new URL(request.url);try{
    // Public shared entry, intentionally readable by the whole team. Never grants write access.
    if(request.method==='GET'&&url.pathname==='/lich'){
      const teamKey=await init(env);
      const viewer=new URL(env.VIEWER_URL||'https://hyungxn.github.io/CaHoiCS3/employee.html');
      if(viewer.protocol!=='https:')return json({error:'VIEWER_URL phải dùng HTTPS'},503);
      viewer.hash='team='+teamKey;
      return Response.redirect(viewer.href,302);
    }
    if(url.pathname.startsWith('/api/manager/'))return await manager(request,env,url);
    if(url.pathname==='/api/team'&&request.method==='GET'){
      const supplied=(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');if(!/^[a-f0-9]{64}$/.test(supplied))return json({error:'Link xem lịch không đúng'},401);const teamKey=await init(env);if(await digest(supplied)!==await digest(teamKey))return json({error:'Link xem lịch không đúng'},401);return json(await team(env));
    }
    if(url.pathname==='/api/health'){await env.DB.prepare('SELECT week FROM published_weeks LIMIT 1').all();return json({ok:true,database:true,shortLinkReady:true,managerConfigured:typeof env.MANAGER_KEY==='string'&&env.MANAGER_KEY.length>=32});}
    if(url.pathname==='/')return json({message:'Lịch bơi API · Ver 2.0'});
    return json({error:'Không tìm thấy'},404);
  }catch(e){return json({error:'Lỗi máy chủ. Dữ liệu cũ vẫn được giữ.'},500);}
}};
