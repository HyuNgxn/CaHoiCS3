/* Manager key stays in this browser session; employee links stay on the manager device. */
function publicationPayload(mon){return {week:weekKey(mon),branch:DB.settings.branch||'Cá Hồi',people:DB.employees.map(e=>({id:e.id,name:e.name,days:Array.from({length:7},(_,d)=>cellShifts(mon,e.id,d).map(c=>{const t=typeById(c.typeId);if(!t)throw Error('Có ca thiếu khung giờ. Hãy kiểm tra lại lịch trước khi gửi.');return {label:t.label,pos:c.pos||'',hours:t.hours,bike:!!c.bike};}))}))};}
const publicationKey=()=>DEMO_MODE?'xepca_demo_employee_links':'xepca_employee_links';
function getEmployeeLinks(){try{return JSON.parse(localStorage.getItem(publicationKey()))||{};}catch{return {};}}
async function managerRequest(route,data){
  const key=sessionStorage.getItem('xepca_manager_key')||'';
  let r;try{r=await fetch(LICH_BOI_API+'/api/manager/'+route,{method:data?'POST':'GET',headers:{Authorization:'Bearer '+key,...(data?{'Content-Type':'application/json'}:{})},body:data?JSON.stringify(data):undefined,cache:'no-store',signal:AbortSignal.timeout(20000)});}catch{throw Error('Không kết nối được máy chủ. Bản lịch trên máy vẫn được giữ.');}
  if(!r.headers.get('content-type')?.includes('application/json'))throw Error('Trang hiện tại chưa có máy chủ chia sẻ lịch. Hãy mở ứng dụng từ địa chỉ máy chủ được hướng dẫn.');
  const result=await r.json();if(!r.ok)throw Error(result.error||'Chưa gửi được lịch');return result;
}
function openPublishSheet(){
  if(DEMO_MODE){sheet.innerHTML='<h2>Bản xem thử</h2><p>Dữ liệu mẫu không được gửi vào lịch thật trên Cloudflare. Mở bản sử dụng để gửi lịch của quán.</p><button class="btn wide" onclick="openSnapshotShare()">Chia sẻ bản mẫu để thử</button>';openSheet();return;}
  const saved=localStorage.getItem('lich_boi_manager_key');
  if(saved)sessionStorage.setItem('xepca_manager_key',saved);
  openServerPublishSheet();
  const input=document.getElementById('managerKey');
  const note=input.closest('.field').nextElementSibling;
  note.textContent='Thiết lập một lần trên iPhone quản lý. Mã được ghi nhớ trên trình duyệt này; không gửi cho nhân viên.';
  if(saved){input.closest('.field').hidden=true;note.innerHTML='Đã kết nối thiết bị quản lý. <button class="link" id="changeCloudKey">Đổi / quên mã</button>';document.getElementById('changeCloudKey').onclick=()=>{localStorage.removeItem('lich_boi_manager_key');sessionStorage.removeItem('xepca_manager_key');openPublishSheet();};}
}
function openServerPublishSheet(){
  const mon=new Date(curMonday);let payload;try{payload=publicationPayload(mon);}catch(e){toast(e.message);return;}
  sheet.innerHTML=`<div class="grip"></div><h2>Gửi lịch cho nhân viên</h2><div class="sub">Tuần ${dmShort(mon)} – ${dmShort(addDays(mon,6))}</div><p>${payload.people.length} nhân viên · Chỉ gửi tên, ca làm, vị trí và giờ công. Không gửi lương, số điện thoại hoặc ghi chú riêng.</p><p class="muted">Nhân viên sẽ thấy bản này sau khi bạn xác nhận. Chỉnh sửa sau đó chỉ nằm trên máy quản lý cho đến lần gửi tiếp theo.</p>${DEMO_MODE?'<p class="warnbox">Đang ở bản mẫu. Chỉ dùng để thử máy chủ, không gửi link mẫu cho nhân viên thật.</p>':''}<div class="field"><label for="managerKey">Mã quản lý máy chủ</label><input type="password" id="managerKey" autocomplete="off" placeholder="Nhập mã được cấp khi cài máy chủ"></div><p style="font-size:12px" class="muted">Không đưa mã này cho nhân viên. Mã chỉ được giữ trong phiên trình duyệt hiện tại.</p><p id="publishError" role="alert"></p><button class="btn wide" id="publishConfirm">Xác nhận gửi lịch tuần này</button><button class="btn ghost wide" id="employeeLinks" style="margin-top:10px">Xem link nhân viên đã tạo</button>`;
  document.getElementById('managerKey').value=sessionStorage.getItem('xepca_manager_key')||'';
  document.getElementById('publishConfirm').onclick=async()=>{
    const button=document.getElementById('publishConfirm'),error=document.getElementById('publishError');
    const key=document.getElementById('managerKey').value.trim();if(key.length<32){error.textContent='Nhập mã quản lý máy chủ trước khi gửi.';document.getElementById('managerKey').focus();return;}
    if(!payload.people.length){error.textContent='Chưa có nhân viên để gửi lịch.';return;}
    sessionStorage.setItem('xepca_manager_key',key);button.disabled=true;button.textContent='Đang gửi…';error.textContent='';
    try{const result=await managerRequest('publish',payload);
      rememberManagerKey();
      showTeamLink(result.teamKey,`Đã gửi lịch ${dmShort(mon)} – ${dmShort(addDays(mon,6))}.`);
    }catch(e){error.textContent=e.message;button.disabled=false;button.textContent='Thử gửi lại';}
  };
  document.getElementById('employeeLinks').textContent='Lấy link chung cho cả đội';
  document.getElementById('employeeLinks').onclick=async()=>{sessionStorage.setItem('xepca_manager_key',document.getElementById('managerKey').value.trim());try{const result=await managerRequest('team-link');rememberManagerKey();showTeamLink(result.key);}catch(e){document.getElementById('publishError').textContent=e.message;}};openSheet();
}
function rememberManagerKey(){try{localStorage.setItem('lich_boi_manager_key',sessionStorage.getItem('xepca_manager_key'));}catch{toast('Đã kết nối nhưng trình duyệt không lưu được mã lâu dài.');}}
function openSnapshotShare(){
  let encoded,url;
  try{const payload=publicationPayload(curMonday);if(!payload.people.length)throw Error('Thêm nhân viên và xếp lịch trước khi chia sẻ.');encoded=ScheduleSnapshot.pack(payload);url=new URL('employee.html',location.href).href+'#snapshot='+encoded;}catch(e){toast(e.message);return;}
  sheet.innerHTML=`<div class="grip"></div><h2>Chia sẻ lịch tương tác</h2><div class="sub">${dmShort(curMonday)} – ${dmShort(addDays(curMonday,6))} · Bản cố định</div><p>Nhân viên mở link, chọn tên để xem ca. Không cần mã quản lý. Link chỉ chứa tên, ca, vị trí và giờ làm của tuần này.</p><p class="muted">Sửa lịch xong cần tạo và gửi link mới. Link cũ không tự cập nhật. Ai có link đều xem được lịch cả đội; đây không phải chữ ký xác thực của quản lý.</p><div class="field"><label for="snapshotLink">Link của bản lịch này</label><textarea id="snapshotLink" readonly style="width:100%;height:88px;font:16px inherit;overflow-wrap:anywhere"></textarea></div><button class="btn wide" id="copySnapshot">Sao chép link</button><a class="btn ghost wide" id="openSnapshot" target="_blank" rel="noopener" style="margin-top:10px;text-decoration:none">Mở xem thử</a><p id="snapshotFeedback" role="status" style="font-size:13px"></p>`;
  document.getElementById('snapshotLink').value=url;document.getElementById('openSnapshot').href=url;
  document.getElementById('copySnapshot').onclick=async()=>{try{await navigator.clipboard.writeText(url);document.getElementById('snapshotFeedback').textContent='Đã sao chép. Gửi nguyên link vào nhóm.';}catch{const input=document.getElementById('snapshotLink');input.focus();input.select();document.getElementById('snapshotFeedback').textContent='Chạm giữ link đã chọn để sao chép.';}};
  if(['localhost','127.0.0.1'].includes(location.hostname))document.getElementById('snapshotFeedback').textContent='Link localhost chỉ mở trên máy này. Muốn thử trên iPhone, mở bản quản lý từ địa chỉ Wi-Fi trước rồi tạo link tại đó.';
  openSheet();
}
function showTeamLink(key,message=''){
  // Always provide a working viewer URL; use the short redirect only once it is deployed.
  let url=new URL('employee.html',location.href).href+'#team='+key;
  sheet.innerHTML=`<div class="grip"></div><h2>Link chung của cả đội</h2><p role="status">${esc(message)}</p><p>Mọi nhân viên mở cùng link này, chọn tên và tuần để xem ca. Không cần tạo link từng người.</p><div class="field"><label for="teamLink">Link xem lịch</label><input id="teamLink" readonly value="${esc(url)}"></div><button class="btn wide" id="copyTeamLink">Sao chép link chung</button><p class="muted" style="font-size:13px">Ai có link đều xem được lịch của mọi người. Chỉ có quyền xem, không có quyền sửa. Link giữ nguyên khi gửi lịch tuần mới.</p>`;
  document.getElementById('copyTeamLink').onclick=async()=>{try{await navigator.clipboard.writeText(url);toast('Đã sao chép link chung');}catch{const input=document.getElementById('teamLink');input.focus();input.select();toast('Chạm giữ link để sao chép');}};openSheet();
  const input=document.getElementById('teamLink');
  fetch(LICH_BOI_API+'/api/health',{cache:'no-store',signal:AbortSignal.timeout(5000)}).then(r=>r.json()).then(status=>{
    if(status.shortLinkReady===true&&input.isConnected){url=LICH_BOI_API+'/lich';input.value=url;}
  }).catch(()=>{});
}
function showEmployeeLinks(people,message=''){
  const links=getEmployeeLinks();
  sheet.innerHTML=`<div class="grip"></div><h2>Link xem lịch</h2><p role="status">${esc(message)}</p><p class="muted">Gửi riêng từng link cho đúng người. Ai có link đều xem được lịch người đó. “Đổi link” làm link cũ hết hiệu lực.</p><div id="linkRows"></div><p id="linksError" role="alert"></p>`;
  const rows=document.getElementById('linkRows');
  people.forEach(p=>{const box=document.createElement('div');box.className='card pad';box.style.marginBottom='12px';const title=document.createElement('b');title.textContent=p.name;box.append(title);
    const input=document.createElement('input');input.readOnly=true;input.setAttribute('aria-label','Link của '+p.name);input.style.cssText='width:100%;font-size:16px;margin:10px 0;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink)';input.value=links[p.id]?location.origin+'/employee.html#'+links[p.id].key:'';input.placeholder='Chưa có link trên máy này';box.append(input);
    const copy=document.createElement('button');copy.className='btn ghost';copy.textContent='Sao chép';copy.disabled=!input.value;copy.onclick=async()=>{try{await navigator.clipboard.writeText(input.value);toast('Đã sao chép link của '+p.name);}catch{input.focus();input.select();toast('Chạm giữ link đã chọn để sao chép');}};box.append(copy);
    const rotate=document.createElement('button');rotate.className='btn ghost';rotate.style.marginLeft='8px';rotate.textContent=input.value?'Đổi link':'Tạo lại link';rotate.onclick=async()=>{if(!confirm('Tạo link mới cho '+p.name+'? Link cũ sẽ không dùng được nữa.'))return;rotate.disabled=true;try{const r=await managerRequest('rotate',{id:p.id});const all=getEmployeeLinks();all[p.id]={name:r.name,key:r.key};localStorage.setItem(publicationKey(),JSON.stringify(all));showEmployeeLinks(people,'Đã đổi link của '+p.name);}catch(e){document.getElementById('linksError').textContent=e.message;rotate.disabled=false;}};box.append(rotate);rows.append(box);
  });openSheet();
}
