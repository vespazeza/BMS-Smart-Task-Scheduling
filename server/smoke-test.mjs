// End-to-end API check. Usage: node server/smoke-test.mjs   (spawns its own server on a temp DB)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const data = fs.mkdtempSync(path.join(os.tmpdir(), 'st-test-'));
const PORT = 3999;
const srv = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', path.join(dir, 'index.js')], { env: { ...process.env, DATA_DIR: data, PORT: String(PORT), MAIL_MODE: 'log', LINE_MODE: 'log', DISABLE_DIGEST_TIMER: '1' }, stdio: 'ignore' });
const B = `http://127.0.0.1:${PORT}/api`;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL:', m); } };
const call = async (method, url, token, body, raw) => {
  const r = await fetch(B + url, { method, headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body && !raw ? { 'Content-Type': 'application/json' } : {}), ...(raw ? raw : {}) }, body: raw ? body : body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.clone().json(); } catch { /* binary */ }
  return { s: r.status, j, r };
};
const login = async (u, p) => (await call('POST', '/login', null, { username: u, password: p }));

try {
  for (let i = 0; i < 75; i++) { try { await fetch(B + '/nope'); break; } catch { await new Promise((r) => setTimeout(r, 200)); } }
  // first login: must change password
  let r = await login('admin', '1234'); ok(r.s === 200 && r.j.mustChange, 'admin first login mustChange');
  let A = r.j.token;
  r = await call('GET', '/tasks', A); ok(r.s === 404 || r.s === 403, 'other routes blocked / absent');
  r = await call('POST', '/users', A, { name: 'x', username: 'xxx', rk: 'nur', password: 'abc123' }); ok(r.s === 403 && r.j.code === 'MUST_CHANGE', 'blocked until password changed');
  r = await call('POST', '/password', A, { current: '1234', next: 'short' }); ok(r.s === 400, 'weak password rejected');
  r = await call('POST', '/password', A, { current: '1234', next: 'Admin2025x' }); ok(r.s === 200, 'password changed');
  r = await login('admin', '1234'); ok(r.s === 401, 'old password rejected');
  A = (await login('admin', 'Admin2025x')).j.token;
  // users
  const mk = async (name, username, rk, extra = {}) => (await call('POST', '/users', A, { name, username, rk, password: 'temp1234', ...extra })).j.user;
  const dir = await mk('นพ.ประเสริฐ', 'prasert', 'dir');
  const sec = await mk('คุณสุดา', 'suda', 'sec', { manages: [dir.id] });
  const nur = await mk('พว.อรทัย', 'orathai', 'nur');
  ok(dir && sec && nur, 'users created');
  r = await call('POST', '/users', A, { name: 'dup', username: 'SUDA', rk: 'nur', password: 'temp1234' }); ok(r.s === 400, 'duplicate username rejected');
  r = await login('suda', 'temp1234'); ok(r.j.mustChange, 'new user must change pw');
  const change = async (u, cur, next) => { const t = (await login(u, cur)).j.token; await call('POST', '/password', t, { current: cur, next }); return (await login(u, next)).j.token; };
  const S = await change('suda', 'temp1234', 'Suda2025x'), D = await change('prasert', 'temp1234', 'Pras2025x'), N = await change('orathai', 'temp1234', 'Orat2025x');
  // tasks + permissions
  const t0 = { title: 'ยืนยันนัด ผอ.', type: 'นัดหมาย', priority: 'high', date: '2030-01-10', start: '09:00', dur: 30, repeat: 'none', reminders: [30], channels: ['popup'] };
  r = await call('POST', '/tasks', S, { ...t0, assignee: dir.id }); ok(r.s === 200, 'secretary creates task for managed director');
  const tid = r.j.task.id;
  r = await call('POST', '/tasks', N, { ...t0, assignee: dir.id }); ok(r.s === 403, 'nurse cannot create for director');
  r = await call('POST', '/tasks', A, t0); ok(r.s === 400 || r.s === 403, 'admin cannot own tasks');
  r = await call('GET', '/sync', N); ok(r.j.tasks.length === 0, 'nurse does not see director task');
  r = await call('GET', '/sync', D); ok(r.j.tasks.length === 1, 'director sees task');
  r = await call('PATCH', '/tasks/' + tid, D, { title: 'x' }); ok(r.s === 200, 'director (assignee) can edit');
  r = await call('PATCH', '/tasks/' + tid, N, { title: 'hack' }); ok(r.s === 404 || r.s === 403, 'nurse cannot edit');
  r = await call('PATCH', '/tasks/' + tid, S, { title: 'ยืนยันนัด ผอ. (แก้)', start: '10:30', priority: 'medium' }); ok(r.s === 200 && r.j.task.start === '10:30', 'secretary edits title/time/priority');
  r = await call('PATCH', '/tasks/' + tid, S, { start: '25:99' }); ok(r.s === 400, 'invalid time rejected');
  // cancellation needs a reason and keeps history
  r = await call('PATCH', '/tasks/' + tid, S, { status: 'cancelled' }); ok(r.s === 400, 'cancel without reason rejected');
  r = await call('PATCH', '/tasks/' + tid, S, { status: 'cancelled', cancelReason: ' ' }); ok(r.s === 400, 'blank reason rejected');
  r = await call('PATCH', '/tasks/' + tid, S, { status: 'cancelled', cancelReason: 'ผู้บริหารติดภารกิจ' }); ok(r.s === 200 && r.j.task.cancelReason === 'ผู้บริหารติดภารกิจ' && r.j.task.cancelLog.length === 1 && r.j.task.cancelLog[0].byName === 'คุณสุดา', 'cancel stores reason + who');
  r = await call('PATCH', '/tasks/' + tid, S, { cancelReason: 'แอบเปลี่ยน' }); ok(r.j.task.cancelReason === 'ผู้บริหารติดภารกิจ', 'reason cannot be edited without a cancel');
  r = await call('PATCH', '/tasks/' + tid, S, { status: 'pending' }); ok(r.s === 200 && r.j.task.cancelReason === '' && r.j.task.cancelLog.length === 1, 'reactivate clears reason, keeps history');
  r = await call('PATCH', '/tasks/' + tid, S, { status: 'cancelled', cancelReason: 'เลื่อนตามหนังสือใหม่' }); ok(r.j.task.cancelLog.length === 2, 'second cancel appended to history');
  r = await call('PATCH', '/tasks/' + tid, S, { status: 'pending' }); ok(r.s === 200, 'reactivate again');
  r = await call('POST', '/tasks', S, { ...t0, assignee: dir.id, status: 'cancelled' }); ok(r.s === 400, 'cannot create a cancelled task');
  // files
  const buf = Buffer.from('ผลงานทดสอบ PDF');
  r = await call('POST', `/tasks/${tid}/files`, S, buf, { 'Content-Type': 'application/octet-stream', 'X-Filename': encodeURIComponent('รายงาน.pdf') }); ok(r.s === 200 && r.j.files.length === 1, 'upload');
  const fid = r.j.files[0].id;
  r = await call('POST', `/tasks/${tid}/files`, S, buf, { 'Content-Type': 'application/octet-stream', 'X-Filename': 'evil.exe' }); ok(r.s === 400, 'exe blocked');
  r = await call('GET', '/files/' + fid, D); ok(r.s === 200 && Buffer.from(await r.r.arrayBuffer()).equals(buf), 'assignee downloads identical bytes');
  r = await call('GET', '/files/' + fid, N); ok(r.s === 404, 'unrelated user cannot download');
  r = await call('DELETE', '/files/' + fid, N); ok(r.s === 403 || r.s === 404, 'unrelated cannot delete file');
  r = await call('DELETE', '/files/' + fid, S); ok(r.s === 200, 'delete file');
  // conflict check
  const cf = async (tok, b) => (await call('POST', '/conflicts', tok, b)).j;
  r = await cf(S, { assignee: dir.id, date: '2030-01-10', start: '10:45', dur: 30 }); ok(r.conflicts.length === 1 && r.conflicts[0].title === 'ยืนยันนัด ผอ. (แก้)' && r.conflicts[0].end === '11:00', 'overlap detected (visible title)');
  r = await cf(S, { assignee: dir.id, date: '2030-01-10', start: '11:00', dur: 30 }); ok(r.conflicts.length === 0, 'back-to-back is not a conflict');
  r = await cf(S, { assignee: dir.id, date: '2030-01-10', start: '10:45', dur: 30, ignoreId: tid }); ok(r.conflicts.length === 0, 'ignores the task being edited');
  r = await call('POST', '/tasks', N, { ...t0, title: 'เวรประจำสัปดาห์', assignee: nur.id, date: '2029-12-27', start: '09:00', dur: 60, repeat: 'weekly' }); ok(r.s === 200, 'nurse weekly task');
  r = await cf(N, { assignee: nur.id, date: '2030-01-10', start: '09:15', dur: 30 }); ok(r.conflicts.length === 1 && r.conflicts[0].self, 'recurring occurrence conflicts');
  r = await cf(S, { assignee: dir.id, date: '2030-01-10', start: '09:15', dur: 30, attendees: [nur.id] }); ok(r.conflicts.length === 1 && r.conflicts[0].personId === nur.id && r.conflicts[0].title === null, 'attendee busy shown without title');
  r = await call('POST', '/conflicts', N, { assignee: dir.id, date: '2030-01-10', start: '09:15', dur: 30 }); ok(r.s === 403, 'cannot probe schedules you cannot manage');
  // meeting RSVP
  r = await call('POST', '/tasks', S, { ...t0, title: 'ประชุมกรรมการ', type: 'ประชุม', assignee: dir.id, attendees: [nur.id], date: '2030-02-01', start: '09:00', mode: 'onsite' }); const mid = r.j.task.id;
  r = await call('POST', '/tasks/' + mid + '/rsvp', D, { status: 'accepted' }); ok(r.s === 404, 'non-attendee cannot answer');
  r = await call('POST', '/tasks/' + mid + '/rsvp', N, { status: 'maybe' }); ok(r.s === 400, 'bad rsvp status');
  r = await call('POST', '/tasks/' + mid + '/rsvp', N, { status: 'declined', reason: 'ติดเวร' }); ok(r.s === 200 && r.j.task.rsvp[nur.id].status === 'declined' && r.j.task.rsvp[nur.id].reason === 'ติดเวร', 'attendee declines with reason');
  r = await cf(S, { assignee: dir.id, date: '2030-02-01', start: '09:00', dur: 30, attendees: [nur.id], ignoreId: mid }); ok(r.conflicts.length === 0, 'declined invite frees the slot');
  r = await call('POST', '/tasks/' + mid + '/rsvp', N, { status: 'accepted' }); ok(r.j.task.rsvp[nur.id].status === 'accepted', 'attendee accepts');
  r = await call('GET', '/sync', D); ok(r.j.tasks.find((x) => x.id === mid).rsvp[nur.id].status === 'accepted', 'organizer sees the answer');
  r = await call('PATCH', '/tasks/' + mid, S, { start: '10:00' }); ok(r.j.task.rsvp && Object.keys(r.j.task.rsvp).length === 0, 'moving the meeting clears answers');
  r = await call('PATCH', '/tasks/' + mid, S, { attendees: [] }); ok(r.s === 200, 'attendee removed');
  r = await call('POST', '/tasks/' + mid + '/rsvp', N, { status: 'accepted' }); ok(r.s === 404, 'removed attendee cannot answer');
  await call('PATCH', '/tasks/' + mid, S, { attendees: [nur.id] });
  // task approval (secretary books director, director confirms/rejects)
  r = await call('POST', '/tasks', S, { ...t0, title: 'ลงนามอนุมัติงบ', type: 'เอกสาร', assignee: dir.id, date: '2030-03-01', start: '09:00' });
  ok(r.s === 200 && r.j.task.approvalStatus === 'pending', 'secretary-created director task starts pending');
  const docId = r.j.task.id;
  r = await call('POST', '/tasks', D, { ...t0, title: 'งานของตัวเอง', assignee: dir.id, date: '2030-03-01', start: '11:00' });
  ok(r.s === 200 && r.j.task.approvalStatus === 'none', 'director creating their own task needs no approval');
  r = await call('POST', '/tasks', S, { ...t0, title: 'งานของเลขาเอง', assignee: sec.id, date: '2030-03-01', start: '11:30' });
  ok(r.s === 200 && r.j.task.approvalStatus === 'none', "secretary's own task needs no approval");
  r = await call('POST', '/tasks/' + docId + '/approve', S, { status: 'approved' }); ok(r.s === 403, 'only the director approves their own task');
  r = await call('POST', '/tasks/' + docId + '/approve', D, { status: 'rejected' }); ok(r.s === 400, 'rejecting needs a reason');
  r = await call('POST', '/tasks/' + docId + '/approve', D, { status: 'rejected', reason: 'ยอดไม่ตรง' }); ok(r.s === 200 && r.j.task.approvalStatus === 'rejected' && r.j.task.approvalReason === 'ยอดไม่ตรง', 'director rejects with reason');
  r = await call('PATCH', '/tasks/' + docId, S, { start: '09:30' }); ok(r.j.task.approvalStatus === 'pending', 'editing a rejected task resubmits it for confirmation');
  r = await call('POST', '/tasks/' + docId + '/approve', D, { status: 'approved' }); ok(r.s === 200 && r.j.task.approvalStatus === 'approved', 'director approves');
  r = await call('PATCH', '/tasks/' + docId, S, { title: 'ลงนามอนุมัติงบ (แก้ชื่อ)' }); ok(r.j.task.approvalStatus === 'approved', 'unrelated edits do not reopen an approved task');
  r = await call('PATCH', '/tasks/' + docId, S, { start: '14:00' }); ok(r.j.task.approvalStatus === 'pending', 'changing the time reopens an approved task');
  r = await call('POST', '/tasks/' + docId + '/approve', D, { status: 'approved' });
  r = await call('POST', '/tasks/' + docId + '/approve', N, { status: 'approved' }); ok(r.s === 403 || r.s === 404, 'nobody else can decide it');
  r = await call('GET', '/sync', D); ok(r.j.tasks.find((x) => x.id === docId).approvalStatus === 'approved', 'director sees the current approval state');
  // shift schedule & swaps
  r = await call('GET', '/shifts', S); ok(r.s === 403, 'only nurses have shifts');
  const nur2 = await mk('พว.มานี รักงาน', 'manee', 'nur');
  const M = await change('manee', 'temp1234', 'Manee2025x');
  r = await call('PUT', '/shifts', N, { date: '2020-01-01', shift: 'เช้า' }); ok(r.s === 400, 'cannot set a shift in the past');
  r = await call('PUT', '/shifts', N, { date: '2030-04-01', shift: 'กลางวัน' }); ok(r.s === 400, 'invalid shift value rejected');
  r = await call('PUT', '/shifts', N, { date: '2030-04-01', shift: 'เช้า' }); ok(r.s === 200, 'nurse sets own shift');
  r = await call('PUT', '/shifts', M, { date: '2030-04-01', shift: 'บ่าย' }); ok(r.s === 200, 'colleague sets own shift');
  r = await call('GET', '/shifts?from=2030-04-01&to=2030-04-01', N); ok(r.j.shifts[0].shift === 'เช้า', 'reads own shift back');
  r = await call('GET', '/shifts/colleagues?date=2030-04-01', N); ok(r.j.colleagues.find((c) => c.id === nur2.id).shift === 'บ่าย', 'sees colleague shift for swap picking');
  r = await call('POST', '/shift-swaps', N, { date: '2030-04-01', toUser: nur2.id, myShift: 'บ่าย', theirShift: 'บ่าย' }); ok(r.s === 400, 'rejects a request that misstates my current shift');
  r = await call('POST', '/shift-swaps', N, { date: '2030-04-01', toUser: nur2.id, myShift: 'เช้า', theirShift: 'ดึก' }); ok(r.s === 400, "rejects a request that misstates the colleague's shift");
  r = await call('POST', '/shift-swaps', N, { date: '2030-04-01', toUser: nur2.id, myShift: 'เช้า', theirShift: 'บ่าย' }); ok(r.s === 200, 'valid swap request created');
  const swId = r.j.id;
  r = await call('GET', '/shift-swaps', M); ok(r.j.swaps.find((x) => x.id === swId).status === 'pending' && !r.j.swaps.find((x) => x.id === swId).mine, 'recipient sees the pending request');
  r = await call('POST', '/shift-swaps/' + swId + '/respond', N, { status: 'accepted' }); ok(r.s === 403, 'only the recipient can respond');
  r = await call('POST', '/shift-swaps/' + swId + '/respond', M, { status: 'accepted' }); ok(r.s === 200, 'recipient accepts');
  r = await call('GET', '/shifts?from=2030-04-01&to=2030-04-01', N); ok(r.j.shifts[0].shift === 'บ่าย', "requester's shift swapped");
  r = await call('GET', '/shifts?from=2030-04-01&to=2030-04-01', M); ok(r.j.shifts[0].shift === 'เช้า', "recipient's shift swapped");
  r = await call('POST', '/shift-swaps/' + swId + '/respond', M, { status: 'declined' }); ok(r.s === 400, 'a decided request cannot be answered again');
  r = await call('PUT', '/shifts', N, { date: '2030-04-02', shift: 'เช้า' }); await call('PUT', '/shifts', M, { date: '2030-04-02', shift: 'บ่าย' });
  r = await call('POST', '/shift-swaps', N, { date: '2030-04-02', toUser: nur2.id, myShift: 'เช้า', theirShift: 'บ่าย' }); const swId2 = r.j.id;
  r = await call('POST', '/shift-swaps/' + swId2 + '/cancel', M, {}); ok(r.s === 403, 'only the requester can cancel');
  r = await call('POST', '/shift-swaps/' + swId2 + '/cancel', N, {}); ok(r.s === 200, 'requester cancels their own request');
  r = await call('GET', '/shifts?from=2030-04-02&to=2030-04-02', N); ok(r.j.shifts[0].shift === 'เช้า', 'cancelled swap leaves shifts unchanged');
  // shift handover notes
  r = await call('PUT', '/handover', N, { date: '2030-04-01', shift: 'เช้า', note: 'ผู้ป่วยเตียง 3 ไข้ขึ้นตอนบ่าย ให้ยาลดไข้แล้ว' }); ok(r.s === 200, 'nurse saves a handover note');
  r = await call('GET', '/handover?date=2030-04-01', N); ok(r.j.note.includes('เตียง 3'), 'reads the note back');
  r = await call('GET', '/handover?date=2030-04-01', M); ok(r.j.note === '', "each nurse's handover notes are separate");
  r = await call('PUT', '/handover', S, { date: '2030-04-01', shift: 'เช้า', note: 'x' }); ok(r.s === 403, 'only nurses use handover notes');
  // calendar feed
  r = await call('GET', '/calendar-feed', N); const tok1 = r.j.token; ok(/^[0-9a-f]{48}$/.test(tok1), 'feed token issued');
  r = await call('GET', '/ics/' + tok1 + '.ics'); const ics = await r.r.text();
  ok(r.s === 200 && ics.startsWith('BEGIN:VCALENDAR') && ics.includes('SUMMARY:เวรประจำสัปดาห์') && ics.includes('RRULE:FREQ=WEEKLY') && ics.includes('SUMMARY:ประชุมกรรมการ') && ics.includes('TZID=Asia/Bangkok'), 'public ics feed has own + invited events');
  ok(ics.split('\r\n').every((l) => Buffer.byteLength(l) <= 75), 'ics lines folded to 75 octets');
  ok(!ics.includes('ยืนยันนัด'), "feed excludes other people's tasks");
  r = await call('GET', '/ics/deadbeef.ics'); ok(r.s === 404, 'unknown token 404');
  r = await call('GET', '/my-calendar.ics', N); ok(r.s === 200 && (await r.r.text()).includes('BEGIN:VEVENT'), 'authenticated ics download');
  r = await call('POST', '/calendar-feed/regenerate', N); ok(r.j.token !== tok1, 'regenerated token differs');
  r = await call('GET', '/ics/' + tok1 + '.ics'); ok(r.s === 404, 'old feed url stops working');
  r = await call('GET', '/calendar-feed', A); ok(r.s === 403, 'admin has no feed');
  // daily digest
  const todayIso = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
  r = await call('POST', '/tasks', N, { ...t0, title: 'ตรวจเวรเช้านี้', assignee: nur.id, date: todayIso, start: '08:00', dur: 30 }); ok(r.s === 200, 'task for today');
  r = await call('POST', '/digest/test', N); ok(r.s === 400, 'test without a channel is refused');
  r = await call('PUT', '/digest', N, { enabled: true, time: '25:00', email: 'n@x.com', emailOn: true, lineId: '', lineOn: false }); ok(r.s === 400, 'bad digest time');
  r = await call('PUT', '/digest', N, { enabled: true, time: '07:30', email: 'not-an-email', emailOn: true, lineId: '', lineOn: false }); ok(r.s === 400, 'bad email');
  r = await call('PUT', '/digest', N, { enabled: true, time: '07:30', email: 'n@x.com', emailOn: true, lineId: 'U' + 'a'.repeat(32), lineOn: true }); ok(r.s === 200 && r.j.prefs.time === '07:30', 'digest prefs saved');
  r = await call('POST', '/digest/test', N); ok(r.s === 200 && r.j.results.length === 2 && r.j.results.every((x) => x.ok), 'digest sent to email + LINE (log mode)');
  r = await call('GET', '/digest', N); ok(r.j.log.length === 2 && r.j.log.some((l) => (l.detail || '').includes('ตรวจเวรเช้านี้')) && r.j.status.email === 'log', "digest content lists today's task");
  r = await call('GET', '/digest', A); ok(r.s === 403, 'admin has no digest');
  // Excel export
  r = await call('GET', '/export/report.xlsx?range=30&scope=mine', N);
  ok(r.s === 200 && (r.r.headers.get('content-type') || '').includes('spreadsheetml'), 'xlsx response');
  const wb = new ExcelJS.Workbook(); await wb.xlsx.load(Buffer.from(await r.r.arrayBuffer()));
  const sheet = wb.getWorksheet('รายการงาน');
  ok(wb.getWorksheet('สรุป') && sheet && sheet.getRow(1).getCell(1).value === 'วันที่', 'xlsx has summary + detail sheets');
  ok(sheet.getSheetValues().flat().includes('ตรวจเวรเช้านี้'), 'xlsx lists the task');
  r = await call('GET', '/export/report.xlsx?range=30&scope=dir', N); const wb2 = new ExcelJS.Workbook(); await wb2.xlsx.load(Buffer.from(await r.r.arrayBuffer()));
  ok(wb2.getWorksheet('รายการงาน').rowCount === 1, 'scope=dir for a non-secretary exports no rows');
  r = await call('GET', '/export/report.xlsx', A); ok(r.s === 403, 'admin cannot export');
  // admin controls
  r = await call('PATCH', '/users/' + nur.id, A, { active: false }); ok(r.s === 200, 'admin suspends');
  r = await call('GET', '/sync', N); ok(r.s === 401, 'suspended session killed');
  r = await login('orathai', 'Orat2025x'); ok(r.s === 403, 'suspended cannot login');
  r = await call('PATCH', '/users/admin', A, { active: false }); ok(r.s === 400, 'admin cannot suspend self');
  r = await call('PATCH', '/users/' + sec.id, A, { password: 'reset9999' }); ok(r.s === 200, 'admin resets password');
  r = await call('GET', '/sync', S); ok(r.s === 401, 'reset kills sessions');
  r = await login('suda', 'reset9999'); ok(r.j.mustChange, 'reset forces change');
  r = await call('GET', '/audit', S); ok(r.s === 401 || r.s === 403, 'non-admin no audit');
  // rate limit
  for (let i = 0; i < 5; i++) await login('prasert', 'wrong');
  r = await login('prasert', 'Pras2025x'); ok(r.s === 429, 'lockout after 5 failures');
  // logout
  r = await call('POST', '/logout', D); ok(r.s === 200, 'logout'); r = await call('GET', '/sync', D); ok(r.s === 401, 'token invalid after logout');
  // audit
  r = await call('GET', '/audit?limit=500', A);
  const acts = new Set(r.j.rows.map((x) => x.action));
  for (const a of ['login', 'login.fail', 'password.change', 'user.create', 'task.create', 'task.update', 'file.upload', 'file.download', 'file.delete', 'user.update', 'user.reset-password', 'logout', 'task.cancel', 'task.rsvp', 'digest.update', 'digest.test', 'report.export', 'calendar.feed-regenerate', 'task.approve', 'task.reject', 'shift.set', 'shift.swap-request', 'shift.swap-accept', 'shift.swap-cancel', 'handover.save']) ok(acts.has(a), 'audit has ' + a);
  const upd = r.j.rows.find((x) => x.action === 'task.update' && x.detail.changes.start && x.detail.changes.start[1] === '10:30');
  ok(upd && upd.detail.changes.start[0] === '09:00' && upd.detail.changes.start[1] === '10:30' && upd.userName === 'คุณสุดา', 'audit records who changed what (old→new)');
} catch (e) { fail++; console.log('ERROR', e); }
srv.kill();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
