/* Presentation helpers. Scheduling and real data retain their original storage key. */
function uiIcon(name){
  const paths={
    calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-3-5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    wallet:'<path d="M20 8V5H6a3 3 0 0 0 0 6h15v8H6a3 3 0 0 1-3-3V8M21 11h-5v5h5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    sync:'<path d="M20 7v5h-5M4 17v-5h5M5.5 8a7 7 0 0 1 12-3L20 8M4 16l2.5 3a7 7 0 0 0 12-3"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/>',
    afternoon:'<path d="M3 17h18M5 21h14M6 17a6 6 0 0 1 12 0M12 3v3M3 9l2 2M21 9l-2 2"/>',
    moon:'<path d="M20.5 13.5A9 9 0 0 1 10.5 3a9 9 0 1 0 10 10.5Z"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    edit:'<path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5ZM12 20h8"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    pin:'<path d="m9 3 9 9-3 1-3 4-5-5 4-3-2-6ZM8 16l-5 5"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
    file:'<path d="M14 3H5v18h14V8l-5-5v5h5M8 13h8M8 17h5"/>'
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.calendar}</svg>`;
}

function renderPageHeader(tab){
  const content={
    week:['Lịch làm','Chọn ngày để xem và chỉnh ca.'],
    today:['Hôm nay tại quán','Ai đang làm, ai sắp đến — nắm lịch trong một ánh nhìn.'],
    staff:['Nhân viên','Tên, vị trí và giờ làm của từng người.'],
    leave:['Nghỉ & về sớm','Theo dõi ngày vắng để chủ động sắp xếp người thay.'],
    settings:['Thêm','Chỉ mở mục bạn cần thay đổi.']
  };
  let actions='';
  if(tab==='week') actions=`<button class="btn ghost" onclick="exportWeekImage()">${uiIcon('download')} Lưu ảnh lịch</button><button class="btn" onclick="openSimpleSchedule()">${uiIcon('calendar')} Xếp lịch tuần</button>`;
  if(tab==='staff') actions=`<button class="btn" onclick="openEmpSheet()">${uiIcon('plus')} Thêm nhân viên</button>`;
  if(tab==='leave') actions=`<button class="btn" onclick="openLeaveSheet()">${uiIcon('plus')} Thêm đơn</button>`;
  if(tab==='today') actions=`<button class="btn ghost" onclick="go('week')">${uiIcon('calendar')} Xem lịch tuần</button>`;
  if(tab==='settings') actions='<span class="autosave-note">Thay đổi được lưu khi rời ô nhập</span>';
  document.getElementById('pageHeader').innerHTML=(DEMO_MODE?'<div class="demo-banner"><span><b>Chế độ xem thử</b> · Dữ liệu minh hoạ, tách biệt dữ liệu thật.</span><a href="./#week">Về bản của tôi '+uiIcon('arrow')+'</a></div>':'')+`<div class="page-heading"><div><div class="eyebrow">CÁ HỒI / KHÔNG GIAN LÀM VIỆC</div><h1>${content[tab][0]}</h1><p>${content[tab][1]}</p></div><div class="page-actions">${actions}</div></div>`;
  document.getElementById('sideBranch').textContent=DB.settings.branch||'Cơ sở 3';
  document.getElementById('fabBtn').setAttribute('aria-label',tab==='staff'?'Thêm nhân viên':'Thêm đơn nghỉ hoặc về sớm');
}

function weekSummary(mon){
  let shifts=0,hours=0,pay=0,assigned=0;
  DB.employees.forEach(e=>{let n=0;for(let d=0;d<7;d++)n+=cellShifts(mon,e.id,d).length;shifts+=n;if(n)assigned++;const h=weekHours(mon,e.id);hours+=h;pay+=h*(e.rate||0);});
  const metrics=[['users',DB.employees.length,'Thành viên',`${assigned} người có lịch tuần này`],['calendar',shifts,'Lượt ca đã xếp','Trong tuần đang xem'],['clock',fmtH(hours),'Tổng giờ công','Theo các ca đã phân công'],['wallet',money(pay),'Lương dự kiến','Chưa trừ thời gian về sớm']];
  return `<details class="week-totals"><summary>${uiIcon('clock')}<span>${shifts} lượt ca · ${fmtH(hours)}</span><span class="summary-more">Tổng kết tuần</span></summary><p class="muted" style="font-size:13px;padding:0 12px">${weekHistoryStatus(DB,weekKey(mon))}<br>Lịch được giữ riêng theo tuần. Sửa tiếp sẽ tính lại mốc 24 giờ.</p><div class="week-summary">`+metrics.map(([icon,value,label,note])=>`<div class="metric"><div class="metric-top"><span>${label}</span>${uiIcon(icon)}</div><strong class="tnum">${value}</strong><small>${note}</small></div>`).join('')+'</div></details>';
}

function renderPeopleSchedule(mon){
  if(!DB.employees.length)return '<div class="onboarding"><div class="empty-calendar">'+uiIcon('users')+'</div><h2>Đội ngũ của bạn sẽ ở đây</h2><p>Thêm nhân viên để bắt đầu phân công lịch tuần.</p><button class="btn" onclick="go(\'staff\');openEmpSheet()">Thêm nhân viên</button></div>';
  const today=ymd(new Date());
  let html='<div class="people-table-wrap"><table class="people-table"><caption class="sr-only">Lịch tuần theo nhân viên. Chọn một ô để chỉnh ca của ngày đó.</caption><thead><tr><th scope="col">Nhân viên</th>';
  for(let d=0;d<7;d++){const date=addDays(mon,d);html+=`<th scope="col" class="${ymd(date)===today?'is-today':''}">${DOW[d]}<b>${dmShort(date)}</b></th>`;}
  html+='<th scope="col">Giờ công</th></tr></thead><tbody>';
  DB.employees.forEach(e=>{
    html+=`<tr><th scope="row"><span class="mini-avatar">${esc(initials(e.name))}</span><b>${esc(e.name)}</b><small>${esc(e.pos||'Chưa chọn vị trí')}</small></th>`;
    for(let d=0;d<7;d++){
      const shifts=cellShifts(mon,e.id,d),leave=onLeave(ymd(addDays(mon,d)),e.id);
      const label=shifts.map(c=>typeById(c.typeId)?.label).filter(Boolean).join(', ')||'Chưa xếp ca';
      html+=`<td><button class="schedule-cell ${leave?'leave-cell':''}" data-cell-emp="${e.id}" data-cell-day="${d}" aria-label="${esc(e.name)}, ${DOW_FULL[d]}, ${label}${leave?', đã xin nghỉ':''}">`;
      html+=shifts.length?shifts.map(c=>{const s=typeById(c.typeId);return s?`<span class="table-shift bg-${shiftClass(s)}">${esc(s.label)}${c.bike?'<small>Giữ xe</small>':''}${c.lock?uiIcon('pin'):''}</span>`:'';}).join(''):`<span class="cell-placeholder">${leave?'Nghỉ':'＋'}</span>`;
      if(leave&&shifts.length)html+='<small class="danger-text">Đã xin nghỉ</small>';
      html+='</button></td>';
    }
    html+=`<td class="hours-cell">${fmtH(weekHours(mon,e.id))}</td></tr>`;
  });
  return '<div class="desktop-people">'+html+'</tbody></table></div><div class="schedule-foot">'+uiIcon('info')+' Chọn ô để thêm hoặc chỉnh ca.</div></div>'+renderMobilePeople(mon);
}

let selectedPerson='';
function renderMobilePeople(mon){
  const e=DB.employees.find(e=>e.id===selectedPerson)||DB.employees[0];
  if(!e)return '';
  return `<div class="mobile-people"><label for="personPicker">Xem lịch của</label><select id="personPicker" onchange="selectedPerson=this.value;renderWeek()">${DB.employees.map(p=>`<option value="${esc(p.id)}" ${p.id===e.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select><p class="person-total">${esc(e.pos||'Chưa chọn vị trí')} · ${fmtH(weekHours(mon,e.id))} trong tuần</p><div class="personal-days">${Array.from({length:7},(_,d)=>{
    const date=addDays(mon,d),leave=onLeave(ymd(date),e.id),shifts=cellShifts(mon,e.id,d);
    return `<button class="personal-day" data-person-emp="${esc(e.id)}" data-person-day="${d}"><span><b>${DOW[d]}</b><small>${dmShort(date)}</small></span><span>${shifts.length?shifts.map(c=>{const t=typeById(c.typeId);return t?`<span class="personal-shift bg-${shiftClass(t)}">${esc(t.label)}</span>`:'';}).join(''):'<span class="muted">'+(leave?'Đã xin nghỉ':'Chưa xếp ca')+'</span>'}${leave&&shifts.length?'<small class="danger-text">Đã xin nghỉ</small>':''}</span><span class="personal-edit">Sửa</span></button>`;
  }).join('')}</div></div>`;
}

let modalReturnFocus=null;
function openAccessibleSheet(){
  if(!sheet.classList.contains('show'))modalReturnFocus=document.activeElement;
  sheet.inert=false;
  if(!sheet.querySelector('.sheet-close')){
    const close=document.createElement('button');close.className='icon-btn sheet-close';close.setAttribute('aria-label','Đóng');close.innerHTML=uiIcon('close');close.onclick=closeSheet;sheet.prepend(close);
  }
  const heading=sheet.querySelector('h2');if(heading){heading.id='dialogTitle';sheet.setAttribute('aria-labelledby','dialogTitle');}
  enhanceView(sheet);
  document.getElementById('app').inert=true;document.querySelector('nav.tabs').inert=true;document.getElementById('fab').inert=true;
  document.body.classList.add('modal-open');backdrop.classList.add('show');
  requestAnimationFrame(()=>{sheet.classList.add('show');sheet.focus({preventScroll:true});});
}
function closeAccessibleSheet(){
  sheet.classList.remove('show');backdrop.classList.remove('show');sheet.inert=true;
  document.getElementById('app').inert=false;document.querySelector('nav.tabs').inert=false;document.getElementById('fab').inert=false;
  document.body.classList.remove('modal-open');
  if(modalReturnFocus?.isConnected)modalReturnFocus.focus({preventScroll:true});
}

function enhanceView(root){
  root.querySelectorAll('.field label').forEach(label=>{const input=label.parentElement.querySelector('input,select,textarea');if(input?.id)label.htmlFor=input.id;});
  root.querySelectorAll('button[title]').forEach(b=>{if(!b.hasAttribute('aria-label'))b.setAttribute('aria-label',b.title);});
  root.querySelectorAll('[data-editshift]').forEach(b=>b.setAttribute('aria-label','Sửa khung giờ '+(typeById(b.dataset.editshift)?.label||'')));
  root.querySelectorAll('.tgl').forEach(b=>{b.setAttribute('role','switch');b.setAttribute('aria-checked',b.classList.contains('on'));b.setAttribute('aria-label',b.parentElement.querySelector('b')?.textContent||'Bật/tắt');});
  root.querySelectorAll('.rq-in').forEach(i=>i.setAttribute('aria-label',`${typeById(i.dataset.st)?.label||''}, ${i.dataset.role}`));
  const settingLabels={setMinShifts:'Số ca tối thiểu mỗi tuần',setMaxShifts:'Số ca tối đa mỗi tuần',setMinToi:'Số ca tối tối thiểu',setMaxDay:'Số buổi tối đa mỗi ngày'};
  Object.entries(settingLabels).forEach(([id,label])=>{const el=root.querySelector('#'+id);if(el)el.setAttribute('aria-label',label);});
  root.querySelectorAll('[data-emp],[data-leave],[data-early]').forEach(el=>{if(el.tagName!=='BUTTON'){el.setAttribute('role','button');el.tabIndex=0;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}};}});
  root.querySelectorAll('.big').forEach(el=>{if(!el.querySelector('svg'))el.innerHTML=uiIcon(curTab==='staff'?'users':curTab==='leave'?'file':'calendar');});
  const menuIcons={aSync:'sync',aAuto:'spark',aExport:'download',aCopy:'calendar',aCsv:'file',aTpl:'download'};
  root.querySelectorAll('[data-a] .mic').forEach(el=>{if(!el.querySelector('svg'))el.innerHTML=uiIcon(menuIcons[el.parentElement.dataset.a]);});
  root.querySelectorAll('button .ui-icon,nav button svg').forEach(el=>el.setAttribute('aria-hidden','true'));
}

function makeDemoData(){
  const data=defaultData();
  const names=['Minh Anh','Hoàng Nam','Khánh Linh','Tuấn Khang','Ngọc Hân','Gia Huy','Thảo My','Đức Anh','Bảo Trân','Quốc Bảo','Phương Nhi','Nhật Minh','Thanh Vy','Hải Đăng','Yến Nhi','Minh Quân','Thu Hà','Anh Thư'];
  data.employees=names.map((name,i)=>({id:'demo-'+i,name,pos:i<6?'Pha chế':'Phục vụ',rate:i<6?28000:25000,phone:''}));
  const mon=mondayOf(new Date()),wk=ymd(mon);data.schedule[wk]={};data.availability={[wk]:{}};
  data.employees.forEach((e,i)=>{data.schedule[wk][e.id]={};data.availability[wk][e.id]={};for(let d=0;d<7;d++)data.availability[wk][e.id][d]=['m','a','e'];});
  for(let d=0;d<7;d++){
    const bar=data.employees.slice(0,6),floor=data.employees.slice(6);
    const rotated=(list,offset)=>list.slice(offset).concat(list.slice(0,offset));
    const groups={'Pha chế':rotated(bar,d%6),'Phục vụ':rotated(floor,d%12)};
    const offsets={'Pha chế':0,'Phục vụ':0};
    data.shiftTypes.forEach(st=>data.settings.positions.forEach(role=>{
      const need=data.settings.req[st.id][role];
      for(let n=0;n<need;n++){
        const e=groups[role][offsets[role]++];
        if(e)data.schedule[wk][e.id][d]=[{typeId:st.id,pos:role,bike:role==='Phục vụ'&&n===0,lock:d===0&&role==='Pha chế'&&n===0}];
      }
    }));
  }
  data.leaves=[{id:'demo-leave',empId:'demo-17',date:ymd(addDays(mon,2)),dateEnd:ymd(addDays(mon,2)),reason:'Việc gia đình (minh hoạ)'}];
  delete data.schedule[wk]['demo-17'][2];
  data.early=[{id:'demo-early',empId:'demo-4',date:ymd(addDays(mon,5)),time:'22:00',reason:'Lịch học (minh hoạ)'}];
  return data;
}

function initUI(){
  const sideName=document.querySelector('.side-brand b');if(sideName)sideName.textContent='Lịch bơi';
  const sideTag=document.querySelector('.side-brand small');if(sideTag)sideTag.textContent='VER 2.0 · CÁ HỒI';
  const settleHistory=()=>{
    if(document.visibilityState==='hidden')return;
    try{
      const raw=localStorage.getItem(STORE_KEY);if(!raw)return;
      const latest=JSON.parse(raw);updateWeekHistory(latest,latest);
      const next=JSON.stringify(latest);if(next!==raw)localStorage.setItem(STORE_KEY,next);
      DB.weekHistory=latest.weekHistory;
    }catch(e){console.warn('Không cập nhật được trạng thái lịch tuần',e);}
  };
  document.addEventListener('visibilitychange',settleHistory);
  setInterval(settleHistory,60000);
  document.querySelectorAll('nav.tabs [data-tab="today"],nav.tabs [data-tab="leave"]').forEach(b=>b.remove());
  document.querySelector('nav.tabs [data-tab="week"] span').textContent='Lịch làm';
  document.querySelector('nav.tabs [data-tab="settings"] span').textContent='Thêm';
  const themeMedia=matchMedia('(prefers-color-scheme: dark)');
  const applyTheme=()=>{const mode=localStorage.getItem('xepca_ui_theme')||(themeMedia.matches?'dark':'light');document.documentElement.dataset.theme=mode;const btn=document.getElementById('themeToggle');btn.innerHTML=uiIcon(mode==='dark'?'sun':'moon');btn.setAttribute('aria-label',mode==='dark'?'Chuyển giao diện sáng':'Chuyển giao diện tối');};
  applyTheme();
  document.getElementById('themeToggle').onclick=()=>{localStorage.setItem('xepca_ui_theme',document.documentElement.dataset.theme==='dark'?'light':'dark');applyTheme();};
  themeMedia.addEventListener('change',applyTheme);
  if(DEMO_MODE&&!localStorage.getItem(STORE_KEY)){DB=makeDemoData();save();}
  settleHistory();
  const observer=new MutationObserver(records=>{
    for(const r of records)if(r.type==='childList')for(const node of r.addedNodes)if(node.nodeType===1)enhanceView(node.parentElement||node);
  });
  observer.observe(document.getElementById('app'),{childList:true,subtree:true});
  window.addEventListener('popstate',()=>go(location.hash.slice(1)||'week'));
  document.addEventListener('keydown',e=>{
    if(!sheet.classList.contains('show'))return;
    if(e.key==='Escape'){e.preventDefault();closeSheet();}
    if(e.key==='Tab'){
      const nodes=[...sheet.querySelectorAll('button:not(:disabled),input:not([type="file"]):not(:disabled),select,a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length);
      const first=nodes[0],last=nodes.at(-1);
      if(e.shiftKey&&(document.activeElement===first||document.activeElement===sheet)){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===sheet)){e.preventDefault();first?.focus();}
    }
  });
  const updateConnection=()=>{const el=document.querySelector('.local-status');el.innerHTML='<span></span>'+(navigator.onLine?'Lưu trên thiết bị':'Offline · vẫn có thể xếp ca');};
  window.addEventListener('online',updateConnection);window.addEventListener('offline',updateConnection);updateConnection();
}

function groupSettings(el){
  const grid=document.createElement('div');grid.className='settings-grid';
  const columns=[document.createElement('div'),document.createElement('div')];
  let section=null,index=-1;
  [...el.children].forEach(child=>{
    if(child.classList.contains('sec-title')){section=document.createElement('section');section.className='settings-section';index++;columns[[0,1,0,1,1,1,1][index]||0].append(section);}
    if(section)section.append(child);
  });
  columns.forEach(c=>grid.append(c));el.replaceChildren(grid);
  const publish=document.createElement('button');publish.className='btn wide';publish.textContent='Gửi lịch cho nhân viên';publish.onclick=openPublishSheet;el.prepend(publish);
  const labels=['Thông tin quán','Bảng đăng ký','Quy tắc xếp ca','Khung giờ làm việc','Vị trí công việc','Sao lưu dữ liệu','Xóa dữ liệu'];
  const notes=['Tên cơ sở','Liên kết Google Sheet của nhân viên','Số người, số ca và cách chia lịch','Giờ bắt đầu và kết thúc','Pha chế, phục vụ…','Giữ bản sao trước khi đổi máy','Chỉ dùng khi làm lại từ đầu'];
  const titles=['Quán','Link Google Sheet đăng ký','Định mức người mỗi ca','Khung giờ ca & số giờ','Vị trí công việc','Sao lưu dữ liệu','Khác'];
  grid.querySelectorAll('.settings-section').forEach(section=>{
    const title=section.querySelector('.sec-title'),i=titles.indexOf(title?.textContent.trim());if(i<0)return;
    const details=document.createElement('details');details.className='settings-disclosure';
    const summary=document.createElement('summary');summary.innerHTML='<span><b>'+labels[i]+'</b><small>'+notes[i]+'</small></span><span aria-hidden="true">＋</span>';
    details.append(summary);title.remove();while(section.firstChild)details.append(section.firstChild);section.append(details);
  });
  const help=document.createElement('div');help.className='simple-help';help.innerHTML='<b>Có người báo nghỉ?</b><p>Vào <b>Lịch làm</b>, chọn ngày rồi <b>Chỉnh sửa ca</b> để đổi người hoặc bỏ ca. Không cần nhập thêm đơn.</p>';el.prepend(help);
  if(DB.leaves.length||DB.early.length){const old=document.createElement('button');old.className='btn ghost wide';old.textContent='Đơn nghỉ / về sớm đã lưu trước đây';old.onclick=()=>go('leave');el.append(old);}
}

function openSimpleSchedule(){
  const wk=weekKey(curMonday),hasAvail=!!Object.keys(DB.availability?.[wk]||{}).length;
  sheet.innerHTML=`<div class="grip"></div><h2>Xếp lịch tuần</h2><div class="sub">${dmShort(curMonday)} – ${dmShort(addDays(curMonday,6))}</div><p class="flow-intro">Lấy đăng ký → kiểm tra → xếp lịch.</p><p class="muted">Bạn được xem danh sách đăng ký trước khi xác nhận. Ca đã ghim được giữ lại khi tự xếp.</p><button class="btn wide" id="simpleFetch">${uiIcon('sync')} Lấy đăng ký mới</button><button class="btn ghost wide" id="simpleManual">Tự chọn người cho từng ca</button><details class="extra-options"><summary>Cách khác</summary><div class="menu">${hasAvail?'<button class="mrow" id="simpleAuto"><span class="mtx"><b>Xếp lại từ đăng ký đã lưu</b><small>Không cần tải đăng ký mới</small></span></button>':''}<button class="mrow" id="simpleCopy"><span class="mtx"><b>Dùng lại lịch tuần trước</b><small>Thay lịch tuần đang xem sau khi xác nhận</small></span></button><button class="mrow" id="simpleCsv"><span class="mtx"><b>Nhập file đăng ký</b><small>File CSV tải từ bảng đăng ký</small></span></button><button class="mrow" id="simpleTemplate"><span class="mtx"><b>Tải bảng đăng ký mẫu</b><small>Để nhân viên điền buổi có thể làm</small></span></button></div></details>`;
  const publish=document.createElement('button');publish.className='btn ghost wide';publish.style.marginTop='10px';publish.textContent='Đã xếp xong → Gửi cho nhân viên';publish.onclick=openPublishSheet;document.getElementById('simpleManual').after(publish);
  document.getElementById('simpleFetch').onclick=()=>{closeSheet();syncFromSheet();};
  document.getElementById('simpleManual').onclick=()=>{closeSheet();weekView='day';editMode=true;go('week');};
  if(hasAvail)document.getElementById('simpleAuto').onclick=()=>{closeSheet();autoScheduleBtn();};
  document.getElementById('simpleCopy').onclick=()=>{if(!confirm('Dùng lịch tuần trước sẽ thay thế lịch tuần đang xem. Tiếp tục?'))return;closeSheet();copyPrevWeek();};
  document.getElementById('simpleCsv').onclick=()=>{closeSheet();document.getElementById('importFile').click();};
  document.getElementById('simpleTemplate').onclick=()=>{const a=document.createElement('a');a.href='DangKyCa-CoSo3.xlsx';a.download='DangKyCa-CoSo3.xlsx';a.click();};openSheet();
}

function renderPocketHeader(mon){
  return `<div class="pocket-card"><div class="journey-title"><h1>Lịch làm việc</h1><button class="compact-actions" onclick="openCompactActions()" aria-haspopup="dialog">Thao tác <span aria-hidden="true">⋯</span></button></div><div class="journey-modes" role="group" aria-label="Chế độ xem lịch">${[['day','calendar','Theo ngày'],['emp','users','Theo nhân viên'],['summary','clock','Tổng kết tuần']].map(([mode,icon,label])=>`<button type="button" aria-pressed="${weekView===mode}" onclick="selectScheduleView('${mode}')">${uiIcon(icon)}<span>${label}</span></button>`).join('')}</div></div>`;
}
function prettyShiftTime(label){
  const match=String(label).match(/^(\d{1,2})h(\d{0,2})\s*-\s*(\d{1,2})h(\d{0,2})$/);
  if(!match)return esc(label);
  return `${match[1].padStart(2,'0')}:${(match[2]||'00').padStart(2,'0')} <span aria-hidden="true">–</span> ${match[3].padStart(2,'0')}:${(match[4]||'00').padStart(2,'0')}`;
}
function selectScheduleView(mode){if(!['day','emp','summary'].includes(mode))return;weekView=mode;editMode=false;renderWeek();document.querySelector('.journey-modes [aria-pressed="true"]')?.focus({preventScroll:true});}
function showWeekTotals(){selectScheduleView('summary');}
function openCompactActions(){
  sheet.innerHTML=`<div class="grip"></div><h2>Thao tác</h2><div class="sub">Tuần ${dmShort(curMonday)} – ${dmShort(addDays(curMonday,6))}</div><div class="compact-menu">${[['schedule','calendar','Xếp lịch','Lấy đăng ký hoặc chọn ca bằng tay'],['image','download','Lưu ảnh lịch','Lưu ảnh để gửi nhóm'],['publish','arrow','Gửi lịch cho nhân viên','Cập nhật trang xem lịch riêng']].map(([id,icon,label,note])=>`<button data-compact="${id}">${uiIcon(icon)}<span><b>${label}</b><small>${note}</small></span><span aria-hidden="true">›</span></button>`).join('')}</div>`;
  sheet.querySelector('[data-compact="schedule"]').onclick=openSimpleSchedule;
  sheet.querySelector('[data-compact="image"]').onclick=()=>{closeSheet();exportWeekImage();};
  sheet.querySelector('[data-compact="publish"]').onclick=openPublishSheet;
  openSheet();
}
