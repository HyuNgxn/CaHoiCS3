'use strict';
const $=id=>document.getElementById(id),escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const snapshotMode=location.hash.startsWith('#snapshot=');
const teamMode=snapshotMode||location.hash.startsWith('#team=');
const accessKey=location.hash.slice(teamMode?6:1);let weeks=[],selected='',selectedPerson='';let pending=false;
const filter=document.createElement('div');filter.className='person-filter';filter.innerHTML='<label for="person">Xem lịch của</label><select id="person"><option value="">Chọn tên của bạn</option></select>';
document.querySelector('.week-picker').after(filter);filter.hidden=!teamMode;
$('person').onchange=()=>{selectedPerson=$('person').value;render();};
document.querySelector('footer').textContent=teamMode?'Link chung cho cả đội · Chỉ xem lịch đã được quản lý gửi.':'Link cũ chỉ xem một người. Nhờ quản lý gửi link chung để chọn nhân viên.';
function monday(){const d=new Date();d.setDate(d.getDate()-(d.getDay()+6)%7);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function dateFor(week,day){const d=new Date(week+'T12:00:00');d.setDate(d.getDate()+day);return d;}
function dm(d){return d.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'});}
function render(){
  const w=weeks.find(w=>w.week===selected);if(!w){$('content').hidden=true;return;}
  let person=w;
  if(teamMode){
    const people=w.people||[];
    $('person').innerHTML='<option value="">Chọn tên của bạn</option>'+people.map(p=>`<option value="${escapeHTML(p.id)}" ${p.id===selectedPerson?'selected':''}>${escapeHTML(p.name)}</option>`).join('');
    person=people.find(p=>p.id===selectedPerson);
  }
  $('content').hidden=false;$('name').textContent=person?.name||'Lịch làm của cả đội';$('branch').textContent=w.branch;
  const shifts=(person?.days||[]).flat();$('hours').textContent=person?`${shifts.length} lượt ca · ${shifts.reduce((n,s)=>n+s.hours,0).toLocaleString('vi-VN')} giờ trong tuần`:'Chọn tên bên dưới để xem ca của bạn.';
  $('updated').textContent='Quản lý cập nhật: '+new Date(w.publishedAt).toLocaleString('vi-VN');
  $('week').innerHTML=weeks.map(w=>`<option value="${w.week}" ${w.week===selected?'selected':''}>${dm(dateFor(w.week,0))} – ${dm(dateFor(w.week,6))} / ${w.week.slice(0,4)}</option>`).join('');
  const i=weeks.findIndex(w=>w.week===selected);$('prev').disabled=i===weeks.length-1;$('next').disabled=i===0;
  $('days').innerHTML=person?person.days.map((day,i)=>{const d=dateFor(w.week,i),today=d.toDateString()===new Date().toDateString();return `<div class="day ${today?'today':''}"><div class="date"><b>${['T2','T3','T4','T5','T6','T7','CN'][i]}</b><small>${dm(d)}${today?' · nay':''}</small></div><div class="shifts">${day.length?day.map(s=>`<span class="shift">${escapeHTML(s.label)}<small>${escapeHTML(s.pos)}${s.bike?' · Giữ xe':''}</small></span>`).join(''):'<span class="empty">Không có ca được phân công</span>'}</div></div>`;}).join(''):'<p class="empty" style="padding:16px 0">'+(selectedPerson?'Nhân viên này không có trong lịch tuần đang chọn. Chọn tuần hoặc tên khác.':'Chọn tên để hiển thị lịch làm.')+'</p>';
}
async function refresh(latest=false){
  if(snapshotMode){
    try{const w=ScheduleSnapshot.unpack(location.hash.slice(10));weeks=[w];selected=w.week;render();$('notice').textContent='Bản lịch cố định. Khi có thay đổi, hãy mở link mới do quản lý gửi.';}catch(e){$('content').hidden=true;$('notice').textContent='Không đọc được bản lịch. Nhờ quản lý gửi lại nguyên link.';}
    return;
  }
  if(pending)return;if(!/^[a-f0-9]{64}$/.test(accessKey)){$('notice').textContent='Bạn cần mở link lịch riêng do quản lý gửi. Hãy nhờ quản lý gửi lại link.';return;}
  pending=true;$('refresh').disabled=true;
  try{const r=await fetch((teamMode?LICH_BOI_API:'')+(teamMode?'/api/team':'/api/me'),{headers:{Authorization:'Bearer '+accessKey},cache:'no-store',signal:AbortSignal.timeout(15000)});const d=await r.json();if(!r.ok)throw Error(d.error||'Không lấy được lịch');weeks=d.weeks;
    if(latest&&weeks.length)selected=weeks[0].week;
    else if(!weeks.some(w=>w.week===selected))selected=weeks.some(w=>w.week===monday())?monday():weeks[0]?.week;
    $('notice').textContent=!weeks.length?'Quản lý chưa gửi lịch.':latest?'Đã tải lịch mới nhất.':!weeks.some(w=>w.week===monday())?'Chưa có lịch tuần này. Đang hiển thị tuần đã gửi gần nhất.':'';render();
  }catch(e){$('content').hidden=true;$('notice').textContent='Chưa lấy được lịch mới. '+(e.message.includes('JSON')?'Hãy mở link trên máy chủ của quán.':e.message)+' · Bấm ↻ để thử lại.';}
  finally{pending=false;$('refresh').disabled=false;}
}
$('refresh').onclick=()=>refresh(true);$('refresh').setAttribute('aria-label','Tải lịch tuần mới nhất');$('refresh').title='Tải lịch tuần mới nhất';$('week').onchange=()=>{selected=$('week').value;render();};$('prev').onclick=()=>{const i=weeks.findIndex(w=>w.week===selected);if(weeks[i+1]){selected=weeks[i+1].week;render();}};$('next').onclick=()=>{const i=weeks.findIndex(w=>w.week===selected);if(weeks[i-1]){selected=weeks[i-1].week;render();}};
if(snapshotMode){$('refresh').hidden=true;document.querySelector('footer').textContent='Bản lịch chia sẻ · Chỉ xem · Không tự cập nhật từ máy quản lý.';}
else{document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});}refresh();
