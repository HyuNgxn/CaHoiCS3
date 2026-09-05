// Isolated local preview with fictitious staff. Never reads the manager's browser data.
const {createServer}=require('../server.cjs');const path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
const dataDir=path.join(process.env.LOCALAPPDATA||require('node:os').homedir(),'CaHoiCS3-preview');
fs.mkdirSync(dataDir,{recursive:true});const keyPath=path.join(dataDir,'manager-key.txt');if(!fs.existsSync(keyPath))fs.writeFileSync(keyPath,crypto.randomBytes(32).toString('hex'),{mode:0o600});
const server=createServer({dataDir});server.listen(4180,'127.0.0.1',async()=>{
  const base='http://127.0.0.1:4180',key=fs.readFileSync(keyPath,'utf8').trim(),headers={Authorization:'Bearer '+key,'Content-Type':'application/json'};
  const d=new Date();d.setDate(d.getDate()-(d.getDay()+6)%7);const week=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  const linkFile=path.join(dataDir,'employee-demo-link.txt');
  if(!fs.existsSync(linkFile)){
    const body={week,branch:'Cá Hồi · Dữ liệu mẫu',people:[{id:'preview-person',name:'Nhật Minh (minh hoạ)',days:Array.from({length:7},(_,i)=>i===6?[]:[{label:i%2?'12h30-17h30':'7h-12h30',hours:i%2?5:5.5,pos:'Phục vụ',bike:i===2}])}]};
    const response=await fetch(base+'/api/manager/publish',{method:'POST',headers,body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw Error(result.error);
    fs.writeFileSync(linkFile,base+'/employee.html#'+result.links[0].key,{mode:0o600});
  }
  console.log('Manager preview: '+base+'/?demo=1');console.log('Employee preview: '+fs.readFileSync(linkFile,'utf8'));console.log('Demo manager key stays in '+keyPath);
});
