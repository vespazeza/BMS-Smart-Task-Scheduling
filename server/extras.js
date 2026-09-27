// Extra API features: conflict check, meeting RSVP, calendar feed (.ics), daily digest (email / LINE), Excel export.
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import ExcelJS from 'exceljs';

const p2 = (n) => String(n).padStart(2, '0');
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
const fmtM = (m) => p2(Math.floor(m / 60) % 24) + ':' + p2(m % 60);
const parseD = (s) => { const [a, b, c] = s.split('-').map(Number); return new Date(a, b - 1, c); };
const isoD = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const todayStr = () => isoD(new Date());
const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
const thDate = (s) => parseD(s).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function occursOn(t, date) {
  if (t.date === date) return true;
  if (!t.repeat || t.repeat === 'none' || date < t.date) return false;
  const b = parseD(t.date), d = parseD(date);
  if (t.repeat === 'daily') return true;
  if (t.repeat === 'weekly') return b.getDay() === d.getDay();
  if (t.repeat === 'monthly') return b.getDate() === d.getDate();
  return false;
}
const PRI = { high: 'สูง', medium: 'กลาง', low: 'ต่ำ' };
const ST = { pending: 'ยังไม่ทำ', inprogress: 'กำลังทำ', completed: 'เสร็จแล้ว', cancelled: 'ยกเลิก' };

export function install(api, ctx) {
  const { db, auth, audit, getUser, allUsers, mgOf, visIds, canSee, canEditAssignee, now } = ctx;
  const allTasks = () => db.prepare('SELECT * FROM tasks').all().map((r) => ({ id: r.id, assignee: r.assignee, ...JSON.parse(r.data) }));
  const taskOut = (id) => { const r = db.prepare('SELECT * FROM tasks WHERE id=?').get(id); return r && { id: r.id, assignee: r.assignee, ...JSON.parse(r.data) }; };

  db.exec(`
    CREATE TABLE IF NOT EXISTS feed_tokens(user_id TEXT PRIMARY KEY, token TEXT UNIQUE NOT NULL);
    CREATE TABLE IF NOT EXISTS digest_prefs(user_id TEXT PRIMARY KEY, enabled INTEGER NOT NULL DEFAULT 0, time TEXT NOT NULL DEFAULT '07:30',
      email TEXT NOT NULL DEFAULT '', email_on INTEGER NOT NULL DEFAULT 0, line_id TEXT NOT NULL DEFAULT '', line_on INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS digest_log(id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL, user_id TEXT NOT NULL, channel TEXT NOT NULL, status TEXT NOT NULL, detail TEXT);
    CREATE TABLE IF NOT EXISTS shifts(user_id TEXT NOT NULL, date TEXT NOT NULL, shift TEXT NOT NULL, PRIMARY KEY(user_id,date));
    CREATE TABLE IF NOT EXISTS shift_swaps(id TEXT PRIMARY KEY, date TEXT NOT NULL, from_user TEXT NOT NULL, to_user TEXT NOT NULL,
      from_shift TEXT NOT NULL, to_shift TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', reason TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL, decided_at TEXT);
    CREATE TABLE IF NOT EXISTS handover_notes(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, date TEXT NOT NULL, shift TEXT NOT NULL,
      note TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(user_id,date,shift));
  `);
  const rid = (p) => p + crypto.randomBytes(6).toString('hex');
  const nurseOnly = (req, res, next) => (req.user.rk === 'nur' ? next() : res.status(403).json({ error: 'เฉพาะบัญชีพยาบาล / พนักงาน' }));
  const SHIFTS = ['เช้า', 'บ่าย', 'ดึก'];

  /* ---------- task approval (secretary → director confirmation / document sign-off) ---------- */
  api.post('/tasks/:id/approve', auth(), (req, res) => {
    const u = req.user;
    const row = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'ไม่พบงาน' });
    if (row.assignee !== u.id) return res.status(403).json({ error: 'เฉพาะเจ้าของตารางเท่านั้นที่ยืนยันได้' });
    const data = JSON.parse(row.data);
    if (!data.approvalStatus || data.approvalStatus === 'none') return res.status(400).json({ error: 'งานนี้ไม่ต้องรอการยืนยัน' });
    const status = (req.body || {}).status;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    const reason = String((req.body || {}).reason || '').trim().slice(0, 300);
    if (status === 'rejected' && reason.length < 3) return res.status(400).json({ error: 'กรุณาระบุเหตุผลที่ปฏิเสธ (อย่างน้อย 3 ตัวอักษร)' });
    data.approvalStatus = status; data.approvalReason = status === 'rejected' ? reason : ''; data.approvalAt = now(); data.approvalBy = u.id;
    db.prepare('UPDATE tasks SET data=?, updated_at=? WHERE id=?').run(JSON.stringify(data), now(), row.id);
    audit(u, status === 'approved' ? 'task.approve' : 'task.reject', 'task', row.id, { title: data.title, reason: data.approvalReason });
    res.json({ task: { ...data, id: row.id, assignee: row.assignee } });
  });

  /* ---------- shift schedule & swaps (nurses) ---------- */
  api.get('/shifts', auth(), nurseOnly, (req, res) => {
    const from = DATE.test(req.query.from || '') ? req.query.from : todayStr();
    const to = DATE.test(req.query.to || '') ? req.query.to : isoD(addDays(new Date(), 13));
    const rows = db.prepare('SELECT date,shift FROM shifts WHERE user_id=? AND date BETWEEN ? AND ? ORDER BY date').all(req.user.id, from, to);
    res.json({ shifts: rows });
  });
  api.put('/shifts', auth(), nurseOnly, (req, res) => {
    const { date, shift } = req.body || {};
    if (!DATE.test(date || '')) return res.status(400).json({ error: 'วันที่ไม่ถูกต้อง' });
    if (date < todayStr()) return res.status(400).json({ error: 'แก้ไขเวรของวันที่ผ่านมาแล้วไม่ได้' });
    if (shift !== '' && !SHIFTS.includes(shift)) return res.status(400).json({ error: 'กะเวรไม่ถูกต้อง' });
    if (shift === '') db.prepare('DELETE FROM shifts WHERE user_id=? AND date=?').run(req.user.id, date);
    else db.prepare('INSERT INTO shifts(user_id,date,shift) VALUES(?,?,?) ON CONFLICT(user_id,date) DO UPDATE SET shift=excluded.shift').run(req.user.id, date, shift);
    audit(req.user, 'shift.set', 'shift', date, { shift });
    res.json({ ok: true });
  });
  api.get('/shifts/colleagues', auth(), nurseOnly, (req, res) => {
    const date = DATE.test(req.query.date || '') ? req.query.date : todayStr();
    const colleagues = allUsers().filter((x) => x.rk === 'nur' && x.active && x.id !== req.user.id).map((x) => {
      const s = db.prepare('SELECT shift FROM shifts WHERE user_id=? AND date=?').get(x.id, date);
      return { id: x.id, name: x.name, shift: s ? s.shift : '' };
    });
    res.json({ date, colleagues });
  });
  api.post('/shift-swaps', auth(), nurseOnly, (req, res) => {
    const { date, toUser, myShift, theirShift } = req.body || {};
    if (!DATE.test(date || '')) return res.status(400).json({ error: 'วันที่ไม่ถูกต้อง' });
    if (date < todayStr()) return res.status(400).json({ error: 'ขอสลับเวรของวันที่ผ่านมาแล้วไม่ได้' });
    const target = getUser(toUser);
    if (!target || target.rk !== 'nur' || !target.active || target.id === req.user.id) return res.status(400).json({ error: 'เลือกเพื่อนร่วมงานไม่ถูกต้อง' });
    if (![myShift, theirShift].every((x) => SHIFTS.includes(x))) return res.status(400).json({ error: 'กะเวรไม่ถูกต้อง' });
    const mine = db.prepare('SELECT shift FROM shifts WHERE user_id=? AND date=?').get(req.user.id, date);
    if (!mine || mine.shift !== myShift) return res.status(400).json({ error: 'ข้อมูลเวรของคุณเปลี่ยนไปแล้ว กรุณารีเฟรชแล้วลองใหม่' });
    const theirs = db.prepare('SELECT shift FROM shifts WHERE user_id=? AND date=?').get(toUser, date);
    if (!theirs || theirs.shift !== theirShift) return res.status(400).json({ error: 'ข้อมูลเวรของเพื่อนร่วมงานเปลี่ยนไปแล้ว กรุณารีเฟรชแล้วลองใหม่' });
    if (db.prepare("SELECT 1 FROM shift_swaps WHERE date=? AND from_user=? AND to_user=? AND status='pending'").get(date, req.user.id, toUser)) return res.status(400).json({ error: 'มีคำขอสลับเวรกับคนนี้ในวันนี้ค้างอยู่แล้ว' });
    const id = rid('sw');
    db.prepare('INSERT INTO shift_swaps(id,date,from_user,to_user,from_shift,to_shift,status,reason,created_at) VALUES(?,?,?,?,?,?,?,?,?)')
      .run(id, date, req.user.id, toUser, myShift, theirShift, 'pending', '', now());
    audit(req.user, 'shift.swap-request', 'shift_swap', id, { date, to: target.name, myShift, theirShift });
    res.json({ ok: true, id });
  });
  api.get('/shift-swaps', auth(), nurseOnly, (req, res) => {
    const rows = db.prepare('SELECT * FROM shift_swaps WHERE from_user=? OR to_user=? ORDER BY created_at DESC LIMIT 30').all(req.user.id, req.user.id);
    res.json({
      swaps: rows.map((r) => ({
        id: r.id, date: r.date, fromUser: r.from_user, fromName: (getUser(r.from_user) || {}).name || '—', toUser: r.to_user, toName: (getUser(r.to_user) || {}).name || '—',
        fromShift: r.from_shift, toShift: r.to_shift, status: r.status, reason: r.reason, createdAt: r.created_at, decidedAt: r.decided_at, mine: r.from_user === req.user.id,
      })),
    });
  });
  api.post('/shift-swaps/:id/respond', auth(), nurseOnly, (req, res) => {
    const row = db.prepare('SELECT * FROM shift_swaps WHERE id=?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'ไม่พบคำขอ' });
    if (row.to_user !== req.user.id) return res.status(403).json({ error: 'ไม่มีสิทธิ์ตอบคำขอนี้' });
    if (row.status !== 'pending') return res.status(400).json({ error: 'คำขอนี้ถูกตอบไปแล้ว' });
    const status = (req.body || {}).status;
    if (!['accepted', 'declined'].includes(status)) return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    if (status === 'accepted') {
      const mine = db.prepare('SELECT shift FROM shifts WHERE user_id=? AND date=?').get(row.to_user, row.date);
      if (!mine || mine.shift !== row.to_shift) return res.status(400).json({ error: 'เวรของคุณเปลี่ยนไปแล้ว ไม่สามารถยืนยันคำขอนี้ได้' });
      const theirs = db.prepare('SELECT shift FROM shifts WHERE user_id=? AND date=?').get(row.from_user, row.date);
      if (!theirs || theirs.shift !== row.from_shift) return res.status(400).json({ error: 'เวรของผู้ขอเปลี่ยนไปแล้ว ไม่สามารถยืนยันคำขอนี้ได้' });
      db.prepare('INSERT INTO shifts(user_id,date,shift) VALUES(?,?,?) ON CONFLICT(user_id,date) DO UPDATE SET shift=excluded.shift').run(row.from_user, row.date, row.to_shift);
      db.prepare('INSERT INTO shifts(user_id,date,shift) VALUES(?,?,?) ON CONFLICT(user_id,date) DO UPDATE SET shift=excluded.shift').run(row.to_user, row.date, row.from_shift);
    }
    db.prepare('UPDATE shift_swaps SET status=?, decided_at=? WHERE id=?').run(status, now(), row.id);
    audit(req.user, status === 'accepted' ? 'shift.swap-accept' : 'shift.swap-decline', 'shift_swap', row.id, { date: row.date });
    res.json({ ok: true });
  });
  api.post('/shift-swaps/:id/cancel', auth(), nurseOnly, (req, res) => {
    const row = db.prepare('SELECT * FROM shift_swaps WHERE id=?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'ไม่พบคำขอ' });
    if (row.from_user !== req.user.id) return res.status(403).json({ error: 'ไม่มีสิทธิ์ยกเลิกคำขอนี้' });
    if (row.status !== 'pending') return res.status(400).json({ error: 'คำขอนี้ถูกตอบไปแล้ว' });
    db.prepare("UPDATE shift_swaps SET status='cancelled', decided_at=? WHERE id=?").run(now(), row.id);
    audit(req.user, 'shift.swap-cancel', 'shift_swap', row.id, { date: row.date });
    res.json({ ok: true });
  });

  /* ---------- shift handover notes ---------- */
  api.get('/handover', auth(), nurseOnly, (req, res) => {
    const date = DATE.test(req.query.date || '') ? req.query.date : todayStr();
    const history = db.prepare('SELECT date,shift,note,created_at FROM handover_notes WHERE user_id=? ORDER BY created_at DESC LIMIT 6').all(req.user.id);
    const mine = history.find((r) => r.date === date) || null;
    res.json({ date, note: mine ? mine.note : '', shift: mine ? mine.shift : '', history });
  });
  api.put('/handover', auth(), nurseOnly, (req, res) => {
    const { date, shift, note } = req.body || {};
    if (!DATE.test(date || '')) return res.status(400).json({ error: 'วันที่ไม่ถูกต้อง' });
    if (!SHIFTS.includes(shift)) return res.status(400).json({ error: 'กะเวรไม่ถูกต้อง' });
    if (typeof note !== 'string' || note.length > 2000) return res.status(400).json({ error: 'บันทึกยาวเกินไป' });
    db.prepare('INSERT INTO handover_notes(user_id,date,shift,note,created_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id,date,shift) DO UPDATE SET note=excluded.note,created_at=excluded.created_at')
      .run(req.user.id, date, shift, note.trim(), now());
    audit(req.user, 'handover.save', 'handover', date + ':' + shift, { len: note.length });
    res.json({ ok: true });
  });

  /* ---------- 7. conflict check ---------- */
  api.post('/conflicts', auth(), (req, res) => {
    const u = req.user, b = req.body || {};
    const dur = Number(b.dur);
    if (!DATE.test(b.date || '') || !HHMM.test(b.start || '') || !Number.isInteger(dur) || dur < 5 || dur > 1440) return res.status(400).json({ error: 'ข้อมูลไม่ถูกต้อง' });
    const assignee = b.assignee || u.id;
    if (!canEditAssignee(u, assignee)) return res.status(403).json({ error: 'ไม่มีสิทธิ์' });
    const ids = [assignee, ...(Array.isArray(b.attendees) ? b.attendees : [])].filter((id, i, a) => typeof id === 'string' && a.indexOf(id) === i).slice(0, 30)
      .filter((id) => { const x = getUser(id); return x && x.rk !== 'admin' && x.active; });
    const s = toMin(b.start), e = s + dur;
    const tasks = allTasks();
    const out = [];
    for (const pid of ids) {
      for (const t of tasks) {
        if (t.id === b.ignoreId || t.status === 'cancelled') continue;
        const declined = t.rsvp && t.rsvp[pid] && t.rsvp[pid].status === 'declined';
        if (!(t.assignee === pid || ((t.attendees || []).includes(pid) && !declined))) continue;
        if (!occursOn(t, b.date)) continue;
        const ts = toMin(t.start), te = ts + t.dur;
        if (ts < e && s < te) out.push({ personId: pid, personName: getUser(pid).name, self: pid === assignee, taskId: t.id, start: t.start, end: fmtM(te), title: canSee(u, t) ? t.title : null });
      }
    }
    res.json({ conflicts: out.slice(0, 20) });
  });

  /* ---------- 10. meeting RSVP ---------- */
  api.post('/tasks/:id/rsvp', auth(), (req, res) => {
    const u = req.user;
    const t = taskOut(req.params.id);
    if (!t || !(t.attendees || []).includes(u.id)) return res.status(404).json({ error: 'ไม่พบคำเชิญ' });
    const status = (req.body || {}).status;
    if (!['accepted', 'declined', 'pending'].includes(status)) return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    const reason = String((req.body || {}).reason || '').trim().slice(0, 300);
    const rsvp = { ...(t.rsvp || {}) };
    if (status === 'pending') delete rsvp[u.id]; else rsvp[u.id] = { status, at: now(), reason: status === 'declined' ? reason : '' };
    const { id, assignee, ...data } = t;
    db.prepare('UPDATE tasks SET data=?, updated_at=? WHERE id=?').run(JSON.stringify({ ...data, rsvp }), now(), id);
    audit(u, 'task.rsvp', 'task', id, { title: t.title, status, reason });
    res.json({ task: taskOut(id) });
  });

  /* ---------- 11. calendar feed (.ics) ---------- */
  const fold = (line) => {
    const out = []; let cur = '', bytes = 0;
    for (const ch of line) {
      const n = Buffer.byteLength(ch);
      if (bytes + n > 74) { out.push(cur); cur = ' '; bytes = 1; }
      cur += ch; bytes += n;
    }
    out.push(cur);
    return out.join('\r\n');
  };
  const esc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  const icsLocal = (date, minutes) => { const d = new Date(Date.UTC(...date.split('-').map(Number).map((v, i) => (i === 1 ? v - 1 : v)), 0, minutes)); return `${d.getUTCFullYear()}${p2(d.getUTCMonth() + 1)}${p2(d.getUTCDate())}T${p2(d.getUTCHours())}${p2(d.getUTCMinutes())}00`; };
  const icsUtc = (iso) => iso.replace(/[-:]/g, '').replace(/\.\d+/, '');

  function buildIcs(user) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Smart Task Scheduling//TH', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'X-WR-CALNAME:' + esc('ตารางงาน — ' + user.name), 'X-WR-TIMEZONE:Asia/Bangkok',
      'BEGIN:VTIMEZONE', 'TZID:Asia/Bangkok', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0700', 'TZOFFSETTO:+0700', 'TZNAME:ICT', 'END:STANDARD', 'END:VTIMEZONE'];
    const stamp = icsUtc(new Date().toISOString());
    for (const t of allTasks()) {
      const declined = t.rsvp && t.rsvp[user.id] && t.rsvp[user.id].status === 'declined';
      if (!(t.assignee === user.id || ((t.attendees || []).includes(user.id) && !declined))) continue;
      const s = toMin(t.start);
      const desc = [`ประเภท: ${t.type}`, `ความสำคัญ: ${PRI[t.priority] || ''}`, `สถานะ: ${ST[t.status] || ''}`, t.status === 'cancelled' && t.cancelReason ? `เหตุผลที่ยกเลิก: ${t.cancelReason}` : '', t.assignee !== user.id ? `ผู้รับผิดชอบ: ${(getUser(t.assignee) || {}).name || ''}` : ''].filter(Boolean).join('\n');
      lines.push('BEGIN:VEVENT', `UID:${t.id}@smart-schedule`, `DTSTAMP:${stamp}`,
        `DTSTART;TZID=Asia/Bangkok:${icsLocal(t.date, s)}`, `DTEND;TZID=Asia/Bangkok:${icsLocal(t.date, s + t.dur)}`,
        'SUMMARY:' + esc(t.title), 'DESCRIPTION:' + esc(desc), 'CATEGORIES:' + esc(t.type),
        'STATUS:' + (t.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'));
      if (t.location && t.mode !== 'online') lines.push('LOCATION:' + esc(t.location));
      if (t.link) lines.push('URL:' + t.link.replace(/[\r\n]/g, ''));
      const freq = { daily: 'DAILY', weekly: 'WEEKLY', monthly: 'MONTHLY' }[t.repeat];
      if (freq) lines.push('RRULE:FREQ=' + freq);
      for (const m of (t.reminders || []).slice(0, 4)) lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(t.title), `TRIGGER:-PT${m}M`, 'END:VALARM');
      lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }
  const feedToken = (uid, regen) => {
    const row = db.prepare('SELECT token FROM feed_tokens WHERE user_id=?').get(uid);
    if (row && !regen) return row.token;
    const token = crypto.randomBytes(24).toString('hex');
    db.prepare('INSERT INTO feed_tokens(user_id,token) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET token=excluded.token').run(uid, token);
    return token;
  };
  api.get('/calendar-feed', auth(), (req, res) => {
    if (req.user.rk === 'admin') return res.status(403).json({ error: 'บัญชีผู้ดูแลระบบไม่มีตารางงาน' });
    res.json({ token: feedToken(req.user.id, false) });
  });
  api.post('/calendar-feed/regenerate', auth(), (req, res) => {
    if (req.user.rk === 'admin') return res.status(403).json({ error: 'บัญชีผู้ดูแลระบบไม่มีตารางงาน' });
    const token = feedToken(req.user.id, true);
    audit(req.user, 'calendar.feed-regenerate', 'user', req.user.id);
    res.json({ token });
  });
  api.get('/my-calendar.ics', auth(), (req, res) => {
    res.set({ 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="smart-schedule.ics"' });
    res.send(buildIcs(req.user));
  });
  api.get('/ics/:token', (req, res) => { // public: the secret token is the credential (Google / Outlook subscribe to this URL)
    const token = String(req.params.token).replace(/\.ics$/i, '');
    const row = /^[0-9a-f]{48}$/.test(token) && db.prepare('SELECT user_id FROM feed_tokens WHERE token=?').get(token);
    const u = row && getUser(row.user_id);
    if (!u || !u.active) return res.status(404).send('not found');
    res.set({ 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-store' });
    res.send(buildIcs(u));
  });

  /* ---------- 12. daily digest (email / LINE) ---------- */
  const mailMode = () => (process.env.MAIL_MODE === 'log' ? 'log' : process.env.SMTP_HOST ? 'smtp' : '');
  const lineMode = () => (process.env.LINE_MODE === 'log' ? 'log' : process.env.LINE_CHANNEL_TOKEN ? 'line' : '');
  let transport = null;
  const getTransport = () => transport || (transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  }));
  const logSend = (uid, channel, status, detail) => db.prepare('INSERT INTO digest_log(ts,user_id,channel,status,detail) VALUES(?,?,?,?,?)').run(now(), uid, channel, status, detail ? String(detail).slice(0, 300) : null);

  function buildDigest(user, date) {
    const tasks = allTasks();
    const owners = [user.id, ...mgOf(user)];
    const sections = owners.map((oid) => {
      const items = tasks.filter((t) => t.assignee === oid && t.status !== 'cancelled' && occursOn(t, date)).sort((a, b) => toMin(a.start) - toMin(b.start));
      return { name: oid === user.id ? 'ตารางของฉัน' : 'ตารางของ ' + getUser(oid).name, items };
    });
    const overdue = tasks.filter((t) => owners.includes(t.assignee) && (t.status === 'pending' || t.status === 'inprogress') && t.date < date && (!t.repeat || t.repeat === 'none')).length;
    const awaiting = tasks.filter((t) => (t.attendees || []).includes(user.id) && t.status !== 'cancelled' && t.date >= date && !(t.rsvp && t.rsvp[user.id])).length;
    const total = sections.reduce((n, s) => n + s.items.length, 0);
    const line = (t) => `${t.start}–${fmtM(toMin(t.start) + t.dur)}  ${t.title}  [${t.type}${t.priority === 'high' ? ' · สำคัญสูง' : ''}]${t.status === 'completed' ? ' ✓' : ''}`;
    const text = [`สรุปงานประจำวัน — ${thDate(date)}`, `สวัสดี ${user.name} วันนี้มีงาน ${total} รายการ`, '',
      ...sections.flatMap((s) => [`■ ${s.name} (${s.items.length})`, ...(s.items.length ? s.items.map(line) : ['  ไม่มีงาน']), '']),
      overdue ? `⚠ งานค้างจากวันก่อน ${overdue} รายการ` : '', awaiting ? `✉ คำเชิญประชุมที่รอตอบรับ ${awaiting} รายการ` : ''].filter((x, i, a) => x !== '' || a[i - 1] !== '').join('\n').trim();
    const h = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const html = `<div style="font-family:Tahoma,sans-serif;font-size:14px;color:#1C2826"><h2 style="margin:0 0 4px">สรุปงานประจำวัน</h2><div style="color:#5E6966">${h(thDate(date))}</div><p>สวัสดี ${h(user.name)} วันนี้มีงาน <b>${total}</b> รายการ</p>${sections.map((s) => `<h3 style="margin:14px 0 6px">${h(s.name)} (${s.items.length})</h3>${s.items.length ? `<table cellpadding="6" style="border-collapse:collapse">${s.items.map((t) => `<tr><td style="border-bottom:1px solid #eee;white-space:nowrap"><b>${t.start}–${fmtM(toMin(t.start) + t.dur)}</b></td><td style="border-bottom:1px solid #eee">${h(t.title)} <span style="color:#5E6966">· ${h(t.type)}</span></td></tr>`).join('')}</table>` : '<div style="color:#5E6966">ไม่มีงาน</div>'}`).join('')}${overdue ? `<p style="color:#B83A32">⚠ งานค้างจากวันก่อน ${overdue} รายการ</p>` : ''}${awaiting ? `<p>✉ คำเชิญประชุมที่รอตอบรับ ${awaiting} รายการ</p>` : ''}</div>`;
    return { subject: `สรุปงานประจำวัน ${date} (${total} งาน)`, text, html, total };
  }

  async function sendDigest(user, prefs, date, only) {
    const d = buildDigest(user, date);
    const results = [];
    if ((!only || only === 'email') && prefs.email_on && prefs.email) {
      const mode = mailMode();
      try {
        if (!mode) throw new Error('เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าอีเมล (SMTP_HOST)');
        if (mode === 'smtp') await getTransport().sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: prefs.email, subject: d.subject, text: d.text, html: d.html });
        logSend(user.id, 'email', mode === 'log' ? 'logged' : 'sent', mode === 'log' ? d.text : prefs.email);
        results.push({ channel: 'email', ok: true });
      } catch (e) { logSend(user.id, 'email', 'error', e.message); results.push({ channel: 'email', ok: false, error: e.message }); }
    }
    if ((!only || only === 'line') && prefs.line_on && prefs.line_id) {
      const mode = lineMode();
      try {
        if (!mode) throw new Error('เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า LINE (LINE_CHANNEL_TOKEN)');
        if (mode === 'line') {
          const r = await fetch('https://api.line.me/v2/bot/message/push', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + process.env.LINE_CHANNEL_TOKEN }, body: JSON.stringify({ to: prefs.line_id, messages: [{ type: 'text', text: d.text.slice(0, 4900) }] }) });
          if (!r.ok) throw new Error('LINE ตอบกลับ ' + r.status);
        }
        logSend(user.id, 'line', mode === 'log' ? 'logged' : 'sent', mode === 'log' ? d.text : prefs.line_id);
        results.push({ channel: 'line', ok: true });
      } catch (e) { logSend(user.id, 'line', 'error', e.message); results.push({ channel: 'line', ok: false, error: e.message }); }
    }
    return results;
  }

  const prefsOf = (uid) => db.prepare('SELECT * FROM digest_prefs WHERE user_id=?').get(uid) || { user_id: uid, enabled: 0, time: '07:30', email: '', email_on: 0, line_id: '', line_on: 0 };
  const prefsOut = (p) => ({ enabled: !!p.enabled, time: p.time, email: p.email, emailOn: !!p.email_on, lineId: p.line_id, lineOn: !!p.line_on });
  const noAdmin = (req, res, next) => (req.user.rk === 'admin' ? res.status(403).json({ error: 'บัญชีผู้ดูแลระบบไม่มีตารางงาน' }) : next());

  api.get('/digest', auth(), noAdmin, (req, res) => {
    const log = db.prepare("SELECT ts,channel,status,detail FROM digest_log WHERE user_id=? ORDER BY id DESC LIMIT 5").all(req.user.id).map((l) => ({ ts: l.ts, channel: l.channel, status: l.status, detail: l.detail }));
    res.json({ prefs: prefsOut(prefsOf(req.user.id)), status: { email: mailMode(), line: lineMode() }, log });
  });
  api.put('/digest', auth(), noAdmin, (req, res) => {
    const b = req.body || {};
    if (!HHMM.test(b.time || '')) return res.status(400).json({ error: 'เวลาไม่ถูกต้อง' });
    const email = String(b.email || '').trim();
    if (email && (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    const lineId = String(b.lineId || '').trim();
    if (lineId && !/^U[0-9a-f]{32}$/i.test(lineId)) return res.status(400).json({ error: 'LINE User ID ต้องขึ้นต้นด้วย U ตามด้วยตัวอักษร/ตัวเลข 32 ตัว' });
    if (b.emailOn && !email) return res.status(400).json({ error: 'กรุณากรอกอีเมลก่อนเปิดการส่งทางอีเมล' });
    if (b.lineOn && !lineId) return res.status(400).json({ error: 'กรุณากรอก LINE User ID ก่อนเปิดการส่งทาง LINE' });
    db.prepare(`INSERT INTO digest_prefs(user_id,enabled,time,email,email_on,line_id,line_on) VALUES(?,?,?,?,?,?,?)
      ON CONFLICT(user_id) DO UPDATE SET enabled=excluded.enabled,time=excluded.time,email=excluded.email,email_on=excluded.email_on,line_id=excluded.line_id,line_on=excluded.line_on`)
      .run(req.user.id, b.enabled ? 1 : 0, b.time, email, b.emailOn ? 1 : 0, lineId, b.lineOn ? 1 : 0);
    audit(req.user, 'digest.update', 'user', req.user.id, { enabled: !!b.enabled, time: b.time, email: !!b.emailOn, line: !!b.lineOn });
    res.json({ prefs: prefsOut(prefsOf(req.user.id)) });
  });
  api.post('/digest/test', auth(), noAdmin, async (req, res) => {
    const p = prefsOf(req.user.id);
    if (!(p.email_on && p.email) && !(p.line_on && p.line_id)) return res.status(400).json({ error: 'ยังไม่ได้เปิดช่องทางส่ง (อีเมล/LINE) หรือยังไม่ได้บันทึกการตั้งค่า' });
    const results = await sendDigest(req.user, p, todayStr());
    audit(req.user, 'digest.test', 'user', req.user.id, { results });
    res.json({ results });
  });

  const kvGet = (k) => (db.prepare('SELECT v FROM kv WHERE k=?').get(k) || {}).v;
  const kvSet = (k, v) => db.prepare('INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').run(k, v);
  async function runDigests() {
    const d = new Date(), date = isoD(d), nowM = d.getHours() * 60 + d.getMinutes();
    for (const p of db.prepare('SELECT * FROM digest_prefs WHERE enabled=1').all()) {
      const user = getUser(p.user_id);
      if (!user || !user.active || user.rk === 'admin') continue;
      const at = toMin(p.time), key = `digest:${p.user_id}:${date}`;
      if (nowM < at || nowM > at + 120 || kvGet(key)) continue; // send once, up to 2h late (e.g. server restarted)
      kvSet(key, '1');
      try { await sendDigest(user, p, date); } catch (e) { logSend(user.id, 'system', 'error', e.message); }
    }
  }
  if (!process.env.DISABLE_DIGEST_TIMER) setInterval(() => runDigests().catch(() => {}), 30000).unref();

  /* ---------- 14. Excel export ---------- */
  api.get('/export/report.xlsx', auth(), async (req, res) => {
    const u = req.user;
    if (u.rk === 'admin') return res.status(403).json({ error: 'บัญชีผู้ดูแลระบบไม่มีตารางงาน' });
    const range = [1, 7, 30].includes(Number(req.query.range)) ? Number(req.query.range) : 7;
    const scope = ['mine', 'dir', 'all'].includes(req.query.scope) ? req.query.scope : 'mine';
    const ids = scope === 'mine' ? [u.id] : scope === 'dir' ? mgOf(u) : visIds(u);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const from = isoD(addDays(today, -(range - 1))), to = isoD(today);
    const nowM = new Date().getHours() * 60 + new Date().getMinutes();
    const rows = allTasks().filter((t) => ids.includes(t.assignee) && t.date >= from && t.date <= to)
      .sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start)).map((t) => {
        const end = toMin(t.start) + t.dur;
        const active = t.status === 'pending' || t.status === 'inprogress';
        const overdue = active && (t.date < to || nowM > end);
        const late = t.status === 'completed' && t.doneAt && toMin(t.doneAt) > end;
        const spent = t.startedAt && t.doneAt ? toMin(t.doneAt) - toMin(t.startedAt) : null;
        return { t, statusText: overdue ? 'ค้าง / เกินเวลา' : ST[t.status] + (late ? ' (ล่าช้า)' : ''), late, overdue, spent, note: (t.status === 'cancelled' && t.cancelReason ? 'ยกเลิก: ' + t.cancelReason : '') || t.note || '' };
      });
    const valid = rows.filter((r) => r.t.status !== 'cancelled');
    const done = valid.filter((r) => r.t.status === 'completed');
    const spentAll = done.map((r) => r.spent).filter((v) => v != null);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Smart Task Scheduling'; wb.created = new Date();
    const ws = wb.addWorksheet('สรุป');
    ws.columns = [{ width: 26 }, { width: 16 }, { width: 16 }, { width: 16 }];
    ws.addRow(['รายงานสรุปงาน']).font = { bold: true, size: 16 };
    ws.addRow([`ผู้จัดทำ: ${u.name}`]); ws.addRow([`ช่วงเวลา: ${from} ถึง ${to}`]); ws.addRow([]);
    const kh = ws.addRow(['ตัวชี้วัด', 'ค่า']); kh.font = { bold: true };
    [['งานทั้งหมด', valid.length], ['เสร็จแล้ว', done.length], ['อัตราสำเร็จ (%)', valid.length ? Math.round((done.length / valid.length) * 100) : 0],
      ['ล่าช้า / ค้าง', rows.filter((r) => r.late || r.overdue).length], ['ยกเลิก', rows.length - valid.length], ['เวลาเฉลี่ยต่องาน (นาที)', spentAll.length ? Math.round(spentAll.reduce((a, b) => a + b, 0) / spentAll.length) : '-']].forEach((r) => ws.addRow(r));
    ws.addRow([]);
    const th = ws.addRow(['ประเภทงาน', 'ทั้งหมด', 'เสร็จแล้ว', 'ล่าช้า/ค้าง']); th.font = { bold: true };
    for (const type of [...new Set(valid.map((r) => r.t.type))]) {
      const g = valid.filter((r) => r.t.type === type);
      ws.addRow([type, g.length, g.filter((r) => r.t.status === 'completed').length, g.filter((r) => r.late || r.overdue).length]);
    }

    const w2 = wb.addWorksheet('รายการงาน', { views: [{ state: 'frozen', ySplit: 1 }] });
    w2.columns = [['วันที่', 12], ['เวลา', 14], ['งาน', 44], ['ประเภท', 14], ['ความสำคัญ', 12], ['ผู้รับผิดชอบ', 24], ['สถานะ', 18], ['เริ่มจริง', 10], ['เสร็จจริง', 10], ['ใช้เวลา (นาที)', 14], ['หมายเหตุ / เหตุผลยกเลิก', 44]].map(([header, width]) => ({ header, width }));
    w2.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    w2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F5E5B' } };
    for (const r of rows) {
      const t = r.t;
      const row = w2.addRow([t.date, `${t.start}–${fmtM(toMin(t.start) + t.dur)}`, t.title, t.type, PRI[t.priority], (getUser(t.assignee) || {}).name || '', r.statusText, t.startedAt || '', t.doneAt || '', r.spent ?? '', r.note]);
      const fill = { completed: 'FFDDF0E1', inprogress: 'FFFDE3CC', pending: 'FFFBF0C3', cancelled: 'FFE4E3E0' }[t.status];
      row.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: r.overdue ? 'FFFAE8E5' : fill } };
    }
    w2.autoFilter = { from: 'A1', to: 'K1' };
    audit(u, 'report.export', 'report', null, { range, scope, rows: rows.length });
    res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="report-${to.replace(/-/g, '')}.xlsx"` });
    await wb.xlsx.write(res);
    res.end();
  });
}

