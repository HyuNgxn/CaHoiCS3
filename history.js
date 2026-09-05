/* Per-week durable state. The 24-hour seal is derived from the last actual edit. */
const WEEK_IDLE_MS = 24 * 60 * 60 * 1000;
function copyHistoryValue(value){return JSON.parse(JSON.stringify(value));}
function updateWeekHistory(data, previous, now=Date.now()){
  data.weekHistory=data.weekHistory||{};
  for(const [week,schedule] of Object.entries(data.schedule||{})){
    const entry=data.weekHistory[week];
    const oldSchedule=previous?.schedule?.[week];
    const changed=oldSchedule!==undefined && JSON.stringify(oldSchedule)!==JSON.stringify(schedule);
    if(!entry||changed){
      data.weekHistory[week]={updatedAt:now,sealedAt:null,schedule:copyHistoryValue(schedule),
        employees:copyHistoryValue(data.employees||[]),shiftTypes:copyHistoryValue(data.shiftTypes||[]),
        availability:copyHistoryValue(data.availability?.[week]||{})};
    }
    const current=data.weekHistory[week];
    if(!current.sealedAt&&now-current.updatedAt>=WEEK_IDLE_MS)current.sealedAt=current.updatedAt+WEEK_IDLE_MS;
  }
  return data;
}
function weekHistoryStatus(data,week,now=Date.now()){
  const entry=data.weekHistory?.[week];
  if(!entry)return 'Chưa có lịch đã lưu';
  const stamp=new Date(entry.updatedAt).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  return (now-entry.updatedAt>=WEEK_IDLE_MS?'Đã chốt sau 24 giờ':'Đã lưu trên máy')+' · Sửa cuối '+stamp;
}
