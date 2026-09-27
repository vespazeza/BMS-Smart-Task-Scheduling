import React from 'react';
import View from './View.jsx';
import { api, setToken, hasToken, uploadFile, downloadFile, downloadUrl } from './api.js';
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const addDays=(d,n)=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()+n);return x;};
const parse=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c);};
const toMin=s=>{const[h,m]=s.split(':').map(Number);return h*60+m;};
const fmt=m=>pad(Math.floor(m/60)%24)+':'+pad(((m%60)+60)%60);
const durTxt=m=>m>=60?(Math.floor(m/60)+' ชม.'+(m%60?' '+(m%60)+' น.':'')):m+' นาที';
const offTxt=m=>m>=1440?(m/1440)+' วัน':m>=60?(m/60)+' ชม.':m+' นาที';
const IDLE_MIN=15,MAX_FILE=15*1024*1024;
let USERS=[];
const ROLE_LABEL={sec:'เลขานุการ',dir:'ผู้บริหาร',nur:'พยาบาล / พนักงาน',gen:'บุคคลทั่วไป',admin:'ผู้ดูแลระบบ'};
const ROLE_DESC={sec:'จัดการตารางของตนเองและตารางผู้บริหารที่ได้รับมอบหมาย · รับการแจ้งเตือนแทนผู้บริหาร',dir:'ดูภาพรวมทีมทั้งหมด · แก้ไขได้เฉพาะงานของตนเอง',nur:'เห็นและจัดการเฉพาะงานของตนเอง',gen:'เห็นและจัดการเฉพาะงานของตนเอง',admin:'สร้างบัญชี กำหนดบทบาท และกำหนดเลขาที่ดูแลผู้บริหาร · ไม่มีตารางงาน'};
const RC={sec:['var(--primary)','var(--ptint)'],dir:['#5B3E8C','#ECE6F4'],nur:['#9A6210','#FAF0DC'],gen:['#4E5957','#EDEBE5'],admin:['#B83A32','#FAE8E5']};
const uName=id=>(USERS.find(u=>u.id===id)||{name:'—'}).name;
const SCOPES={sec:[['mine','งานของฉัน'],['dir','ตารางผู้บริหาร'],['all','ทั้งหมด']],dir:[['mine','งานของฉัน'],['all','ทั้งทีม']]};
const TYPES=['เอกสาร','นัดหมาย','เคลม','ตรวจสอบ','ประชุม','ดูแลผู้ป่วย'];
const PRI={high:{label:'สูง',en:'High',c:'#B83A32',bg:'#FAE8E5'},medium:{label:'กลาง',en:'Medium',c:'#9A6210',bg:'#FAF0DC'},low:{label:'ต่ำ',en:'Low',c:'#44706D',bg:'#E4EFED'}};
const ST={pending:{label:'ยังไม่ทำ',en:'Pending',g:'○',c:'#8A6500',bg:'#FBF0C3',sc:'#E6B422'},inprogress:{label:'กำลังทำ',en:'In Progress',g:'▶',c:'#B4540F',bg:'#FDE3CC',sc:'#F08A24'},completed:{label:'เสร็จแล้ว',en:'Completed',g:'✓',c:'#2E7040',bg:'#DDF0E1',sc:'#3E9B57'},cancelled:{label:'ยกเลิก',en:'Cancelled',g:'✕',c:'#6B6963',bg:'#E4E3E0',sc:'#9A9892'}};
const REP={none:'ครั้งเดียว',daily:'รายวัน',weekly:'รายสัปดาห์',monthly:'รายเดือน'};
const CHAN={sound:'เสียง',push:'Push',popup:'Popup'};
const KIND={reminder:{tag:'ใกล้ถึงเวลา',c:'var(--primary)'},high:{tag:'งานสำคัญยังไม่เริ่ม',c:'#B83A32'},renag:{tag:'เตือนซ้ำ',c:'#9A6210'},overdue:{tag:'งานค้างเกินเวลา',c:'#B83A32'},snooze:{tag:'เลื่อนเตือน',c:'var(--primary)'}};
const ICON={dashboard:'M2 2h5v6H2zM9 2h5v4H9zM2 10h5v4H2zM9 8h5v6H9z',list:'M5.5 4h8.5M5.5 8h8.5M5.5 12h8.5M2 4h.6M2 8h.6M2 12h.6',calendar:'M2 3h12v11H2zM2 6.5h12M5 1.5v3M11 1.5v3',team:'M6 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5M11 2.5a2.2 2.2 0 0 1 0 4.4M12 9.6c1.5.5 2.5 2 2.5 4.4',report:'M3 1.5h7l3 3v10H3zM10 1.5v3h3M5.5 12v-2M8 12V7.5M10.5 12V9',alerts:'M4 11V7a4 4 0 0 1 8 0v4l1.2 1.5H2.8L4 11zM6.5 14a1.6 1.6 0 0 0 3 0'};
ICON.users=ICON.team;ICON.audit='M8 1.5 2.5 4v4c0 3 2.3 5.3 5.5 6.5 3.2-1.2 5.5-3.5 5.5-6.5V4L8 1.5zM5.5 8l2 2 3-3.5';
ICON.approvals='M8 1.5A6.5 6.5 0 1 0 8 14.5 6.5 6.5 0 0 0 8 1.5zM5.2 8.2l2 2 3.6-4.2';
const HOUR=56;
const startToday=()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate());};
const SHIFTS=['เช้า','บ่าย','ดึก'];
const TYPE_LABEL={'เอกสาร':'เอกสาร','นัดหมาย':'นัดหมาย','เคลม':'เคลม','ตรวจสอบ':'ตรวจสอบ','ประชุม':'ประชุม','ดูแลผู้ป่วย':'ดูแลผู้ป่วย'};
/* ---- quick-add: best-effort Thai date/time/type/priority parser (client-side only) ---- */
const WD=['จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์','อาทิตย์'];
const nextWeekday=(base,name)=>{const idx=WD.indexOf(name);if(idx<0)return null;const jsTarget=(idx+1)%7;let d=addDays(base,1);for(let i=0;i<8;i++){if(d.getDay()===jsTarget)return d;d=addDays(d,1);}return null;};
function parseQuickAdd(text,today){
  let t=' '+String(text||'').trim()+' ',date=null;
  if(/พรุ่งนี้/.test(t)){date=iso(addDays(today,1));t=t.replace(/พรุ่งนี้/,' ');}
  else if(/มะรืนนี้|มะรืน/.test(t)){date=iso(addDays(today,2));t=t.replace(/มะรืนนี้|มะรืน/,' ');}
  else if(/วันนี้/.test(t)){date=iso(today);t=t.replace(/วันนี้/,' ');}
  else{for(const w of WD){if(t.includes(w)){const d=nextWeekday(today,w);if(d){date=iso(d);t=t.replace(w,' ');}break;}}}
  let start=null,dur=null,m;
  if((m=t.match(/(\d{1,2})[:.](\d{2})\s*(น\.?|นาฬิกา)?/))){let h=Math.min(23,parseInt(m[1],10)),mi=Math.min(59,parseInt(m[2],10));start=pad(h)+':'+pad(mi);t=t.replace(m[0],' ');}
  else if((m=t.match(/(บ่าย|เย็น|เช้า|ตี)?\s*(\d{1,2})\s*โมง(ครึ่ง)?/))){let h=parseInt(m[2],10);const part=m[1]||'';if((part==='บ่าย'||part==='เย็น')&&h<=6)h+=12;if(part==='ตี')h=h%12;start=pad(h%24)+':'+(m[3]?'30':'00');t=t.replace(m[0],' ');}
  else if(/เที่ยง/.test(t)){start='12:00';t=t.replace('เที่ยง',' ');}
  if((m=t.match(/(\d{1,3})\s*(ชม\.?|ชั่วโมง)/))){dur=parseInt(m[1],10)*60;t=t.replace(m[0],' ');}
  else if((m=t.match(/(\d{1,3})\s*นาที/))){dur=parseInt(m[1],10);t=t.replace(m[0],' ');}
  let priority=null;
  if(/ด่วนมาก|สำคัญมาก|เร่งด่วน|ด่วน|สำคัญ/.test(t)){priority='high';t=t.replace(/ด่วนมาก|สำคัญมาก|เร่งด่วน|ด่วน|สำคัญ/,' ');}
  else if(/ไม่ด่วน|ไม่รีบ|ไม่สำคัญ/.test(t)){priority='low';t=t.replace(/ไม่ด่วน|ไม่รีบ|ไม่สำคัญ/,' ');}
  let type=null;
  for(const[kw,ty]of[['ประชุม','ประชุม'],['เคลม','เคลม'],['ตรวจ','ตรวจสอบ'],['ผู้ป่วย','ดูแลผู้ป่วย'],['ดูแล','ดูแลผู้ป่วย'],['นัด','นัดหมาย'],['เอกสาร','เอกสาร'],['หนังสือ','เอกสาร'],['ลงนาม','เอกสาร']])if(t.includes(kw)){type=ty;break;}
  const title=t.replace(/\s+/g,' ').trim();
  return {title,date,start,dur,priority,type};
}

export default class App extends React.Component {
  render(){return <View V={this.renderVals()}/>;}
  get today(){return startToday();}
  lastAct=Date.now(); pending=0; patchQ={};
  state={attQ:'',attOpen:false,attHistory:[],accounts:[],authUid:null,booting:hasToken(),mustChange:false,pwForm:null,uploading:false,cancelAsk:null,conf:{key:'',list:[]},feed:{token:'',loading:false},rsvpReason:'',quick:{text:'',busy:false,err:''},approveAsk:null,
    nurse:{loading:false,shiftMap:{},colDate:'',colleagues:[],swaps:[],swapForm:null,swapBusy:false,swapErr:'',handoverNote:'',handoverHistory:[],handoverBusy:false},
    digest:{loaded:false,loading:false,busy:false,msg:'',err:'',prefs:{enabled:false,time:'07:30',email:'',emailOn:false,lineId:'',lineOn:false},status:{email:'',line:''},log:[]},settingsSec:'account',audit:{rows:[],q:'',loading:false},login:{u:this.savedUser(),p:'',err:'',remember:!!this.savedUser(),busy:false},userForm:null,view:'dashboard',scope:'mine',tasks:[],history:[],q:'',fStatus:'all',fPri:'all',fType:'all',fDate:'all',fDateVal:'',sel:null,showCreate:false,form:null,formErr:false,toasts:[],log:[],showLog:false,unread:0,fired:{},snooze:{},weekOff:0,monthOff:0,calMode:null,selDay:null,rRange:7,vw:typeof window!=='undefined'?window.innerWidth:1200,
    settings:{sound:true,push:true,popup:true,tone:'chime',volume:70,intensity:{high:'urgent',medium:'normal',low:'quiet'},offsets:[30,5],renag:true,renagEvery:10,overdue:true,highNotStarted:true,ai:true,theme:(()=>{try{return localStorage.getItem('st_theme')||'light';}catch(e){return 'light';}})()}};
  savedUser(){try{return localStorage.getItem('st_user')||'';}catch(e){return '';}}
  componentDidMount(){
    this.iv=setInterval(()=>this.tick(),15000);this.to=setTimeout(()=>this.tick(),1500);
    this.onR=()=>{this.setState({vw:document.documentElement.clientWidth||window.innerWidth});};this.onR();requestAnimationFrame(this.onR);this.t2=setTimeout(this.onR,300);window.addEventListener('resize',this.onR);if(window.ResizeObserver){this.ro=new ResizeObserver(this.onR);this.ro.observe(document.documentElement);}
    this.act=()=>{this.lastAct=Date.now();};['mousemove','mousedown','keydown','touchstart','scroll'].forEach(ev=>window.addEventListener(ev,this.act,{passive:true}));
    this.idleIv=setInterval(()=>{if(this.state.authUid&&Date.now()-this.lastAct>IDLE_MIN*60000)this.idleLogout();},20000);
    this.applyTheme();if(window.matchMedia){this.mq=window.matchMedia('(prefers-color-scheme: dark)');this.mqh=()=>this.applyTheme();if(this.mq.addEventListener)this.mq.addEventListener('change',this.mqh);}
    if(hasToken())this.boot();
  }
  componentDidUpdate(_,ps){
    if(ps.settings.theme!==this.state.settings.theme)this.applyTheme();
    const s=this.state;
    if(s.showCreate&&s.form){const k=this.confKeyOf(s.form);if(k!==this.confKey){this.confKey=k;clearTimeout(this.confT);this.confT=setTimeout(async()=>{try{const list=await this.fetchConflicts(s.form);if(this.confKey===k)this.setState({conf:{key:k,list}});}catch(e){}},350);}}else if(this.confKey)this.confKey='';
  }
  confKeyOf(f){return [f.id||'',f.assignee,f.date,f.start,f.dur,(f.attendees||[]).join(',')].join('|');}
  async fetchConflicts(f){const r=await api('POST','/api/conflicts',{assignee:f.assignee,date:f.date,start:f.start,dur:Number(f.dur),ignoreId:f.id||undefined,attendees:f.attendees||[]});return r.conflicts;}
  conflictText(c){return (c.self?'':c.personName+' · ')+c.start+'–'+c.end+' · '+(c.title||'ไม่ว่าง (ติดภารกิจอื่น)');}
  async confirmSlot(p){try{const list=await this.fetchConflicts(p);if(!list.length)return true;return window.confirm('เวลานี้ชนกับงานอื่น:\n\n'+list.map(c=>'• '+this.conflictText(c)).join('\n')+'\n\nต้องการดำเนินการต่อหรือไม่?');}catch(e){return true;}}
  /* ---- meeting invitations ---- */
  async rsvpAnswer(id,status){try{await api('POST','/api/tasks/'+id+'/rsvp',{status,reason:status==='declined'?this.state.rsvpReason:''});this.setState({rsvpReason:''});await this.applySync(false);this.info(status==='accepted'?'ตอบรับการประชุมแล้ว':'ปฏิเสธการประชุมแล้ว','ผู้จัดจะเห็นคำตอบของคุณ');}catch(e){this.fail(e);}}
  /* ---- director confirms / rejects a secretary-booked task ---- */
  askApprove(id,status){if(status==='rejected'){this.setState({approveAsk:{id,status,reason:'',err:''}});return;}this.decideApproval(id,'approved','');}
  closeApprove(){this.setState({approveAsk:null});}
  onApproveReason(e){const a=this.state.approveAsk;this.setState({approveAsk:a&&{...a,reason:e.target.value,err:''}});}
  confirmApprove(){const a=this.state.approveAsk,r=(a.reason||'').trim();if(r.length<3){this.setState({approveAsk:{...a,err:'กรุณาระบุเหตุผลที่ปฏิเสธ (อย่างน้อย 3 ตัวอักษร)'}});return;}this.setState({approveAsk:null});this.decideApproval(a.id,'rejected',r);}
  async decideApproval(id,status,reason){try{await api('POST','/api/tasks/'+id+'/approve',{status,reason});await this.applySync(false);this.info(status==='approved'?'ยืนยันนัดแล้ว':'ปฏิเสธแล้ว',status==='approved'?'เลขานุการจะเห็นว่ายืนยันแล้ว':'เลขานุการจะเห็นเหตุผลและแก้ไขนัดใหม่ได้');}catch(e){this.fail(e);}}
  /* ---- quick add: type a sentence, get a task ---- */
  setQuickText(v){this.setState(s=>({quick:{...s.quick,text:v,err:''}}));}
  async quickAdd(){
    const s=this.state,text=(s.quick.text||'').trim();if(!text||s.quick.busy)return;
    const uid=this.uid(),u=USERS.find(x=>x.id===uid)||{},mgA=this.mg(uid),asg=s.scope==='dir'&&mgA[0]?mgA[0]:uid;
    const p=parseQuickAdd(text,this.today);
    let date=p.date||iso(this.today),start=p.start,dur=p.dur||30;
    this.setState(st=>({quick:{...st.quick,busy:true,err:''}}));
    if(!start){const g=this.gaps(asg,date,this.nowMin()).find(([a,b])=>b-a>=dur);start=g?fmt(g[0]):fmt(Math.ceil(this.nowMin()/15)*15+15);}
    const body={title:p.title||text,type:p.type||u.defType||'เอกสาร',priority:p.priority||'medium',date,start,dur,repeat:'none',assignee:asg,reminders:[...s.settings.offsets],renag:true,channels:['sound','popup','push'],mode:'onsite',location:'',link:'',attendees:[],ext:''};
    if(!(await this.confirmSlot(body))){this.setState(st=>({quick:{...st.quick,busy:false}}));return;}
    try{
      await api('POST','/api/tasks',body);
      this.setState({quick:{text:'',busy:false,err:''}});
      await this.applySync(false);
      this.info('เพิ่มงานด่วนแล้ว',body.title+' · '+this.slotLabel(body.date,body.start));
    }catch(e){this.setState(st=>({quick:{...st.quick,busy:false,err:e.message}}));}
  }
  /* ---- nurse: shift schedule, swaps, handover notes ---- */
  async loadNurse(){
    this.setState(s=>({nurse:{...s.nurse,loading:true}}));
    try{
      const today=iso(this.today);
      const[sh,sw,ho]=await Promise.all([
        api('GET','/api/shifts?from='+today+'&to='+iso(addDays(this.today,6))),
        api('GET','/api/shift-swaps'),
        api('GET','/api/handover?date='+today),
      ]);
      const map={};sh.shifts.forEach(r=>{map[r.date]=r.shift;});
      this.setState(s=>({nurse:{...s.nurse,loading:false,shiftMap:map,swaps:sw.swaps,handoverNote:ho.note,handoverHistory:ho.history}}));
    }catch(e){this.setState(s=>({nurse:{...s.nurse,loading:false}}));this.fail(e,true);}
  }
  async setMyShift(date,shift){try{await api('PUT','/api/shifts',{date,shift});await this.loadNurse();this.info('บันทึกเวรแล้ว',this.slotLabel(date,'')+' · '+(shift||'ว่าง'));}catch(e){this.fail(e);}}
  async loadColleagues(date){try{const r=await api('GET','/api/shifts/colleagues?date='+date);this.setState(s=>({nurse:{...s.nurse,colDate:date,colleagues:r.colleagues}}));}catch(e){this.fail(e);}}
  openSwap(theirId,theirShift,date){const mine=this.state.nurse.shiftMap[date]||'';if(!mine){this.info('ยังไม่ได้ลงเวรของวันนี้','กรุณาเลือกเวรของคุณก่อนขอสลับ');return;}this.setState(s=>({nurse:{...s.nurse,swapErr:'',swapForm:{toUser:theirId,theirShift,myShift:mine,date}}}));}
  closeSwap(){this.setState(s=>({nurse:{...s.nurse,swapForm:null}}));}
  async sendSwap(){
    const f=this.state.nurse.swapForm;if(!f)return;
    this.setState(s=>({nurse:{...s.nurse,swapBusy:true,swapErr:''}}));
    try{
      await api('POST','/api/shift-swaps',{date:f.date,toUser:f.toUser,myShift:f.myShift,theirShift:f.theirShift});
      this.setState(s=>({nurse:{...s.nurse,swapBusy:false,swapForm:null}}));
      await this.loadNurse();
      this.info('ส่งคำขอสลับเวรแล้ว','รอเพื่อนร่วมงานตอบรับ');
    }catch(e){this.setState(s=>({nurse:{...s.nurse,swapBusy:false,swapErr:e.message}}));}
  }
  async respondSwap(id,status){try{await api('POST','/api/shift-swaps/'+id+'/respond',{status});await this.loadNurse();this.info(status==='accepted'?'ยืนยันสลับเวรแล้ว':'ปฏิเสธคำขอแล้ว','');}catch(e){this.fail(e);}}
  async cancelSwap(id){try{await api('POST','/api/shift-swaps/'+id+'/cancel');await this.loadNurse();this.info('ยกเลิกคำขอแล้ว','');}catch(e){this.fail(e);}}
  setHandoverNote(v){this.setState(s=>({nurse:{...s.nurse,handoverNote:v}}));}
  async saveHandover(){
    const s=this.state,shift=s.nurse.shiftMap[iso(this.today)]||'เช้า';
    this.setState(st=>({nurse:{...st.nurse,handoverBusy:true}}));
    try{await api('PUT','/api/handover',{date:iso(this.today),shift,note:s.nurse.handoverNote});await this.loadNurse();this.setState(st=>({nurse:{...st.nurse,handoverBusy:false}}));this.info('บันทึกส่งเวรแล้ว','');}
    catch(e){this.setState(st=>({nurse:{...st.nurse,handoverBusy:false}}));this.fail(e);}
  }
  /* ---- external calendar feed / digest / export ---- */
  feedUrl(){return this.state.feed.token?window.location.origin+'/api/ics/'+this.state.feed.token+'.ics':'';}
  async loadFeed(){this.setState(s=>({feed:{...s.feed,loading:true}}));try{const r=await api('GET','/api/calendar-feed');this.setState({feed:{token:r.token,loading:false}});}catch(e){this.setState(s=>({feed:{...s.feed,loading:false}}));this.fail(e);}}
  async regenFeed(){if(!window.confirm('สร้างลิงก์ใหม่? ลิงก์เดิมที่สมัครไว้ใน Google Calendar / Outlook จะใช้ไม่ได้อีก'))return;try{const r=await api('POST','/api/calendar-feed/regenerate');this.setState({feed:{token:r.token,loading:false}});this.info('สร้างลิงก์ใหม่แล้ว','ลิงก์เดิมใช้ไม่ได้แล้ว');}catch(e){this.fail(e);}}
  async copyFeed(){try{await navigator.clipboard.writeText(this.feedUrl());this.info('คัดลอกลิงก์แล้ว','นำไปวางในการสมัครรับปฏิทิน');}catch(e){this.info('คัดลอกอัตโนมัติไม่ได้','เลือกข้อความในช่องลิงก์แล้วกด Ctrl+C');}}
  async loadDigest(){this.setState(s=>({digest:{...s.digest,loading:true,err:'',msg:''}}));try{const r=await api('GET','/api/digest');this.setState(s=>({digest:{...s.digest,loaded:true,loading:false,prefs:r.prefs,status:r.status,log:r.log}}));}catch(e){this.setState(s=>({digest:{...s.digest,loading:false}}));this.fail(e);}}
  setDigest(p){this.setState(s=>({digest:{...s.digest,err:'',msg:'',prefs:{...s.digest.prefs,...p}}}));}
  async saveDigest(){const d=this.state.digest;this.setState({digest:{...d,busy:true,err:'',msg:''}});try{const r=await api('PUT','/api/digest',d.prefs);this.setState(s=>({digest:{...s.digest,busy:false,prefs:r.prefs,msg:'บันทึกแล้ว'}}));return true;}catch(e){if(e.status===401){this.fail(e);return false;}this.setState(s=>({digest:{...s.digest,busy:false,err:e.message}}));return false;}}
  async testDigest(){if(!(await this.saveDigest()))return;this.setState(s=>({digest:{...s.digest,busy:true}}));try{const r=await api('POST','/api/digest/test');const bad=r.results.filter(x=>!x.ok);this.setState(s=>({digest:{...s.digest,busy:false,msg:bad.length?'':'ส่งทดสอบแล้ว ('+r.results.map(x=>x.channel==='email'?'อีเมล':'LINE').join(' + ')+')',err:bad.map(x=>(x.channel==='email'?'อีเมล: ':'LINE: ')+x.error).join(' · ')}}));this.loadDigest();}catch(e){this.setState(s=>({digest:{...s.digest,busy:false,err:e.message}}));}}
  applyTheme(){const m=this.state.settings.theme||'light';const dark=m==='dark'||(m==='system'&&typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);try{document.documentElement.setAttribute('data-theme',dark?'dark':'light');localStorage.setItem('st_theme',m);}catch(e){}}
  componentWillUnmount(){clearInterval(this.iv);clearInterval(this.idleIv);clearTimeout(this.to);window.removeEventListener('resize',this.onR);['mousemove','mousedown','keydown','touchstart','scroll'].forEach(ev=>window.removeEventListener(ev,this.act));if(this.ro)this.ro.disconnect();}
  /* ---- session / sync ---- */
  async boot(){try{await this.applySync(true);}catch(e){setToken(null);}this.setState({booting:false});}
  fail(e,quiet){if(e&&e.status===401){this.expire(e.message);return;}if(!quiet)this.info('ทำรายการไม่สำเร็จ',(e&&e.message)||'เกิดข้อผิดพลาด');}
  loginReset(err){return {u:this.savedUser(),p:'',err:err||'',remember:!!this.savedUser(),busy:false};}
  expire(msg){setToken(null);this.resetSession({login:this.loginReset(msg||'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')});}
  resetSession(extra){USERS=[];this.setState({authUid:null,booting:false,mustChange:false,pwForm:null,accounts:[],tasks:[],toasts:[],showLog:false,sel:null,showCreate:false,userForm:null,log:[],unread:0,q:'',fired:{},snooze:{},...extra});}
  async applySync(first){
    const d=await api('GET','/api/sync');
    if(d.mustChange){USERS=[d.me];this.setState({authUid:d.me.id,accounts:[d.me],mustChange:true,pwForm:{cur:'',next:'',next2:'',err:'',busy:false,forced:true}});return;}
    USERS=d.users;
    const ex=first?(()=>{let f={};try{const j=JSON.parse(localStorage.getItem('st_fired_'+d.me.id)||'null');if(j&&j.d===iso(this.today))f=j.f;}catch(e){}return {authUid:d.me.id,mustChange:false,pwForm:null,view:d.me.rk==='admin'?'users':'dashboard',scope:'mine',sel:null,toasts:[],log:[],unread:0,fired:f,q:''};})():{};
    this.setState(s=>({...ex,accounts:d.users,tasks:d.tasks,attHistory:d.attHistory.length?d.attHistory:s.attHistory,settings:d.settings?{...s.settings,...d.settings}:s.settings}),first?()=>{setTimeout(()=>this.tick(),800);if(d.me.rk==='nur')this.loadNurse();}:undefined);
  }
  async doLogin(){
    const L=this.state.login;if(L.busy)return;
    if(!L.u.trim()||!L.p){this.setState({login:{...L,err:'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน'}});return;}
    this.setState({login:{...L,busy:true,err:''}});
    try{
      const r=await api('POST','/api/login',{username:L.u.trim(),password:L.p});
      setToken(r.token);this.lastAct=Date.now();
      try{if(L.remember)localStorage.setItem('st_user',L.u.trim());else localStorage.removeItem('st_user');}catch(e){}
      await this.applySync(true);
      this.setState({login:{u:L.remember?L.u.trim():'',p:'',err:'',remember:L.remember,busy:false}});
    }catch(e){this.setState({login:{...this.state.login,p:'',busy:false,err:e.message}});}
  }
  async logout(){try{await api('POST','/api/logout');}catch(e){}setToken(null);this.resetSession({login:this.loginReset()});}
  async idleLogout(){try{await api('POST','/api/idle-logout');}catch(e){}setToken(null);this.resetSession({login:this.loginReset('ออกจากระบบอัตโนมัติ เพราะไม่มีการใช้งานเกิน '+IDLE_MIN+' นาที')});}
  async reload(){if(this.pending>0)return;try{await this.applySync(false);}catch(e){this.fail(e,true);}}
  async savePassword(){
    const f=this.state.pwForm;if(f.busy)return;
    const err=!f.cur?'กรุณากรอกรหัสผ่านปัจจุบัน':f.next.length<8?'รหัสผ่านใหม่ต้องยาวอย่างน้อย 8 ตัวอักษร':!/\d/.test(f.next)||!/[A-Za-z฀-๿]/.test(f.next)?'รหัสผ่านใหม่ต้องมีทั้งตัวอักษรและตัวเลข':f.next!==f.next2?'ยืนยันรหัสผ่านใหม่ไม่ตรงกัน':'';
    if(err){this.setState({pwForm:{...f,err}});return;}
    this.setState({pwForm:{...f,busy:true,err:''}});
    try{await api('POST','/api/password',{current:f.cur,next:f.next});const was=this.state.mustChange;this.setState({pwForm:null,mustChange:false});if(was)await this.applySync(true);this.info('เปลี่ยนรหัสผ่านแล้ว','ใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งถัดไป');}
    catch(e){if(e.status===401){this.fail(e);return;}this.setState({pwForm:{...f,busy:false,err:e.message}});}
  }
  setPW(p){this.setState(s=>({pwForm:{...s.pwForm,...p,err:''}}));}
  async loadAudit(q){const a=this.state.audit,qq=q!=null?q:a.q;this.setState({audit:{...a,q:qq,loading:true}});try{const r=await api('GET','/api/audit?limit=300&q='+encodeURIComponent(qq));this.setState(s=>({audit:{...s.audit,rows:r.rows,loading:false}}));}catch(e){this.setState(s=>({audit:{...s.audit,loading:false}}));this.fail(e);}}
  uid(){return this.state.authUid;}
  rk(id){return (USERS.find(u=>u.id===(id||this.uid()))||{}).rk;}
  mg(id){const u=USERS.find(x=>x.id===id);return u&&u.rk==='sec'?(u.manages||[]).filter(e=>USERS.some(x=>x.id===e&&x.rk==='dir')):[];}
  vis(id){const r=this.rk(id);return r==='dir'?USERS.filter(u=>u.rk!=='admin').map(u=>u.id):r==='sec'?[id,...this.mg(id)]:[id];}
  /* ---- user management (admin) ---- */
  openUserForm(id){const u=id&&this.state.accounts.find(a=>a.id===id);this.setState({userForm:u?{id:u.id,name:u.name,role:u.role,username:u.username,pw:'',rk:u.rk,manages:[...(u.manages||[])],active:u.active!==false,err:'',busy:false}:{id:null,name:'',role:'',username:'',pw:'',rk:'nur',manages:[],active:true,err:'',busy:false}});}
  setUF(p){this.setState(s=>({userForm:{...s.userForm,...p,err:''}}));}
  genPw(){const A='abcdefghjkmnpqrstuvwxyz',N='23456789',pick=(s)=>s[Math.floor(Math.random()*s.length)];let p='';for(let i=0;i<6;i++)p+=pick(A);for(let i=0;i<4;i++)p+=pick(N);return p;}
  async saveUser(){
    const f=this.state.userForm;if(f.busy)return;
    const err=!f.name.trim()?'กรุณาใส่ชื่อ-นามสกุล':!f.username.trim()?'กรุณาใส่ชื่อผู้ใช้':(!f.id&&f.pw.length<6)?'กรุณาตั้งรหัสผ่านชั่วคราว (อย่างน้อย 6 ตัวอักษร)':(f.pw&&f.pw.length<6)?'รหัสผ่านชั่วคราวต้องยาวอย่างน้อย 6 ตัวอักษร':'';
    if(err){this.setState({userForm:{...f,err}});return;}
    this.setState({userForm:{...f,busy:true}});
    const body={name:f.name,role:f.role,username:f.username.trim(),rk:f.rk,manages:f.manages,active:f.active,...(f.pw?{password:f.pw}:{})};
    try{
      await (f.id?api('PATCH','/api/users/'+f.id,body):api('POST','/api/users',body));
      this.setState({userForm:null});await this.applySync(false);
      this.info(f.id?'บันทึกการแก้ไขแล้ว':'เพิ่มผู้ใช้แล้ว',f.name.trim()+' · '+ROLE_LABEL[f.rk]+(f.pw?' · ต้องเปลี่ยนรหัสผ่านเมื่อเข้าใช้ครั้งแรก':''));
    }catch(e){if(e.status===401){this.fail(e);return;}this.setState({userForm:{...f,busy:false,err:e.message}});}
  }
  async toggleUser(u){try{await api('PATCH','/api/users/'+u.id,{active:u.active===false});await this.applySync(false);}catch(e){this.fail(e);}}
  authVals(s,uid){
    const L=s.login,q=s.q.trim().toLowerCase(),f=s.userForm,execs=s.accounts.filter(u=>u.rk==='dir'),cnt=k=>s.accounts.filter(u=>u.rk===k).length;
    const rows=s.accounts.filter(u=>!q||(u.name+' '+u.username+' '+u.role+' '+ROLE_LABEL[u.rk]).toLowerCase().includes(q)).map(u=>{const on=u.active!==false;return {...u,roleLabel:ROLE_LABEL[u.rk],roleC:RC[u.rk][0],roleBg:RC[u.rk][1],managesText:u.rk==='sec'?((u.manages||[]).map(uName).join(', ')||'ยังไม่กำหนด'):'—',statusText:on?'ใช้งาน':'ระงับ',statusC:on?'#2E7040':'#7A7770',statusBg:on?'#E1F0E3':'#F0EEE9',toggleLabel:on?'ระงับ':'เปิดใช้',canToggle:u.id!==uid,rowOp:on?1:0.6,onEdit:()=>this.openUserForm(u.id),onToggle:()=>this.toggleUser(u)};});
    return {
      loggedOut:!s.authUid,loginBusy:!!L.busy,booting:s.booting,mustChange:s.mustChange,loginU:L.u,loginP:L.p,loginErr:L.err,hasLoginErr:!!L.err,
      onLoginU:e=>this.setState({login:{...L,u:e.target.value,err:''}}),onLoginP:e=>this.setState({login:{...L,p:e.target.value,err:''}}),onLoginKey:e=>{if(e.key==='Enter')this.doLogin();},loginRemember:!!L.remember,onLoginRemember:e=>this.setState({login:{...L,remember:e.target.checked}}),onForgot:e=>{e.preventDefault();this.info('ลืมรหัสผ่าน?','กรุณาติดต่อผู้ดูแลระบบเพื่อรีเซ็ตรหัสผ่าน');},doLogin:()=>this.doLogin(),logout:()=>this.logout(),
      usersRows:rows,usersEmpty:!rows.length,
      userKpis:[['บัญชีทั้งหมด',s.accounts.length],['เลขานุการ',cnt('sec')],['ผู้บริหาร',cnt('dir')],['พยาบาล / พนักงาน',cnt('nur')],['บุคคลทั่วไป',cnt('gen')]].map(([label,value])=>({label,value})),
      roleDefs:['sec','dir','nur','gen','admin'].map(k=>({label:ROLE_LABEL[k],desc:ROLE_DESC[k],c:RC[k][0],bg:RC[k][1]})),
      showUserForm:!!f,uf:f?{...f,titleText:f.id?'แก้ไขผู้ใช้':'เพิ่มผู้ใช้ใหม่',pwPh:f.id?'เว้นว่าง = ไม่เปลี่ยน · ใส่เพื่อรีเซ็ตรหัสผ่าน':'รหัสผ่านชั่วคราว (อย่างน้อย 6 ตัว)',busy:!!f.busy,rkDesc:ROLE_DESC[f.rk]}:{},closeUserForm:()=>this.setState({userForm:null}),saveUser:()=>this.saveUser(),genPw:()=>this.setUF({pw:this.genPw()}),
      onUfName:e=>this.setUF({name:e.target.value}),onUfTitle:e=>this.setUF({role:e.target.value}),onUfUser:e=>this.setUF({username:e.target.value}),onUfPw:e=>this.setUF({pw:e.target.value}),
      rkChips:f?['sec','dir','nur','gen','admin'].map(k=>this.chip(ROLE_LABEL[k],f.rk===k,()=>this.setUF({rk:k}))):[],
      ufIsSec:!!f&&f.rk==='sec',noExecs:!execs.length,execChips:f?execs.filter(e=>e.id!==f.id).map(e=>this.chip(e.name,(f.manages||[]).includes(e.id),()=>this.setUF({manages:(f.manages||[]).includes(e.id)?f.manages.filter(x=>x!==e.id):[...(f.manages||[]),e.id]}))):[],
      ufActive:f?[this.tog('เปิดใช้งานบัญชี','ปิดเพื่อระงับการเข้าสู่ระบบชั่วคราว',f.active!==false,()=>this.setUF({active:f.active===false}))]:[],
      ufHasErr:!!(f&&f.err),ufErr:f?f.err:'',
      showPwForm:!!s.pwForm,pw:s.pwForm||{},pwForced:!!(s.pwForm&&s.pwForm.forced),openPw:()=>this.setState({pwForm:{cur:'',next:'',next2:'',err:'',busy:false,forced:false}}),closePw:()=>this.setState({pwForm:null}),savePw:()=>this.savePassword(),onPwCur:e=>this.setPW({cur:e.target.value}),onPwNext:e=>this.setPW({next:e.target.value}),onPwNext2:e=>this.setPW({next2:e.target.value}),
      auditRows:s.audit.rows,auditQ:s.audit.q,auditLoading:s.audit.loading,onAuditQ:e=>this.setState(st=>({audit:{...st.audit,q:e.target.value}})),onAuditGo:()=>this.loadAudit(),
    };
  }
  curW(){try{return document.documentElement.clientWidth||window.innerWidth||this.state.vw;}catch(e){return this.state.vw;}}
  isMob(){const p=this.props.preview;return p==='มือถือ'||(p!=='เดสก์ท็อป'&&this.curW()<760);}
  nowMin(){const d=new Date();return d.getHours()*60+d.getMinutes();}
  dd(date){return Math.round((parse(date)-this.today)/86400000);}
  canEdit(t,uid){return !t.hist&&(t.assignee===uid||this.mg(uid).includes(t.assignee));}
  tick(){
    USERS=this.state.accounts;if(!this.state.authUid||this.state.mustChange){this.forceUpdate();return;}
    this.reload();
    const s=this.state,now=this.nowMin(),set=s.settings,uid=this.uid(),fired={...s.fired},out=[];
    const add=(k,t,kind,title,msg)=>{k=uid+':'+k;if(fired[k])return;fired[k]=1;out.push({t,kind,title,msg});};
    const watch=[uid,...this.mg(uid)];
    s.tasks.filter(t=>watch.includes(t.assignee)).forEach(t=>{
      const dd=this.dd(t.date),st=toMin(t.start),en=st+t.dur,until=dd*1440+st-now,pre=t.assignee!==uid?'[ตารางผู้บริหาร] ':'';
      if(t.status==='pending'){
        const offs=[...t.reminders].sort((a,b)=>a-b),hit=offs.find(o=>until>0&&until<=o);
        if(hit!==undefined){add(t.id+'-r'+hit,t,'reminder',pre+'อีก '+offTxt(until)+' ถึงเวลา',t.start+' · '+t.type);offs.filter(o=>o>hit).forEach(o=>fired[uid+':'+t.id+'-r'+o]=1);}
        if(dd===0&&until<=0&&now<en){
          if(t.priority==='high'&&set.highNotStarted)add(t.id+'-hns',t,'high',pre+'ถึงเวลาแล้วแต่ยังไม่เริ่ม','กำหนด '+t.start);
          const k=Math.floor(-until/set.renagEvery);
          if(t.renag&&set.renag&&k>=1)add(t.id+'-n'+k,t,'renag',pre+'ยังไม่ได้เริ่มงาน','เลยเวลาเริ่มมา '+(-until)+' นาที');
        }
      }
      if((t.status==='pending'||t.status==='inprogress')&&set.overdue&&(dd<0||(dd===0&&now>en)))add(t.id+'-od',t,'overdue',pre+'เลยกำหนดเสร็จ',dd<0?'ค้างจากวันก่อน':'ควรเสร็จ '+fmt(en));
      const sz=s.snooze[t.id];if(sz&&now>=sz&&t.status==='pending')add(t.id+'-s'+sz,t,'snooze','ครบเวลาที่เลื่อนไว้',t.start+' · '+t.type);
    });
    if(out.length)this.deliver(out,fired);else this.forceUpdate();
  }
  deliver(out,fired){
    const s=this.state,set=s.settings,now=this.nowMin(),lvl=o=>set.intensity[o.t.priority]||'normal';
    const items=out.map((o,i)=>({id:'n'+Date.now()+'-'+i,taskId:o.t.id,kind:o.kind,tag:KIND[o.kind].tag,c:KIND[o.kind].c,title:o.title,task:o.t.title,msg:o.msg,time:fmt(now),sticky:lvl(o)==='urgent'}));
    const snd=out.filter(o=>lvl(o)!=='quiet'&&(o.t.channels||[]).includes('sound'));
    if(set.sound&&snd.length){const u=snd.some(o=>lvl(o)==='urgent');this.play(set.tone,set.volume/100*(u?1:0.7),u?3:1);}
    if(set.push&&typeof Notification!=='undefined'&&Notification.permission==='granted')out.forEach(o=>{if(lvl(o)!=='quiet'&&(o.t.channels||[]).includes('push')){try{new Notification(KIND[o.kind].tag+': '+o.t.title,{body:o.title+' · '+o.msg});}catch(e){}}});
    const pops=set.popup?items.filter((it,i)=>(out[i].t.channels||['popup']).includes('popup')):[];
    if(fired){try{localStorage.setItem('st_fired_'+this.uid(),JSON.stringify({d:iso(this.today),f:fired}));}catch(e){}}
    this.setState(st=>({fired:fired||st.fired,log:[...items,...st.log].slice(0,40),unread:st.unread+items.length,toasts:[...pops.slice(0,2),...st.toasts].slice(0,2)}));
    pops.forEach(p=>setTimeout(()=>this.dismiss(p.id),p.sticky?30000:9000));
  }
  dismiss(id){this.setState(s=>({toasts:s.toasts.filter(t=>t.id!==id)}));}
  info(title,msg){const it={id:'i'+Date.now(),tag:'ระบบ',c:'var(--primary)',title:'',task:title,msg,time:fmt(this.nowMin()),noTask:true};this.setState(s=>({toasts:[it,...s.toasts].slice(0,2)}));setTimeout(()=>this.dismiss(it.id),4000);}
  play(tone,vol,times=1){try{const AC=window.AudioContext||window.webkitAudioContext;this.ac=this.ac||new AC();const ctx=this.ac;if(ctx.state==='suspended')ctx.resume();
    const notes=tone==='bell'?[[830,0,1.6],[1660,0,0.9],[2490,0,0.5]]:[[659.25,0,1],[987.77,0.16,1],[1318.5,0.32,1.2]];
    for(let r=0;r<times;r++){const b=ctx.currentTime+0.03+r*(tone==='bell'?0.75:0.95);notes.forEach(([f,off,len])=>{const o=ctx.createOscillator(),g=ctx.createGain(),t=b+off;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.001,vol*0.35),t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+len);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+len+0.05);});}}catch(e){}}
  patchTask(id,patch,delay=0){
    this.setState(s=>({tasks:s.tasks.map(t=>t.id===id?{...t,...patch}:t)}));
    let q=this.patchQ[id];
    if(!q){q=this.patchQ[id]={patch:{}};this.pending++;}
    q.patch={...q.patch,...patch};clearTimeout(q.timer);
    q.timer=setTimeout(async()=>{const p=q.patch;delete this.patchQ[id];
      try{await api('PATCH','/api/tasks/'+id,p);}catch(e){this.fail(e);}
      finally{this.pending--;if(!this.pending)this.reload();}
    },delay);
  }
  setStatus(id,status){const t=this.state.tasks.find(x=>x.id===id);if(!t)return;if(status==='cancelled'){this.setState({cancelAsk:{id,reason:'',err:''}});return;}const now=fmt(this.nowMin()),p={status};if(status==='inprogress'){p.startedAt=t.startedAt||now;p.doneAt='';}if(status==='completed'){p.startedAt=t.startedAt||now;p.doneAt=now;}if(status==='pending'){p.startedAt='';p.doneAt='';}if(status==='cancelled')p.doneAt='';this.patchTask(id,p);}
  updTask(id,patch,delay){this.patchTask(id,patch,delay||0);}
  gaps(userId,date,now){const dd=this.dd(date);let cur=Math.max(480,dd===0?Math.ceil(now/15)*15:480);const busy=this.state.tasks.filter(t=>t.assignee===userId&&t.date===date&&t.status!=='cancelled').map(t=>[toMin(t.start),toMin(t.start)+t.dur]).sort((a,b)=>a[0]-b[0]);const g=[];busy.forEach(([a,b])=>{if(a>cur)g.push([cur,a]);cur=Math.max(cur,b);});if(cur<1080)g.push([cur,1080]);return g;}
  dec(t,now,uid,mob,multi){
    const dd=this.dd(t.date),st=toMin(t.start),en=st+t.dur,p=PRI[t.priority],S=ST[t.status];
    const act=t.status==='pending'||t.status==='inprogress',overdue=act&&(dd<0||(dd===0&&now>en));
    const notStarted=t.status==='pending'&&dd===0&&now>=st&&now<=en,until=dd*1440+st-now,soon=t.status==='pending'&&until>0&&until<=60;
    const late=t.status==='completed'&&!!t.doneAt&&toMin(t.doneAt)>en;
    let flag='',fc='',fb='';
    if(overdue){flag=t.hist?'ไม่ได้ดำเนินการ':'เกินเวลา';fc='#B83A32';fb='#FAE8E5';}else if(notStarted){flag='ถึงเวลาแล้ว · ยังไม่เริ่ม';fc='#9A6210';fb='#FAF0DC';}else if(soon){flag='อีก '+until+' นาที';fc='var(--primary)';fb='var(--ptint)';}else if(late){flag='เสร็จล่าช้า';fc='#9A6210';fb='#FAF0DC';}
    const mineR=(t.rsvp||{})[uid],invited=(t.attendees||[]).includes(uid)&&t.assignee!==uid;
    if(!flag&&invited){flag=!mineR?'รอตอบรับ':mineR.status==='accepted'?'ตอบรับแล้ว':'ปฏิเสธแล้ว';fc=!mineR?'#9A6210':mineR.status==='accepted'?'#2E7040':'#6B6963';fb=!mineR?'#FAF0DC':mineR.status==='accepted'?'#DDF0E1':'#E4E3E0';}
    const ce=this.canEdit(t,uid),nx=!ce?null:t.status==='pending'?['เริ่มงาน','inprogress']:t.status==='inprogress'?['เสร็จแล้ว','completed']:null,done=t.status==='completed'||t.status==='cancelled';
    return {...t,dd,st,en,overdue,soon,late,notStarted,canEdit:ce,timeRange:t.start+'–'+fmt(en),durLabel:durTxt(t.dur),priLabel:p.label,priC:p.c,priBg:p.bg,statusLabel:S.label,statusG:S.g,statusC:S.c,statusBg:S.bg,hasRepeat:t.repeat!=='none',repeatLabel:t.repeat==='none'?'ครั้งเดียว':'วนซ้ำ'+REP[t.repeat],assigneeName:uName(t.assignee),showAssignee:t.assignee!==uid||!!multi,flag,hasFlag:!!flag,flagC:fc,flagBg:fb,hasNext:!!nx,nextLabel:nx?nx[0]:'',onNext:()=>nx&&this.setStatus(t.id,nx[1]),open:()=>this.setState({sel:t.id}),deco:done?'line-through':'none',titleC:done?'var(--muted2)':'var(--text)',nextBg:nx&&nx[1]==='completed'?'var(--primary)':'var(--surface)',nextC:nx&&nx[1]==='completed'?'#fff':'var(--primary)',hasNote:!!t.note,cancelNote:t.status==='cancelled'&&t.cancelReason?'เหตุผลที่ยกเลิก: '+t.cancelReason:'',rowBg:overdue&&!t.hist?'var(--rowover)':'var(--surface)',
      rowCols:mob?'46px 4px minmax(0,1fr)':'64px 4px minmax(0,1fr) auto',spanRow:mob?'span 2':'auto',actCol:mob?'3':'auto',actJust:mob?'flex-start':'flex-end'};
  }
  chip(label,on,onClick){return {label,onClick,bg:on?'var(--primary)':'var(--surface)',c:on?'#fff':'var(--text)',border:on?'var(--primary)':'var(--border2)'};}
  seg(label,on,onClick){return {label,onClick,bg:on?'var(--surface)':'transparent',c:on?'var(--text)':'var(--muted)',sh:on?'0 1px 2px rgba(0,0,0,0.12)':'none'};}
  tog(label,desc,on,onClick){return {label,desc,onClick,trackBg:on?'var(--primary)':'var(--toggleoff)',knobL:on?'18px':'2px'};}
  setS(patch){this.setState(s=>({settings:{...s.settings,...patch}}),()=>{clearTimeout(this.setT);this.setT=setTimeout(()=>api('PUT','/api/settings',this.state.settings).catch(e=>this.fail(e,true)),800);});}
  setF(patch){this.setState(s=>({form:{...s.form,...patch},formErr:false}));}
  openCreate(pre){const s=this.state,now=this.nowMin(),uid=this.uid(),u=USERS.find(x=>x.id===uid);if(this.rk(uid)==='admin'){if(s.view==='users')this.openUserForm(null);return;}const mgA=this.mg(uid),asg=s.scope==='dir'&&mgA[0]?mgA[0]:uid;this.setState({attQ:'',attOpen:false,showCreate:true,showLog:false,formErr:false,form:{title:'',type:asg!==uid?'ประชุม':(u.defType||'เอกสาร'),priority:'medium',date:iso(this.today),start:fmt(Math.ceil(now/15)*15+15),dur:30,repeat:'none',assignee:asg,reminders:[...s.settings.offsets],renag:true,channels:['sound','popup','push'],mode:'onsite',location:'',link:'',attendees:[],ext:'',...(pre||{})}});}
  shiftForm(min,days){const f=this.state.form;let m=toMin(f.start)+min,d=addDays(parse(f.date),days||0);while(m>=1440){m-=1440;d=addDays(d,1);}while(m<0){m+=1440;d=addDays(d,-1);}this.setF({date:iso(d),start:fmt(m)});}
  async rescheduleTask(id,min,days){const t=this.state.tasks.find(x=>x.id===id);if(!t)return;let m=toMin(t.start)+min,d=addDays(parse(t.date),days||0);while(m>=1440){m-=1440;d=addDays(d,1);}const p={date:iso(d),start:fmt(m)};if(!(await this.confirmSlot({id:t.id,assignee:t.assignee,date:p.date,start:p.start,dur:t.dur,attendees:t.attendees})))return;this.setState(s=>({fired:Object.fromEntries(Object.entries(s.fired).filter(([k])=>!k.includes(':'+id+'-')))}));this.patchTask(id,p);this.info('เลื่อนงานแล้ว',t.title+' → '+parse(p.date).toLocaleDateString('th-TH',{day:'numeric',month:'short'})+' '+p.start);}
  customReschedule(id,r){const t=this.state.tasks.find(x=>x.id===id);if(!t)return 'ไม่พบงาน';if(!/^\d{4}-\d{2}-\d{2}$/.test(r.date||''))return 'กรุณาเลือกวันที่';if(!/^\d{2}:\d{2}$/.test(r.start||'')||!/^\d{2}:\d{2}$/.test(r.end||''))return 'กรุณาระบุเวลาเริ่มและเวลาสิ้นสุด';const dur=toMin(r.end)-toMin(r.start);if(dur<5)return 'เวลาสิ้นสุดต้องหลังเวลาเริ่มอย่างน้อย 5 นาที';this.applyCustom(t,r,dur);return '';}
  async applyCustom(t,r,dur){if(!(await this.confirmSlot({id:t.id,assignee:t.assignee,date:r.date,start:r.start,dur,attendees:t.attendees})))return;this.setState(s=>({fired:Object.fromEntries(Object.entries(s.fired).filter(([k])=>!k.includes(':'+t.id+'-')))}));this.patchTask(t.id,{date:r.date,start:r.start,dur});this.info('เลื่อนงานแล้ว',t.title+' → '+this.slotLabel(r.date,r.start)+'–'+r.end);}
  slotLabel(date,start){return parse(date).toLocaleDateString('th-TH',{weekday:'short',day:'numeric',month:'short'})+' '+start;}
  openEdit(id){const t=this.state.tasks.find(x=>x.id===id);if(!t||!this.canEdit(t,this.uid()))return;this.setState({attQ:'',attOpen:false,showCreate:true,showLog:false,formErr:false,sel:null,form:{id:t.id,origDate:t.date,origStart:t.start,title:t.title,type:t.type,priority:t.priority,date:t.date,start:t.start,dur:t.dur,repeat:t.repeat,assignee:t.assignee,reminders:[...(t.reminders||[])],renag:!!t.renag,channels:[...(t.channels||[])],mode:t.mode||'onsite',location:t.location||'',link:t.link||'',attendees:[...(t.attendees||[])],ext:t.ext||''}});}
  async saveTask(){
    const f=this.state.form;if(f.busy)return;
    if(!f.title.trim()||!f.date||!f.start){this.setState({formErr:true});return;}
    const body={title:f.title.trim(),type:f.type,priority:f.priority,date:f.date,start:f.start,dur:Number(f.dur),repeat:f.repeat,assignee:f.assignee,reminders:f.reminders,renag:!!f.renag,channels:f.channels,mode:f.mode||'onsite',location:f.location||'',link:f.link||'',attendees:f.attendees||[],ext:f.ext||''};
    this.setState({form:{...f,busy:true}});
    if(!(await this.confirmSlot(f))){this.setState(s=>({form:s.form&&{...s.form,busy:false}}));return;}
    try{
      if(f.id)await api('PATCH','/api/tasks/'+f.id,body);else await api('POST','/api/tasks',body);
      this.setState(s=>({showCreate:false,form:null,fired:f.id?Object.fromEntries(Object.entries(s.fired).filter(([k])=>!k.includes(':'+f.id+'-'))):s.fired}));
      await this.applySync(false);
      this.info(f.id?'บันทึกการแก้ไขแล้ว':'สร้างงานแล้ว',(body.assignee!==this.uid()?'ในตารางผู้บริหาร · ':'')+body.start+' · '+REP[body.repeat]);this.tick();
    }catch(e){if(e.status===401){this.fail(e);return;}this.setState(s=>({form:s.form&&{...s.form,busy:false}}));this.info('บันทึกไม่สำเร็จ',e.message);}
  }
  async deleteTask(id){try{await api('DELETE','/api/tasks/'+id);this.setState(s=>({tasks:s.tasks.filter(t=>t.id!==id),sel:null}));this.info('ลบงานแล้ว','');}catch(e){this.fail(e);}}
  async uploadFiles(id,list){
    const files=[...list];if(!files.length)return;
    const big=files.find(f=>f.size>MAX_FILE);if(big){this.info('ไฟล์ใหญ่เกินไป',big.name+' (สูงสุด 15 MB)');return;}
    this.setState({uploading:true});
    for(const f of files){try{await uploadFile(id,f);}catch(e){this.setState({uploading:false});this.fail(e);return;}}
    await this.applySync(false);this.setState({uploading:false});this.info('แนบไฟล์แล้ว',files.length+' ไฟล์');
  }
  async removeFile(f){try{await api('DELETE','/api/files/'+f.id);await this.applySync(false);}catch(e){this.fail(e);}}
  extArr(f){return (f.ext||'').split(',').map(x=>x.trim()).filter(Boolean);}
  addAtt(name){name=(name||'').trim();if(!name)return;const f=this.state.form,u=USERS.find(x=>x.name===name&&x.rk!=='admin');if(u){if(u.id!==f.assignee&&!(f.attendees||[]).includes(u.id))this.setF({attendees:[...(f.attendees||[]),u.id]});}else{const ex=this.extArr(f);if(!ex.includes(name))this.setF({ext:[...ex,name].join(', ')});this.setState(s=>({attHistory:s.attHistory.includes(name)?s.attHistory:[...s.attHistory,name]}));api('POST','/api/att-history',{name}).catch(()=>{});}this.setState({attQ:''});}
  meetV(d){const MODE={"onsite":"ในสถานที่","online":"ออนไลน์","hybrid":"ผสม (Hybrid)"};const isM=d.type==='ประชุม';const att=[...(d.attendees||[]).map(uName),...((d.ext||'').split(',').map(x=>x.trim()).filter(Boolean))];return {isMeeting:isM,modeLabel:MODE[d.mode||'onsite'],hasLocation:isM&&d.mode!=='online'&&!!d.location,hasLink:isM&&d.mode!=='onsite'&&!!d.link,attText:att.length?att.join(', '):'ยังไม่ได้ระบุ'};}
  renderVals(){
    USERS=this.state.accounts;
    const s=this.state,now=this.nowMin(),todayIso=iso(this.today),uid=this.uid(),user=USERS.find(u=>u.id===uid)||{id:'',name:'',role:'',short:'',rk:''},set=s.settings,mob=this.isMob();
    const rk=this.rk(uid),mgL=this.mg(uid),visL=this.vis(uid),scopeList=(SCOPES[rk]||[]).filter(x=>x[0]!=='dir'||mgL.length),scope=scopeList.some(x=>x[0]===s.scope)?s.scope:'mine';
    const inScope=a=>scope==='mine'?a===uid:scope==='dir'?mgL.includes(a):visL.includes(a);
    const multi=scope!=='mine';
    const q=s.q.trim().toLowerCase(),mq=t=>!q||(t.title+' '+t.type+' '+uName(t.assignee)+' '+t.note).toLowerCase().includes(q);
    const D=t=>this.dec(t,now,uid,mob,multi);
    const all=s.tasks.filter(t=>(inScope(t.assignee)||(t.attendees||[]).includes(uid))&&mq(t)).map(D);
    const histS=s.history.filter(t=>inScope(t.assignee)&&mq(t));
    const todayT=all.filter(t=>t.dd===0).sort((a,b)=>a.st-b.st);
    const todayAct=todayT.filter(t=>t.status!=='cancelled'),doneT=todayT.filter(t=>t.status==='completed');
    const overdueT=all.filter(t=>t.overdue),soonT=all.filter(t=>t.soon);
    /* ---- now/next + today timeline + next meeting ---- */
    const activeTask=todayT.find(t=>t.status==='inprogress'&&t.canEdit);
    const pendingToday=todayT.filter(t=>t.status==='pending'&&t.canEdit).sort((a,b)=>a.st-b.st);
    const dueNow=pendingToday.find(t=>t.st<=now);
    const nowItem=activeTask||dueNow||null;
    const nextItem=pendingToday.find(t=>t.id!==(nowItem&&nowItem.id)&&t.st>=(nowItem?nowItem.en:now))||pendingToday.find(t=>t.id!==(nowItem&&nowItem.id));
    const nowNext={
      now:nowItem?{title:nowItem.title,type:nowItem.type,priLabel:nowItem.priLabel,priC:nowItem.priC,priBg:nowItem.priBg,timeLabel:nowItem.timeRange,isActive:nowItem.status==='inprogress',pct:nowItem.status==='inprogress'?Math.max(0,Math.min(100,Math.round((now-nowItem.st)/nowItem.dur*100))):0,remainLabel:nowItem.status==='inprogress'?(nowItem.en>now?'เหลืออีก '+durTxt(nowItem.en-now):'เลยเวลาแล้ว '+durTxt(now-nowItem.en)):'ถึงเวลาแล้ว · ยังไม่เริ่ม',btnLabel:nowItem.status==='inprogress'?'เสร็จแล้ว':'เริ่มงาน',onBtn:()=>this.setStatus(nowItem.id,nowItem.status==='inprogress'?'completed':'inprogress'),open:nowItem.open}:null,
      next:nextItem?{title:nextItem.title,type:nextItem.type,priLabel:nextItem.priLabel,priC:nextItem.priC,priBg:nextItem.priBg,timeLabel:nextItem.timeRange,untilLabel:offTxt(Math.max(0,nextItem.st-now))+'อีก',onEarly:()=>this.setStatus(nextItem.id,'inprogress'),open:nextItem.open}:null,
    };
    const TL_START=480,TL_END=1080,TL_SPAN=TL_END-TL_START;
    const tlItems=todayT.filter(t=>t.status!=='cancelled').map(t=>{const s0=Math.max(TL_START,t.st),e0=Math.min(TL_END,t.en);if(e0<=TL_START||s0>=TL_END)return null;return{title:t.title,leftPct:((s0-TL_START)/TL_SPAN*100)+'%',widthPct:(Math.max(1.2,(e0-s0)/TL_SPAN*100))+'%',bg:t.statusBg,c:t.priC,overdue:t.overdue,open:t.open};}).filter(Boolean);
    const gapsToday=this.gaps(uid,todayIso,now).map(([a,b])=>[Math.max(a,TL_START,now),Math.min(b,TL_END)]).filter(([a,b])=>b>a);
    const freeLeft=gapsToday.reduce((sum,[a,b])=>sum+(b-a),0);
    const timeline={items:tlItems,nowPct:Math.max(0,Math.min(100,(now-TL_START)/TL_SPAN*100))+'%',inWindow:now>=TL_START&&now<=TL_END,freeLabel:freeLeft?durTxt(freeLeft):'ไม่มีเวลาว่างแล้ววันนี้',nextGapLabel:gapsToday[0]?fmt(gapsToday[0][0])+'–'+fmt(gapsToday[0][1]):'–',hours:[8,10,12,14,16,18].map(h=>({label:pad(h)+':00',pct:((h*60-TL_START)/TL_SPAN*100)+'%'}))};
    const meetingCandidates=all.filter(t=>t.type==='ประชุม'&&t.status!=='cancelled'&&(t.dd>0||(t.dd===0&&t.st>=now))).sort((a,b)=>a.dd-b.dd||a.st-b.st);
    const nmTask=meetingCandidates[0];
    let nextMeeting=null;
    if(nmTask){const mv=this.meetV(nmTask);const until=nmTask.dd*1440+nmTask.st-now;nextMeeting={title:nmTask.title,dateLabel:nmTask.dd===0?'วันนี้':nmTask.dd===1?'พรุ่งนี้':parse(nmTask.date).toLocaleDateString('th-TH',{weekday:'short',day:'numeric',month:'short'}),timeLabel:nmTask.timeRange,modeLabel:mv.modeLabel,hasLocation:mv.hasLocation,location:nmTask.location,attText:mv.attText,hasLink:mv.hasLink,link:nmTask.link,urgent:until<=30,untilLabel:until<=0?'ถึงเวลาแล้ว':offTxt(until)+'อีก',open:nmTask.open};}
    let view=s.view;if(view==='team'&&rk!=='dir')view='dashboard';if(view==='approvals'&&rk!=='dir')view='dashboard';if(view==='users'&&rk!=='admin')view='dashboard';if(view==='audit'&&rk!=='admin')view='dashboard';if(rk==='admin'&&!['users','audit','alerts'].includes(view))view='users';
    const go=(v,extra={})=>()=>this.setState({view:v,showLog:false,...extra});
    const pct=todayAct.length?Math.round(doneT.length/todayAct.length*100):0;
    const stats=[
      {label:'งานวันนี้',value:todayAct.length,sub:'เสร็จ '+doneT.length+' จาก '+todayAct.length,c:'var(--primary)',onClick:go('list',{fStatus:'all',fDate:'today'})},
      {label:'ใกล้ถึงเวลา',value:soonT.length,sub:'ภายใน 60 นาที',c:'#9A6210',onClick:go('list',{fStatus:'soon'})},
      {label:'งานค้าง / เกินเวลา',value:overdueT.length,sub:'ค้างจากวันก่อน '+overdueT.filter(t=>t.dd<0).length,c:'#B83A32',onClick:go('list',{fStatus:'overdue'})},
      {label:'เสร็จแล้ววันนี้',value:doneT.length,sub:'ล่าช้า '+doneT.filter(t=>t.late).length+' งาน',c:'#2E7040',onClick:go('list',{fStatus:'completed'})},
    ];
    const cnt=k=>todayT.filter(t=>t.status===k).length;
    const breakdown=['completed','inprogress','pending','cancelled'].map(k=>({label:ST[k].label,count:cnt(k),c:ST[k].sc}));
    const tot=todayT.length||1,a1=cnt('completed')/tot*360,a2=a1+cnt('inprogress')/tot*360,a3=a2+cnt('pending')/tot*360;
    const ringBg=todayT.length?`conic-gradient(${ST.completed.sc} 0 ${a1}deg,${ST.inprogress.sc} ${a1}deg ${a2}deg,${ST.pending.sc} ${a2}deg ${a3}deg,${ST.cancelled.sc} ${a3}deg 360deg)`:'#E1DCD0';
    const isLate=t=>(t.status==='completed'&&t.doneAt&&toMin(t.doneAt)>toMin(t.start)+t.dur)||t.status==='pending'||t.status==='inprogress';
    const scopedAll=[...s.history,...s.tasks].filter(t=>inScope(t.assignee));
    const hist7=[...Array(7)].map((_,i)=>{const d=i-6;if(d===0)return [doneT.filter(t=>!t.late).length,doneT.filter(t=>t.late).length+todayT.filter(t=>t.overdue).length];const di=iso(addDays(this.today,d));const r=scopedAll.filter(t=>t.date===di&&t.status!=='cancelled');const l=r.filter(isLate).length;return [r.length-l,l];});
    const mx=Math.max(...hist7.map(([d,l])=>d+l),1);
    const week7=hist7.map(([d,l],i)=>{const day=addDays(this.today,i-6),isT=i===6;return {label:isT?'วันนี้':day.toLocaleDateString('th-TH',{weekday:'short'}),doneH:Math.round(d/mx*100)+'px',lateH:Math.round(l/mx*100)+'px',pctText:(d+l)?Math.round(d/(d+l)*100)+'%':'–',c:isT?'var(--text)':'var(--muted)',w:isT?'600':'400'};});
    const proactive=[];
    [...overdueT].sort((a,b)=>(a.priority==='high'?0:1)-(b.priority==='high'?0:1)).slice(0,3).forEach(t=>proactive.push({tag:'งานค้างเกินเวลา',title:t.title,msg:'กำหนด '+t.timeRange+(t.dd<0?' (เมื่อวาน)':'')+(t.assignee!==uid?' · '+t.assigneeName:''),c:'#B83A32',bg:'var(--tintred)',onClick:t.open}));
    all.filter(t=>t.priority==='high'&&t.notStarted).forEach(t=>proactive.push({tag:'งานสำคัญยังไม่เริ่ม',title:t.title,msg:'ควรเริ่ม '+t.start,c:'#9A6210',bg:'var(--tintamber)',onClick:t.open}));
    if(set.ai){const cand=all.filter(t=>t.overdue&&t.status==='pending'&&t.canEdit).sort((a,b)=>(a.priority==='high'?0:1)-(b.priority==='high'?0:1))[0];
      if(cand){const g=this.gaps(cand.assignee,todayIso,now).find(([a,b])=>b-a>=cand.dur);if(g)proactive.push({tag:'AI แนะนำเวลา',title:'ย้าย "'+cand.title+'" ไป '+fmt(g[0])+'–'+fmt(g[0]+cand.dur),msg:'ช่วงว่างถัดไป '+fmt(g[0])+'–'+fmt(g[1])+' · แตะเพื่อจัดตารางใหม่',c:'var(--primary)',bg:'var(--tint)',onClick:()=>{this.updTask(cand.id,{date:todayIso,start:fmt(g[0])});this.info('จัดตารางใหม่แล้ว',cand.title+' → '+fmt(g[0]));}});}}
    let fl=all;
    if(s.fStatus==='overdue')fl=fl.filter(t=>t.overdue);else if(s.fStatus==='soon')fl=fl.filter(t=>t.soon);else if(s.fStatus!=='all')fl=fl.filter(t=>t.status===s.fStatus);
    if(s.fPri!=='all')fl=fl.filter(t=>t.priority===s.fPri);
    if(s.fType!=='all')fl=fl.filter(t=>t.type===s.fType);
    const dowT=(this.today.getDay()+6)%7,fd=s.fDate;
    if(fd==='today')fl=fl.filter(t=>t.dd===0);else if(fd==='yesterday')fl=fl.filter(t=>t.dd===-1);else if(fd==='tomorrow')fl=fl.filter(t=>t.dd===1);else if(fd==='week')fl=fl.filter(t=>t.dd>=-dowT&&t.dd<=6-dowT);else if(fd==='next7')fl=fl.filter(t=>t.dd>=0&&t.dd<=6);else if(fd==='past')fl=fl.filter(t=>t.dd<0);else if(fd==='custom'&&s.fDateVal)fl=fl.filter(t=>t.date===s.fDateVal);
    fl=[...fl].sort((a,b)=>a.dd-b.dd||a.st-b.st);
    const gm={};fl.forEach(t=>{(gm[t.dd]=gm[t.dd]||[]).push(t);});
    const groups=Object.keys(gm).map(Number).sort((a,b)=>a-b).map(k=>{const d=addDays(this.today,k);return {label:k===0?'วันนี้':k===-1?'เมื่อวาน':k===1?'พรุ่งนี้':d.toLocaleDateString('th-TH',{weekday:'long'}),sub:d.toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'}),count:gm[k].length,items:gm[k]};});
    const statusChips=[['all','ทั้งหมด'],['pending','ยังไม่ทำ'],['inprogress','กำลังทำ'],['completed','เสร็จแล้ว'],['cancelled','ยกเลิก'],['overdue','เกินเวลา'],['soon','ใกล้ถึงเวลา']].map(([k,l])=>this.chip(l,s.fStatus===k,()=>this.setState({fStatus:k})));
    const priChips=[['all','ทั้งหมด'],['high','สูง · High'],['medium','กลาง · Medium'],['low','ต่ำ · Low']].map(([k,l])=>this.chip(l,s.fPri===k,()=>this.setState({fPri:k})));
    const typeChips=['all',...TYPES].map(k=>this.chip(k==='all'?'ทั้งหมด':k,s.fType===k,()=>this.setState({fType:k})));
    const occurs=(t,day)=>{const b=parse(t.date);if(t.date===iso(day))return 'base';if(t.repeat==='none'||day<b)return null;if(t.repeat==='daily')return 'ghost';if(t.repeat==='weekly'&&day.getDay()===b.getDay())return 'ghost';if(t.repeat==='monthly'&&day.getDate()===b.getDate())return 'ghost';return null;};
    const calMode=s.calMode||(mob?'month':'week');
    const histByDate={};histS.forEach(t=>{(histByDate[t.date]=histByDate[t.date]||[]).push(t);});
    const eventsFor=day=>{const di=iso(day);const a=all.map(t=>({t,k:occurs(t,day)})).filter(x=>x.k);const h=(histByDate[di]||[]).map(t=>({t:D(t),k:'base'}));return [...h,...a].sort((x,y)=>x.t.st-y.t.st);};
    const week7f=[...Array(7)].map((_,i)=>{const day=addDays(this.today,i),di=iso(day),ev=eventsFor(day).map(x=>x.t).filter(t=>t.status!=='cancelled');const first=[...ev].sort((a,b)=>a.st-b.st)[0];return{iso:di,dayNum:day.getDate(),wd:i===0?'วันนี้':day.toLocaleDateString('th-TH',{weekday:'short'}),isToday:i===0,count:ev.length,firstLabel:first?first.start+' '+first.title:'ไม่มีงาน',meetCount:ev.filter(t=>t.type==='ประชุม').length,highCount:ev.filter(t=>t.priority==='high').length,onClick:()=>{const monthOff=(day.getFullYear()-this.today.getFullYear())*12+(day.getMonth()-this.today.getMonth());this.setState({view:'calendar',calMode:'month',monthOff,selDay:di});}};});
    let calDays=[],monthCells=[],calLabel='',calPrev,calNext,calNow;
    if(calMode==='week'){
      const dow=(this.today.getDay()+6)%7,ws=addDays(this.today,-dow+s.weekOff*7),we=addDays(ws,6);
      calDays=[...Array(7)].map((_,i)=>{const day=addDays(ws,i),isToday=iso(day)===todayIso,ev=eventsFor(day);
        const lanes=[];ev.forEach(x=>{let l=lanes.findIndex(e=>e<=x.t.st);if(l<0){l=lanes.length;lanes.push(0);}lanes[l]=x.t.en;x.lane=l;});
        const n=Math.max(lanes.length,1);
        return {iso:iso(day),wd:day.toLocaleDateString('th-TH',{weekday:'short'}),num:day.getDate(),isToday,bg:isToday?'var(--today)':'var(--surface)',numC:isToday?'#fff':'var(--text)',numBg:isToday?'var(--primary)':'transparent',
          events:ev.map(({t,k,lane})=>{const g=k==='ghost';return {t,ghost:g,textC:g?'var(--text)':'#1C2826',title:t.title,time:t.start,open:t.open,top:Math.max(0,(t.st-420)/60*HOUR)+'px',height:Math.max(24,t.dur/60*HOUR-3)+'px',left:`calc(${lane*100/n}% + 2px)`,width:`calc(${100/n}% - 4px)`,bg:g?'var(--surface)':ST[t.status].bg,c:(g?ST.pending:ST[t.status]).c,stripe:(g?ST.pending:ST[t.status]).sc,bs:g?'dashed':'solid',bc:g?ST.pending.sc:'transparent',op:(!g&&t.status==='cancelled')?0.8:1,deco:(!g&&t.status==='cancelled')?'line-through':'none'};})};});
      calLabel=ws.toLocaleDateString('th-TH',{day:'numeric',month:'short'})+' – '+we.toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'});
      calPrev=()=>this.setState({weekOff:s.weekOff-1});calNext=()=>this.setState({weekOff:s.weekOff+1});calNow=()=>this.setState({weekOff:0});
    }
    const selDay=s.selDay||todayIso;
    if(calMode==='month'){
      const m0=new Date(this.today.getFullYear(),this.today.getMonth()+s.monthOff,1),gs=addDays(m0,-((m0.getDay()+6)%7));
      const weeks=Math.ceil((((m0.getDay()+6)%7)+new Date(m0.getFullYear(),m0.getMonth()+1,0).getDate())/7);
      monthCells=[...Array(weeks*7)].map((_,i)=>{const day=addDays(gs,i),di=iso(day),inM=day.getMonth()===m0.getMonth(),isT=di===todayIso,isS=di===selDay,ev=eventsFor(day);
        return {num:day.getDate(),op:inM?1:0.45,bg:isS?'var(--tint)':'var(--surface)',ring:isS?'inset 0 0 0 2px var(--primary)':'none',numC:isT?'#fff':'var(--text)',numBg:isT?'var(--primary)':'transparent',
          chips:ev.slice(0,3).map(({t,k})=>{const S=k==='ghost'?ST.pending:ST[t.status];return {t,ghost:k==='ghost',textC:k==='ghost'?'var(--text)':'#1C2826',time:t.start,title:t.title,c:S.c,stripe:S.sc,bg:k==='ghost'?'var(--surface)':S.bg,deco:k!=='ghost'&&t.status==='cancelled'?'line-through':'none'};}),
          hasMore:ev.length>3,more:'+'+(ev.length-3)+' งาน',dots:ev.slice(0,5).map(({t,k})=>({c:(k==='ghost'?ST.pending:ST[t.status]).sc})),onClick:()=>this.setState({selDay:di}),onDbl:()=>this.openCreate({date:di})};});
      calLabel=m0.toLocaleDateString('th-TH',{month:'long',year:'numeric'});
      calPrev=()=>this.setState({monthOff:s.monthOff-1});calNext=()=>this.setState({monthOff:s.monthOff+1});calNow=()=>this.setState({monthOff:0,selDay:todayIso});
    }
    const sdItems=calMode==='month'?eventsFor(parse(selDay)).map(({t,k})=>k==='ghost'?{...t,statusLabel:'ตามกำหนด',statusG:'↻',statusC:'var(--muted)',statusBg:'var(--soft)',hasNext:false,hasFlag:true,flag:'รอบวนซ้ำ',flagC:'var(--muted)',flagBg:'var(--soft)',deco:'none',titleC:'var(--text)',rowBg:'var(--surface)'}:t):[];
    const team=USERS.filter(u=>u.rk!=='admin'&&u.active!==false).map(u=>{const tt=s.tasks.filter(t=>t.assignee===u.id).map(D),td=tt.filter(t=>t.dd===0&&t.status!=='cancelled'),dn=td.filter(t=>t.status==='completed').length,od=tt.filter(t=>t.overdue).length,cur=td.find(t=>t.status==='inprogress'),nx=td.filter(t=>t.status==='pending'&&t.st>=now).sort((a,b)=>a.st-b.st)[0];
      const h=s.history.filter(t=>t.assignee===u.id&&this.dd(t.date)>=-8&&t.status!=='cancelled'),hr=h.length?Math.round(h.filter(t=>!isLate(t)).length/h.length*100):0,p=td.length?Math.round(dn/td.length*100):0;
      return {...u,total:td.length,done:dn,overdue:od,odC:od?'#B83A32':'var(--text)',pct:p,pctW:p+'%',curText:cur?'กำลังทำ: '+cur.title:nx?'ถัดไป '+nx.start+' · '+nx.title:'ไม่มีงานรอในวันนี้',rate7:hr+'%'};});
    const teamOverdue=s.tasks.map(D).filter(t=>t.overdue).map(t=>({...t,showAssignee:true}));
    const tAll=team.reduce((a,m)=>a+m.total,0),tDone=team.reduce((a,m)=>a+m.done,0);
    const teamKpis=[{label:'งานทั้งทีมวันนี้',value:tAll,c:'var(--text)'},{label:'เสร็จแล้ว',value:tDone,c:'#2E7040'},{label:'ค้างเกินเวลา',value:teamOverdue.length,c:'#B83A32'},{label:'ความคืบหน้า',value:(tAll?Math.round(tDone/tAll*100):0)+'%',c:'var(--primary)'}];
    /* ---- role-specific dashboard panels ---- */
    let secBoards=[],secConflicts=[],secPendingAppt=[],secPendingDocs=[];
    if(rk==='sec'){
      secBoards=[uid,...mgL].map(pid=>{const person=USERS.find(x=>x.id===pid)||{};const items=s.tasks.filter(t=>t.assignee===pid&&this.dd(t.date)===0).map(D).sort((a,b)=>a.st-b.st);return{id:pid,name:pid===uid?'ตารางของฉัน':person.name,items,empty:!items.length};});
      mgL.forEach(dirId=>{
        const mine=s.tasks.filter(t=>t.assignee===uid&&t.date===todayIso&&t.status!=='cancelled');
        const theirs=s.tasks.filter(t=>t.assignee===dirId&&t.date===todayIso&&t.status!=='cancelled');
        mine.forEach(a=>theirs.forEach(b=>{const as=toMin(a.start),ae=as+a.dur,bs=toMin(b.start),be=bs+b.dur;if(as<be&&bs<ae)secConflicts.push({a:a.title,b:b.title,dirName:uName(dirId),range:fmt(Math.max(as,bs))+'–'+fmt(Math.min(ae,be))});}));
      });
      const pendingMine=s.tasks.filter(t=>t.creator===uid&&mgL.includes(t.assignee)&&(t.approvalStatus==='pending'||t.approvalStatus==='rejected')).map(D).sort((a,b)=>(a.approvalStatus==='rejected'?0:1)-(b.approvalStatus==='rejected'?0:1)||a.dd-b.dd||a.st-b.st);
      secPendingAppt=pendingMine.filter(t=>t.type!=='เอกสาร');
      secPendingDocs=pendingMine.filter(t=>t.type==='เอกสาร');
    }
    let dirSummary='',dirPendingApprovals=[],teamOverdue2=teamOverdue;
    if(rk==='dir'){
      const meetsToday=todayT.filter(t=>t.type==='ประชุม'&&t.status!=='cancelled').length;
      const docsToday=todayT.filter(t=>t.type==='เอกสาร'&&t.status!=='cancelled').length;
      const freeSlots=this.gaps(uid,todayIso,now).filter(([a,b])=>b-a>=30);
      dirSummary='ประชุม '+meetsToday+' · เอกสาร '+docsToday+' · ว่าง '+(freeSlots.length?fmt(freeSlots[0][0])+'–'+fmt(freeSlots[0][1]):'ไม่มีช่วงว่าง');
      dirPendingApprovals=s.tasks.filter(t=>t.assignee===uid&&t.approvalStatus==='pending').map(D).sort((a,b)=>a.dd-b.dd||a.st-b.st).map(t=>({...t,creatorName:uName(t.creator),onApprove:()=>this.askApprove(t.id,'approved'),onReject:()=>this.askApprove(t.id,'rejected')}));
      const pendingIds=new Set(dirPendingApprovals.map(t=>t.id));
      // "must decide" stays personal — the director's own overdue work, not the whole org (that's what ภาพรวมทีม is for)
      teamOverdue2=s.tasks.map(D).filter(t=>t.assignee===uid&&t.overdue&&!pendingIds.has(t.id)).map(t=>({...t,showAssignee:false}));
    }
    let nurseNextCare=null,nurseChecklist=[],nurseSwapsIn=[],nurseSwapsOut=[];
    if(rk==='nur'){
      const care=todayT.filter(t=>['ดูแลผู้ป่วย','ตรวจสอบ'].includes(t.type)&&t.status==='pending').sort((a,b)=>a.st-b.st)[0];
      if(care){const until=care.st-now;nurseNextCare={title:care.title,timeLabel:care.start,untilLabel:until<=0?'ถึงเวลาแล้ว':offTxt(until)+'อีก',due:until<=0,open:care.open};}
      nurseChecklist=todayAct.map(t=>({id:t.id,title:t.title,timeLabel:t.start,type:t.type,done:t.status==='completed',onToggle:()=>this.setStatus(t.id,t.status==='completed'?'pending':'completed')}));
      nurseSwapsIn=s.nurse.swaps.filter(x=>!x.mine&&x.status==='pending').map(x=>({...x,onAccept:()=>this.respondSwap(x.id,'accepted'),onDecline:()=>this.respondSwap(x.id,'declined')}));
      nurseSwapsOut=s.nurse.swaps.filter(x=>x.mine).slice(0,5).map(x=>({...x,onCancel:x.status==='pending'?()=>this.cancelSwap(x.id):null}));
    }
    let genBills=[],genNextAppt=null,genClaims=[];
    if(rk==='gen'){
      const activeG=all.filter(t=>t.status!=='cancelled');
      genBills=activeG.filter(t=>t.type==='เอกสาร'&&t.status!=='completed').sort((a,b)=>a.dd-b.dd||a.st-b.st).slice(0,5);
      genNextAppt=activeG.filter(t=>t.type==='นัดหมาย'&&t.status!=='completed'&&(t.dd>0||(t.dd===0&&t.st>=now))).sort((a,b)=>a.dd-b.dd||a.st-b.st)[0]||null;
      genClaims=activeG.filter(t=>t.type==='เคลม').sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
    }
    const rr=s.rRange,inR=t=>{const d=this.dd(t.date);return d<=0&&d>-rr;};
    const recs=[...histS,...s.tasks.filter(t=>inScope(t.assignee)&&mq(t))].filter(inR).map(D);
    const valid=recs.filter(t=>t.status!=='cancelled'),comp=valid.filter(t=>t.status==='completed'),lateR=valid.filter(t=>t.late||t.overdue);
    const spent=comp.filter(t=>t.startedAt&&t.doneAt).map(t=>toMin(t.doneAt)-toMin(t.startedAt));
    const rKpis=[{label:'งานทั้งหมด',value:valid.length,c:'var(--text)'},{label:'อัตราสำเร็จ',value:(valid.length?Math.round(comp.length/valid.length*100):0)+'%',c:'var(--primary)'},{label:'ล่าช้า / ค้าง',value:lateR.length,c:'#B83A32'},{label:'ยกเลิก',value:recs.length-valid.length,c:'#7A7770'},{label:'เวลาเฉลี่ยต่องาน',value:spent.length?Math.round(spent.reduce((a,b)=>a+b,0)/spent.length)+' น.':'–',c:'var(--text)'}];
    const agg=(key,labels)=>labels.map(([k,l])=>{const r=valid.filter(t=>t[key]===k),dn=r.filter(t=>t.status==='completed'&&!t.late).length,lt=r.filter(t=>t.late||t.overdue).length,tt=r.length||1;return {label:l,total:r.length,done:r.filter(t=>t.status==='completed').length,pct:r.length?Math.round(r.filter(t=>t.status==='completed').length/r.length*100):0,doneW:(dn/tt*100)+'%',lateW:(lt/tt*100)+'%'};}).filter(x=>x.total>0);
    const rByType=agg('type',TYPES.map(t=>[t,t]));
    const people=USERS.filter(u=>inScope(u.id));
    const rByPerson=agg('assignee',people.map(u=>[u.id,u.name]));
    const rRows=[...recs].sort((a,b)=>b.date.localeCompare(a.date)||b.st-a.st).slice(0,40).map(t=>({...t,dateS:parse(t.date).toLocaleDateString('th-TH',{day:'2-digit',month:'short'}),times:t.startedAt?t.startedAt+'–'+(t.doneAt||'…'):'–',timeC:t.late?'#9A6210':'var(--text)',noteS:(t.status==='cancelled'&&t.cancelReason?'ยกเลิก: '+t.cancelReason:'')||t.note||'–',statusLabel:t.overdue?'ค้าง':t.statusLabel,statusC:t.overdue?'#B83A32':t.statusC,statusBg:t.overdue?'#FAE8E5':t.statusBg}));
    const rStart=addDays(this.today,-(rr-1));
    const lvlDesc={quiet:'Popup อย่างเดียว ไม่มีเสียง',normal:'เสียง 1 ครั้ง + Popup + Push (ปิดเองใน 9 วินาที)',urgent:'เสียง 3 ครั้ง ดังเต็มระดับ + Popup ค้าง 30 วินาที'};
    const intensityRows=['high','medium','low'].map(p=>({label:'ความสำคัญ'+PRI[p].label+' · '+PRI[p].en,c:PRI[p].c,desc:lvlDesc[set.intensity[p]],opts:[['quiet','เงียบ'],['normal','ปกติ'],['urgent','เร่งด่วน']].map(([k,l])=>this.seg(l,set.intensity[p]===k,()=>this.setS({intensity:{...set.intensity,[p]:k}})))}));
    const perm=typeof Notification==='undefined'?'เบราว์เซอร์ไม่รองรับ':Notification.permission==='granted'?'อนุญาตแล้ว':Notification.permission==='denied'?'ถูกปฏิเสธในเบราว์เซอร์':'แตะเพื่อขอสิทธิ์';
    const channelToggles=[
      this.tog('เสียง (Bell / Chime)','เล่นเสียงตามระดับความสำคัญ',set.sound,()=>this.setS({sound:!set.sound})),
      this.tog('Push Notification','แจ้งเตือนของระบบปฏิบัติการ · '+perm,set.push,()=>{const on=!set.push;this.setS({push:on});if(on&&typeof Notification!=='undefined'&&Notification.permission==='default'){try{Notification.requestPermission().then(()=>this.forceUpdate());}catch(e){}}}),
      this.tog('Popup ในระบบ','การ์ดแจ้งเตือนมุมขวาล่าง พร้อมปุ่มเริ่มงาน / เลื่อน',set.popup,()=>this.setS({popup:!set.popup})),
    ];
    const toneChips=[['chime','Chime · กระดิ่งสามโน้ต'],['bell','Bell · ระฆัง']].map(([k,l])=>this.chip(l,set.tone===k,()=>{this.setS({tone:k});this.play(k,set.volume/100);}));
    const offChips=[5,15,30,60,1440].map(o=>this.chip(offTxt(o),set.offsets.includes(o),()=>this.setS({offsets:set.offsets.includes(o)?set.offsets.filter(x=>x!==o):[...set.offsets,o]})));
    const renagToggle=[this.tog('เตือนซ้ำถ้ายังไม่ทำ','แจ้งซ้ำเป็นระยะหลังถึงเวลาเริ่ม จนกว่าจะกดเริ่มงาน',set.renag,()=>this.setS({renag:!set.renag}))];
    const everyChips=[5,10,15,30].map(m=>this.chip(m+' นาที',set.renagEvery===m,()=>this.setS({renagEvery:m})));
    const proToggles=[
      this.tog('งานค้างเกินเวลา','แจ้งเมื่องานเลยเวลาสิ้นสุดแต่ยังไม่เสร็จ',set.overdue,()=>this.setS({overdue:!set.overdue})),
      this.tog('งานสำคัญยังไม่เริ่ม','แจ้งทันทีเมื่อถึงเวลาเริ่มงานความสำคัญสูง',set.highNotStarted,()=>this.setS({highNotStarted:!set.highNotStarted})),
      this.tog('AI แนะนำเวลาที่เหมาะสม','หาช่วงว่างในตารางเพื่อจัดงานค้างหรืองานใหม่',set.ai,()=>this.setS({ai:!set.ai})),
    ];
    let selV={},statusOpts=[];
    const selT=s.tasks.find(t=>t.id===s.sel)||s.history.find(t=>t.id===s.sel);
    if(selT){const d=D(selT);const sp=(d.startedAt&&d.doneAt)?durTxt(Math.max(0,toMin(d.doneAt)-toMin(d.startedAt))):d.status==='inprogress'&&d.startedAt&&d.dd===0?durTxt(Math.max(0,now-toMin(d.startedAt)))+'…':'–';
      selV={...d,rsvpList:(d.attendees||[]).map(id=>{const a=(d.rsvp||{})[id]||{};return {name:uName(id),status:a.status||'pending',reason:a.reason||''};}),isInvitee:(d.attendees||[]).includes(uid)&&d.assignee!==uid,myRsvp:((d.rsvp||{})[uid]||{}).status||'pending',cancelInfo:d.status==='cancelled'&&d.cancelReason?d.cancelReason:'',cancelHistory:(d.cancelLog||[]).map(c=>({...c,atText:new Date(c.at).toLocaleString('th-TH',{day:'numeric',month:'short',year:'2-digit',hour:'2-digit',minute:'2-digit'})})),shiftChips:d.canEdit&&!d.hist&&(d.status==='pending'||d.status==='inprogress')?[['+15 นาที',15,0],['+1 ชม.',60,0],['พรุ่งนี้',0,1],['+1 สัปดาห์',0,7]].map(([l,m,dd])=>({label:l,onClick:()=>this.rescheduleTask(d.id,m,dd)})):[],files:(d.files||[]).map(f=>({...f,sizeText:f.size>=1048576?(f.size/1048576).toFixed(1)+' MB':Math.max(1,Math.round(f.size/1024))+' KB',byName:uName(f.by),atText:new Date(f.at).toLocaleString('th-TH',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}),onDownload:()=>downloadFile(f).catch(e=>this.fail(e)),onRemove:()=>{if(window.confirm('ลบไฟล์ '+f.name+' ?'))this.removeFile(f);}})),readOnly:!d.canEdit,roText:d.hist?'บันทึกย้อนหลัง · แก้ไขไม่ได้':uid==='dir'&&d.assignee==='dir'?'':'ดูได้อย่างเดียว · งานนี้อยู่ในความรับผิดชอบของ '+d.assigneeName,noteBg:d.canEdit?'var(--surface)':'var(--bg2)',creatorName:uName(d.creator||d.assignee),dateLabel:parse(d.date).toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric'}),remText:d.reminders.length?[...d.reminders].sort((a,b)=>b-a).map(offTxt).join(', ')+(d.renag?' · เตือนซ้ำ':''):'ไม่เตือน',chanText:(d.channels||[]).map(c=>CHAN[c]).join(' + ')||'–',startedText:d.startedAt||'–',doneText:d.doneAt||'–',spentText:sp,...this.meetV(d)};
      statusOpts=Object.keys(ST).map(k=>{const on=d.status===k;return {label:ST[k].label,en:ST[k].en,g:ST[k].g,bg:on?ST[k].bg:'var(--surface)',c:on?ST[k].c:'var(--text2)',border:on?ST[k].c:'var(--border)',onClick:()=>this.setStatus(d.id,k)};});}
    const f=s.form||{reminders:[],channels:[]};
    let hasSuggest=false,suggestText='',sugStart='';
    if(s.showCreate&&set.ai&&f.date){const g=this.gaps(f.assignee,f.date,now).find(([a,b])=>b-a>=Number(f.dur));if(g&&fmt(g[0])!==f.start){hasSuggest=true;sugStart=fmt(g[0]);suggestText='ช่วงว่างที่เหมาะสม '+fmt(g[0])+'–'+fmt(g[1])+' ในตารางของ'+uName(f.assignee);}}
    const qp=s.quick.text.trim()?parseQuickAdd(s.quick.text,this.today):null;
    const quickPreview=qp?{title:qp.title||s.quick.text.trim(),dateLabel:qp.date?parse(qp.date).toLocaleDateString('th-TH',{weekday:'short',day:'numeric',month:'short'}):'วันนี้',timeLabel:qp.start||'อัตโนมัติ (หาช่วงว่างให้)',typeLabel:qp.type||user.defType||'เอกสาร',priLabel:PRI[qp.priority||'medium'].label}:null;
    const tgl=(arr,v)=>arr.includes(v)?arr.filter(x=>x!==v):[...arr,v];
    const navDef=rk==='admin'?[['users','จัดการผู้ใช้','ผู้ใช้'],['audit','ประวัติการใช้งาน','บันทึก'],['alerts','การตั้งค่า','ตั้งค่า']]:[['dashboard','ภาพรวม','ภาพรวม'],...(rk==='dir'?[['approvals','รออนุมัติ','รออนุมัติ']]:[]),['list','รายการ Schedule','Schedule'],['calendar','ปฏิทิน','ปฏิทิน'],...(rk==='dir'?[['team','ภาพรวมทีม','ทีม']]:[]),['report','รายงาน','รายงาน'],['alerts','การตั้งค่า','ตั้งค่า']];
    const navItems=navDef.map(([k,l,sh])=>({label:l,short:sh,d:ICON[k],onClick:k==='audit'?()=>{go(k)();this.loadAudit('');}:go(k),bg:view===k?'rgba(232,238,252,0.13)':'transparent',c:view===k?'#FFFFFF':'#B9C6E6',tc:view===k?'var(--primary)':'#6B7472',hasBadge:(k==='list'&&overdueT.length>0)||(k==='approvals'&&dirPendingApprovals.length>0),badge:k==='approvals'?dirPendingApprovals.length:overdueT.length}));
    const titles={audit:'ประวัติการใช้งาน (Audit log)',users:'จัดการผู้ใช้',dashboard:'ภาพรวม',list:'รายการ Schedule',calendar:'ปฏิทิน',team:'ภาพรวมทีม',approvals:'งานที่รอยืนยัน / ลงนาม',report:'รายงาน',alerts:'การตั้งค่า'};
    const framed=mob&&this.props.preview==='มือถือ'&&this.curW()>=500;
    const fr=framed?{w:'390px',h:'844px',m:'24px auto',r:'44px',b:'10px solid var(--text)',t:'translateZ(0)'}:{w:'100%',h:'100vh',m:'0',r:'0',b:'none',t:mob?'translateZ(0)':'none'};
    return {
      fr,shellCols:mob?'minmax(0,1fr)':'252px minmax(0,1fr)',sideDisplay:mob?'none':'flex',headerPad:mob?'10px 14px':'14px 28px',contentPad:mob?'16px 14px 28px':'24px 28px 56px',searchFlex:mob?'1 1 100%':'0 1 180px',searchOrder:mob?'5':'0',createLabel:mob?'':view==='users'?'เพิ่มผู้ใช้':'สร้างงาน',showCreateBtn:rk!=='admin'||view==='users',toastBottom:mob?'84px':'18px',isMobile:mob,notMobile:!mob,loginNowLeft:Math.max(0,Math.min(100,(this.nowMin()-480)/600*100))+'%',...(()=>{const w=!mob&&this.curW()>=1024;return {loginCols:w?'minmax(0,1fr) minmax(0,1fr)':'minmax(0,1fr)',loginRows:w?'minmax(0,100%)':'max-content max-content',loginInnerOv:w?'auto':'visible',loginRightOv:w?'auto':'visible',loginOv:w?'hidden':'auto',loginPanelH:w?'100%':'auto',loginPad:mob?'32px 24px':'48px',loginCardPad:mob?'32px':'40px',loginTitleSize:mob?'19px':'24px',loginHeadSize:mob?'clamp(16px,5.2vw,24px)':'clamp(20px,2.3vw,32px)'};})(),cellH:mob?'52px':'108px',
      navItems,tabItems:navItems,tabCols:'repeat('+navItems.length+',minmax(0,1fr))',goCal:go('calendar'),goApprovals:go('approvals'),
      user,nowText:fmt(now),viewTitle:titles[view],q:s.q,onQ:e=>this.setState({q:e.target.value}),
      hasScope:scopeList.length>0,scopeOpts:scopeList.map(([k,l])=>this.seg(l,scope===k,()=>this.setState({scope:k}))),
      toggleLog:()=>this.setState(st=>({showLog:!st.showLog,unread:0})),hasUnread:s.unread>0,unread:s.unread,showLog:s.showLog,
      log:s.log.map(l=>({...l,open:()=>this.setState({sel:l.taskId,showLog:false})})),logEmpty:!s.log.length,
      openCreate:()=>this.openCreate(),createAt:(date,start)=>this.openCreate({date,...(start?{start}:{})}),
      isDash:view==='dashboard',isList:view==='list',isCal:view==='calendar',isTeam:view==='team',isApprovals:view==='approvals',isReport:view==='report',isAlerts:view==='alerts',isUsers:view==='users',isAudit:view==='audit',viewKey:view,settingsSec:s.settingsSec,setSettingsSec:k=>{this.setState({settingsSec:k});if(k==='calendar')this.loadFeed();if(k==='digest')this.loadDigest();},feedUrl:this.feedUrl(),feedLoading:s.feed.loading,copyFeed:()=>this.copyFeed(),regenFeed:()=>this.regenFeed(),downloadIcs:()=>downloadUrl('/api/my-calendar.ics','smart-schedule.ics').catch(e=>this.fail(e)),
      dg:(()=>{const d=s.digest,p=d.prefs,st=d.status;return {loading:d.loading,busy:d.busy,msg:d.msg,err:d.err,prefs:p,log:d.log,emailStatus:st.email==='smtp'?'พร้อมส่ง (SMTP)':st.email==='log'?'โหมดทดสอบ — บันทึกในระบบ ไม่ส่งจริง':'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าอีเมล — ผู้ดูแลระบบต้องตั้งค่า SMTP',lineStatus:st.line==='line'?'พร้อมส่ง (LINE Messaging API)':st.line==='log'?'โหมดทดสอบ — บันทึกในระบบ ไม่ส่งจริง':'เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า LINE — ผู้ดูแลระบบต้องตั้งค่า LINE_CHANNEL_TOKEN',enabledTog:this.tog('ส่งสรุปงานประจำวัน','ส่งรายการงานของวันนั้นให้ทุกเช้าตามเวลาที่กำหนด',p.enabled,()=>this.setDigest({enabled:!p.enabled})),emailTog:this.tog('ส่งทางอีเมล','',p.emailOn,()=>this.setDigest({emailOn:!p.emailOn})),lineTog:this.tog('ส่งทาง LINE','',p.lineOn,()=>this.setDigest({lineOn:!p.lineOn})),onTime:e=>this.setDigest({time:e.target.value}),onEmail:e=>this.setDigest({email:e.target.value}),onLineId:e=>this.setDigest({lineId:e.target.value.trim()}),save:()=>this.saveDigest(),test:()=>this.testDigest()};})(),
      rsvpReason:s.rsvpReason,onRsvpReason:e=>this.setState({rsvpReason:e.target.value}),onRsvp:st=>this.rsvpAnswer(s.sel,st),
      conflictLines:(s.showCreate&&s.form&&s.conf.key===this.confKeyOf(f)?s.conf.list:[]).map(c=>this.conflictText(c)),isAdminUser:rk==='admin',themeOpts:[['light','สว่าง','พื้นหลังสว่าง เหมาะกับการใช้งานตอนกลางวัน'],['dark','มืด','พื้นหลังมืด ถนอมสายตาตอนกลางคืน / เวรดึก'],['system','ตามอุปกรณ์','สลับสว่าง–มืดอัตโนมัติตามการตั้งค่าของเครื่อง']].map(([k,l,d])=>({k,label:l,desc:d,on:(set.theme||'light')===k,onClick:()=>this.setS({theme:k})})),
      todayLabel:this.today.toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric'}),scopeLabel:scope==='all'?(rk==='dir'?'มุมมองทั้งทีม':'งานของฉันและตารางผู้บริหาร'):scope==='dir'?'ตารางผู้บริหาร':'เฉพาะงานของฉัน',
      stats,pct,pctSub:doneT.length+'/'+todayAct.length+' งาน',ringBg,breakdown,week7,proactive,proactiveCount:proactive.length,noProactive:!proactive.length,
      todayTasks:todayT,todayEmpty:!todayT.length,
      quickText:s.quick.text,quickBusy:s.quick.busy,quickErr:s.quick.err,onQuickText:e=>this.setQuickText(e.target.value),onQuickKey:e=>{if(e.key==='Enter'){e.preventDefault();this.quickAdd();}},onQuickAdd:()=>this.quickAdd(),quickPreview,
      nowNext,timeline,nextMeeting,weekForecast:week7f,
      isSec:rk==='sec',isDir:rk==='dir',isNur:rk==='nur',isGen:rk==='gen',
      secBoards,secConflicts,secHasConflicts:!!secConflicts.length,secPendingAppt,secPendingDocs,
      dirSummary,dirPendingApprovals,dirTeamOverdue:teamOverdue2,teamMini:team.slice(0,4),todayIso,
      approveAsk:s.approveAsk,onApproveReason:e=>this.onApproveReason(e),closeApprove:()=>this.closeApprove(),confirmApprove:()=>this.confirmApprove(),
      nurseNextCare,nurseChecklist,nurseShiftLoading:s.nurse.loading,
      nurseShiftDays:[...Array(7)].map((_,i)=>{const d=addDays(this.today,i),di=iso(d);return{iso:di,label:i===0?'วันนี้':d.toLocaleDateString('th-TH',{weekday:'short',day:'numeric'}),shift:s.nurse.shiftMap[di]||'',shiftOpts:SHIFTS.map(sh=>({label:sh,on:s.nurse.shiftMap[di]===sh,onClick:()=>this.setMyShift(di,s.nurse.shiftMap[di]===sh?'':sh)}))};}),
      nurseColleagues:s.nurse.colleagues.map(c=>({...c,shiftLabel:c.shift||'ยังไม่ระบุ',canSwap:!!(c.shift&&s.nurse.shiftMap[s.nurse.colDate||todayIso]),onSwap:()=>this.openSwap(c.id,c.shift,s.nurse.colDate||todayIso)})),
      nurseColDate:s.nurse.colDate||todayIso,onLoadColleagues:date=>this.loadColleagues(date),
      nurseSwapForm:s.nurse.swapForm,nurseSwapBusy:s.nurse.swapBusy,nurseSwapErr:s.nurse.swapErr,onCloseSwap:()=>this.closeSwap(),onSendSwap:()=>this.sendSwap(),
      nurseSwapsIn,nurseSwapsOut,
      nurseHandoverNote:s.nurse.handoverNote,onHandoverNote:e=>this.setHandoverNote(e.target.value),onSaveHandover:()=>this.saveHandover(),nurseHandoverBusy:s.nurse.handoverBusy,nurseHandoverHistory:s.nurse.handoverHistory,
      genBills,genNextAppt,genClaims,
      statusChips,priChips,typeChips,groups,fDate:s.fDate,fStatus:s.fStatus,fPri:s.fPri,fType:s.fType,fDateVal:s.fDateVal,isCustomDate:s.fDate==='custom',
      dateOpts:[['all','ทุกวัน'],['today','วันนี้'],['yesterday','เมื่อวาน'],['tomorrow','พรุ่งนี้'],['week','สัปดาห์นี้'],['next7','7 วันข้างหน้า'],['past','ย้อนหลัง (ค้างจากวันก่อน)'],['custom','เลือกวันที่…']].map(([v,l])=>({v,l})),
      statusOpts2:[['all','ทุกสถานะ'],['pending','⏳ ยังไม่ทำ (Pending)'],['inprogress','▶ กำลังทำ (In Progress)'],['completed','✓ เสร็จแล้ว (Completed)'],['cancelled','✕ ยกเลิก (Cancelled)'],['overdue','เกินเวลา'],['soon','ใกล้ถึงเวลา (60 นาที)']].map(([v,l])=>({v,l})),
      priOpts2:[['all','ทุกระดับ'],['high','สูง · High'],['medium','กลาง · Medium'],['low','ต่ำ · Low']].map(([v,l])=>({v,l})),
      typeOpts2:[{v:'all',l:'ทุกประเภท'},...TYPES.map(t=>({v:t,l:t}))],
      onFDateSel:e=>this.setState({fDate:e.target.value,fDateVal:e.target.value==='custom'&&!s.fDateVal?todayIso:s.fDateVal}),onFDateVal:e=>this.setState({fDateVal:e.target.value}),onFStatusSel:e=>this.setState({fStatus:e.target.value}),onFPriSel:e=>this.setState({fPri:e.target.value}),onFTypeSel:e=>this.setState({fType:e.target.value}),
      activeFilterCount:[s.fDate,s.fStatus,s.fPri,s.fType].filter(x=>x!=='all').length,hasActiveFilter:[s.fDate,s.fStatus,s.fPri,s.fType].some(x=>x!=='all'),clearFilters:()=>this.setState({fDate:'all',fStatus:'all',fPri:'all',fType:'all'}),listCount:fl.length,listEmpty:!fl.length,
      calModes:[this.seg('สัปดาห์',calMode==='week',()=>this.setState({calMode:'week'})),this.seg('เดือน',calMode==='month',()=>this.setState({calMode:'month'}))],
      isWeek:calMode==='week',isMonth:calMode==='month',calLabel,calPrev,calNext,calNow,calDays,hours:[...Array(13)].map((_,i)=>({label:pad(7+i)+':00',top:(i*HOUR)+'px'})),nowTop:((now-420)/60*HOUR)+'px',
      monthWd:['จ.','อ.','พ.','พฤ.','ศ.','ส.','อา.'].map(label=>({label})),monthCells,
      selDayIso:selDay,selDayLabel:parse(selDay).toLocaleDateString('th-TH',{weekday:'long',day:'numeric',month:'long'}),selDayItems:sdItems,selDayCount:sdItems.length,selDayEmpty:!sdItems.length,
      team,teamOverdue,teamOverdueEmpty:!teamOverdue.length,teamKpis,
      rWho:user.name+' · '+(scope==='mine'?'งานของฉัน':scope==='dir'?'ตารางผู้บริหาร':rk==='dir'?'ทั้งทีม':'งานของฉันและผู้บริหาร'),rPeriod:rr===1?'วันนี้ '+this.today.toLocaleDateString('th-TH',{day:'numeric',month:'long',year:'numeric'}):rStart.toLocaleDateString('th-TH',{day:'numeric',month:'short'})+' – '+this.today.toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'}),
      rRanges:[[1,'วันนี้'],[7,'7 วัน'],[30,'30 วัน']].map(([k,l])=>this.seg(l,rr===k,()=>this.setState({rRange:k}))),exportPdf:()=>window.print(),exportXlsx:()=>downloadUrl('/api/export/report.xlsx?range='+rr+'&scope='+scope,'report.xlsx').catch(e=>this.fail(e)),
      rKpis,rByType,rByPerson,hasByPerson:people.length>1,rRows,
      channelToggles,toneChips,testSound:()=>this.play(set.tone,set.volume/100),volume:set.volume,onVolume:e=>this.setS({volume:Number(e.target.value)}),
      testAlert:()=>{const t=s.tasks.find(x=>x.assignee===uid&&x.status==='pending')||s.tasks[0];this.deliver([{t,kind:'reminder',title:'ทดสอบการแจ้งเตือน',msg:t.start+' · '+t.type}],null);},
      intensityRows,offChips,renagToggle,everyChips,proToggles,
      hasSel:!!selT,sel:selV,statusOpts,closeSel:()=>this.setState({sel:null,cancelAsk:null}),cancelAsk:s.cancelAsk,onCancelReason:e=>this.setState(st=>({cancelAsk:{...st.cancelAsk,reason:e.target.value,err:''}})),closeCancel:()=>this.setState({cancelAsk:null}),confirmCancel:()=>{const c=this.state.cancelAsk,r=(c.reason||'').trim();if(r.length<3){this.setState({cancelAsk:{...c,err:'กรุณาระบุเหตุผลการยกเลิก (อย่างน้อย 3 ตัวอักษร)'}});return;}this.patchTask(c.id,{status:'cancelled',doneAt:'',cancelReason:r,cancelLog:[...((this.state.tasks.find(x=>x.id===c.id)||{}).cancelLog||[]),{at:new Date().toISOString(),byName:(USERS.find(u=>u.id===this.uid())||{}).name,reason:r}]});this.setState({cancelAsk:null});this.info('ยกเลิกงานแล้ว','เก็บเหตุผลและประวัติการยกเลิกไว้ในระบบ');},onNote:e=>{if(selV.canEdit)this.updTask(s.sel,{note:e.target.value},700);},onDelete:()=>{if(window.confirm('ลบงานนี้? การลบไม่สามารถกู้คืนได้'))this.deleteTask(s.sel);},onEdit:()=>this.openEdit(s.sel),applyReschedule:(id,r)=>this.customReschedule(id,r),uploading:s.uploading,onUpload:e=>{const fl=e.target.files;this.uploadFiles(s.sel,fl).finally(()=>{try{e.target.value='';}catch(x){}});},
      showCreate:s.showCreate,form:f,isEditing:!!f.id,fEnd:f.start?fmt(toMin(f.start)+Number(f.dur||0)):'',endErr:!!f.endErr,fDurCustom:![15,30,45,60,90,120,180].includes(Number(f.dur))?durTxt(Number(f.dur)):'',onFEnd:e=>{const d=toMin(e.target.value)-toMin(f.start);if(e.target.value&&d>=5&&d<=1440)this.setF({dur:d,endErr:false});else this.setF({endErr:true});},shiftFrom:f.id?this.slotLabel(f.origDate,f.origStart):'',shiftTo:f.id&&f.date&&f.start?this.slotLabel(f.date,f.start):'',shiftChanged:!!f.id&&(f.date!==f.origDate||f.start!==f.origStart),resetShift:()=>this.setF({date:f.origDate,start:f.origStart}),fShiftChips:[['-15 นาที',-15,0],['+15 นาที',15,0],['+30 นาที',30,0],['+1 ชม.',60,0],['พรุ่งนี้',0,1],['+1 สัปดาห์',0,7]].map(([l,m,d])=>this.chip(l,false,()=>this.shiftForm(m,d))),formBusy:!!f.busy,closeCreate:()=>this.setState({showCreate:false}),saveTask:()=>this.saveTask(),formErrBorder:s.formErr?'#B83A32':'var(--border2)',
      canAssign:rk==='sec'&&mgL.length>0,noMgr:rk==='sec'&&!mgL.length,fUserChips:[[uid,'ตารางของฉัน'],...mgL.map(id=>[id,'ตาราง '+uName(id)])].map(([k,l])=>this.seg(l,f.assignee===k,()=>this.setF({assignee:k}))),
      onFTitle:e=>this.setF({title:e.target.value}),onFDate:e=>this.setF({date:e.target.value}),onFStart:e=>this.setF({start:e.target.value}),onFDur:e=>this.setF({dur:Number(e.target.value)}),
      fTypeChips:TYPES.map(k=>this.chip(k,f.type===k,()=>this.setF({type:k}))),
      fPriChips:['high','medium','low'].map(k=>{const on=f.priority===k;return {label:PRI[k].label+' · '+PRI[k].en,onClick:()=>this.setF({priority:k}),bg:on?PRI[k].bg:'var(--surface)',c:on?PRI[k].c:'var(--text2)',border:on?PRI[k].c:'var(--border)'};}),
      fRepChips:Object.keys(REP).map(k=>this.seg(REP[k],f.repeat===k,()=>this.setF({repeat:k}))),
      fRemChips:[5,15,30,60,1440].map(o=>this.chip(offTxt(o),f.reminders.includes(o),()=>this.setF({reminders:tgl(f.reminders,o)}))),
      fChanChips:Object.keys(CHAN).map(c=>this.chip(CHAN[c],f.channels.includes(c),()=>this.setF({channels:tgl(f.channels,c)}))),
      fRenag:[this.tog('เตือนซ้ำทุก '+set.renagEvery+' นาที ถ้ายังไม่เริ่มงาน','',!!f.renag,()=>this.setF({renag:!f.renag}))],
      isMeeting:f.type==='ประชุม',showLocation:(f.mode||'onsite')!=='online',showLink:(f.mode||'onsite')!=='onsite',linkWarn:!!f.link&&!/^https?:\/\//.test(f.link),
      fModeChips:[["onsite","ในสถานที่"],["online","ออนไลน์"],["hybrid","ผสม (Hybrid)"]].map(([k,l])=>this.seg(l,(f.mode||'onsite')===k,()=>this.setF({mode:k}))),
      fAttChips:USERS.filter(u=>u.rk!=='admin'&&u.active!==false&&u.id!==f.assignee).map(u=>this.chip(u.name,(f.attendees||[]).includes(u.id),()=>this.setF({attendees:tgl(f.attendees||[],u.id)}))),attCount:(f.attendees||[]).length+((f.ext||'').split(',').map(x=>x.trim()).filter(Boolean).length),
      ...(()=>{const ex=this.extArr(f),sel=f.attendees||[],q=s.attQ.trim(),ql=q.toLowerCase();
        const users=USERS.filter(u=>u.rk!=='admin'&&u.active!==false&&u.id!==f.assignee&&!sel.includes(u.id)).map(u=>({label:u.name,sub:u.role,name:u.name,w:'500'}));
        const hist=s.attHistory.filter(n=>!ex.includes(n)).map(n=>({label:n,sub:'บุคคลภายนอก',name:n,w:'400'}));
        let list=[...users,...hist].filter(o=>!ql||o.label.toLowerCase().includes(ql));
        if(q&&![...USERS.map(u=>u.name),...ex,...s.attHistory].some(n=>n.toLowerCase()===ql))list=[{label:'เพิ่ม “'+q+'”',sub:'ชื่อใหม่',name:q,w:'600'},...list];
        return {attQ:s.attQ,onAttQ:e=>this.setState({attQ:e.target.value,attOpen:true}),onAttFocus:()=>this.setState({attOpen:true}),onAttBlur:()=>setTimeout(()=>this.setState({attOpen:false}),150),
          onAttKey:e=>{if(e.key==='Enter'){e.preventDefault();const hit=list.find(o=>o.label.toLowerCase()===ql);this.addAtt(hit?hit.name:(list[0]&&ql?list[0].name:q));}else if(e.key==='Backspace'&&!s.attQ){if(ex.length)this.setF({ext:ex.slice(0,-1).join(', ')});else if(sel.length)this.setF({attendees:sel.slice(0,-1)});}else if(e.key==='Escape')this.setState({attOpen:false});},
          attTokens:[...sel.map(id=>({label:uName(id),bg:'var(--ptint)',c:'var(--primary)',onRemove:()=>this.setF({attendees:sel.filter(x=>x!==id)})})),...ex.map(n=>({label:n,bg:'var(--soft)',c:'var(--text2)',onRemove:()=>this.setF({ext:ex.filter(x=>x!==n).join(', ')})}))],
          attSuggest:list.slice(0,8).map(o=>({...o,onPick:ev=>{ev.preventDefault();this.addAtt(o.name);}})),hasAttSuggest:s.attOpen&&list.length>0};})(),
      onFLocation:e=>this.setF({location:e.target.value}),onFLink:e=>this.setF({link:e.target.value.trim()}),onFExt:e=>this.setF({ext:e.target.value}),
      hasSuggest,suggestText,applySuggest:()=>this.setF({start:sugStart}),
      ...this.authVals(s,uid),
      toasts:s.toasts.map(n=>({...n,hasTask:!n.noTask,close:()=>this.dismiss(n.id),start:()=>{this.setStatus(n.taskId,'inprogress');this.dismiss(n.id);},snooze:()=>{this.setState(st=>({snooze:{...st.snooze,[n.taskId]:this.nowMin()+5}}));this.dismiss(n.id);},open:()=>{this.setState({sel:n.taskId});this.dismiss(n.id);}})),
    };
  }
}
