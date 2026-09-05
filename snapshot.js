/* Portable, read-only weekly snapshot. No network or credentials are used. */
(function(root){
  const LIMIT=16000;
  function pack(publication){
    const types=[];
    const people=publication.people.map((p,i)=>[p.name,p.days.map(day=>day.map(s=>{
      const tuple=[s.label,s.pos,s.hours,s.bike?1:0],key=JSON.stringify(tuple);let n=types.findIndex(t=>JSON.stringify(t)===key);if(n<0){n=types.length;types.push(tuple);}return n;
    }))]);
    const compact=[1,publication.week,publication.branch,publication.publishedAt||new Date().toISOString(),types,people];
    const bytes=new TextEncoder().encode(JSON.stringify(compact));let binary='';for(const b of bytes)binary+=String.fromCharCode(b);
    const encoded=btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    if(encoded.length>LIMIT)throw Error('Lịch quá lớn để gửi bằng link. Hãy dùng Lưu ảnh lịch cho tuần này.');
    return encoded;
  }
  function unpack(encoded){
    if(typeof encoded!=='string'||encoded.length>LIMIT||! /^[A-Za-z0-9_-]+$/.test(encoded))throw Error('Link lịch không hợp lệ hoặc quá dài');
    const raw=atob(encoded.replace(/-/g,'+').replace(/_/g,'/'));
    const d=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0))));
    const str=(v,n)=>typeof v==='string'&&v.length<=n;
    if(!Array.isArray(d)||d[0]!==1||!/^\d{4}-\d{2}-\d{2}$/.test(d[1])||!str(d[2],120)||!str(d[3],40)||!Number.isFinite(Date.parse(d[3]))||!Array.isArray(d[4])||d[4].length>500||!Array.isArray(d[5])||d[5].length>300)throw Error('Dữ liệu lịch không hợp lệ');
    const date=new Date(d[1]+'T12:00:00Z');if(!Number.isFinite(+date)||date.toISOString().slice(0,10)!==d[1]||date.getUTCDay()!==1)throw Error('Tuần không hợp lệ');
    const types=d[4].map(t=>{if(!Array.isArray(t)||!str(t[0],60)||!str(t[1],100)||!Number.isFinite(t[2])||t[2]<0||t[2]>24||![0,1].includes(t[3]))throw Error('Ca không hợp lệ');return {label:t[0],pos:t[1],hours:t[2],bike:!!t[3]};});
    return {week:d[1],branch:d[2],publishedAt:d[3],people:d[5].map((p,i)=>{
      if(!Array.isArray(p)||!str(p[0],120)||!Array.isArray(p[1])||p[1].length!==7)throw Error('Nhân viên không hợp lệ');
      return {id:String(i),name:p[0],days:p[1].map(day=>{if(!Array.isArray(day)||day.length>12)throw Error('Ngày không hợp lệ');return day.map(n=>{if(!Number.isInteger(n)||!types[n])throw Error('Ca không hợp lệ');return {...types[n]};});})};
    })};
  }
  root.ScheduleSnapshot={pack,unpack,LIMIT};
})(globalThis);
