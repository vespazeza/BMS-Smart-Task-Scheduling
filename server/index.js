// Smart Task Scheduling — self-hosted API (Express + built-in SQLite).
// Data lives in DATA_DIR (default ./server/data): smart-schedule.db + files/.
import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { install as installExtras } from './extras.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '127.0.0.1'; // set HOST=0.0.0.0 to serve the hospital LAN (put HTTPS in front)
const IDLE_MS = Number(process.env.SESSION_IDLE_MIN || 30) * 60 * 1000;
const MAX_SESSION_MS = 12 * 60 * 60 * 1000;
const MAX_FILE = 15 * 1024 * 1024;
const MAX_FILES_PER_TASK = 10;

fs.mkdirSync(path.join(DATA_DIR, 'files'), { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'smart-schedule.db'));
db.exec(`
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS users(
  id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL COLLATE NOCASE, name TEXT NOT NULL, role TEXT, short TEXT,
  rk TEXT NOT NULL, manages TEXT NOT NULL DEFAULT '[]', active INTEGER NOT NULL DEFAULT 1,
  pw_hash TEXT NOT NULL, must_change INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tasks(id TEXT PRIMARY KEY, assignee TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT, updated_at TEXT);
CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY, task_id TEXT NOT NULL, name TEXT, size INTEGER, mime TEXT, uploaded_by TEXT, uploaded_at TEXT);
CREATE TABLE IF NOT EXISTS settings(user_id TEXT PRIMARY KEY, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY, v TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at INTEGER, last_seen INTEGER);
CREATE TABLE IF NOT EXISTS audit(
  id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL, user_id TEXT, user_name TEXT,
  action TEXT NOT NULL, entity TEXT, entity_id TEXT, detail TEXT);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_files_task ON files(task_id);
`);

/* ---------- helpers ---------- */
const now = () => new Date().toISOString();
const rid = (p) => p + crypto.randomBytes(6).toString('hex');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const hashPw = (pw) => {
  const salt = crypto.randomBytes(16);
  return salt.toString('hex') + ':' + crypto.scryptSync(pw, salt, 64).toString('hex');
};
const checkPw = (pw, stored) => {
  const [s, h] = stored.split(':');
  const c = crypto.scryptSync(pw, Buffer.from(s, 'hex'), 64);
  const hb = Buffer.from(h, 'hex');
  return c.length === hb.length && crypto.timingSafeEqual(c, hb);
};
const ROLE_LABEL = { sec: 'เลขานุการ', dir: 'ผู้บริหาร', nur: 'พยาบาล / พนักงาน', gen: 'บุคคลทั่วไป', admin: 'ผู้ดูแลระบบ' };
const RKS = Object.keys(ROLE_LABEL);
const defType = (rk) => (rk === 'nur' ? 'ดูแลผู้ป่วย' : rk === 'dir' ? 'ประชุม' : 'เอกสาร');
const shortOf = (name) => name.replace(/^(นพ\.|พญ\.|พว\.|ดร\.|คุณ|นางสาว|นาย|นาง)\s*/, '').trim().slice(0, 2);

const getUser = (id) => db.prepare('SELECT * FROM users WHERE id=?').get(id);
const allUsers = () => db.prepare('SELECT * FROM users ORDER BY created_at, rowid').all();
const pub = (u, viewer) => ({
  id: u.id, name: u.name, role: u.role, short: u.short, rk: u.rk, active: !!u.active, defType: defType(u.rk),
  ...(viewer && (viewer.rk === 'admin' || viewer.id === u.id) ? { username: u.username, manages: JSON.parse(u.manages) } : {}),
});

function audit(user, action, entity, entityId, detail) {
  db.prepare('INSERT INTO audit(ts,user_id,user_name,action,entity,entity_id,detail) VALUES(?,?,?,?,?,?,?)').run(
    now(), user ? user.id : null, user ? user.name : null, action, entity || null, entityId || null,
    detail == null ? null : JSON.stringify(detail));
}

function mgOf(u) {
  if (u.rk !== 'sec') return [];
  return JSON.parse(u.manages).filter((id) => { const x = getUser(id); return x && x.rk === 'dir'; });
}
function visIds(u) {
  if (u.rk === 'admin') return [];
  if (u.rk === 'dir') return allUsers().filter((x) => x.rk !== 'admin').map((x) => x.id);
  if (u.rk === 'sec') return [u.id, ...mgOf(u)];
  return [u.id];
}
const canEditAssignee = (u, assignee) => u.rk !== 'admin' && (assignee === u.id || mgOf(u).includes(assignee));
const canSee = (u, t) => visIds(u).includes(t.assignee) || (t.attendees || []).includes(u.id);

/* ---------- tasks ---------- */
const TYPES = ['เอกสาร', 'นัดหมาย', 'เคลม', 'ตรวจสอบ', 'ประชุม', 'ดูแลผู้ป่วย'];
const STATUSES = ['pending', 'inprogress', 'completed', 'cancelled'];
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const str = (v, max) => typeof v === 'string' && v.length <= max;

/** validates only the fields present; returns {patch} or {error} */
function cleanTask(b) {
  const p = {};
  const bad = (m) => ({ error: m });
  if ('title' in b) { if (!str(b.title, 200) || !b.title.trim()) return bad('ชื่องานไม่ถูกต้อง'); p.title = b.title.trim(); }
  if ('type' in b) { if (!TYPES.includes(b.type)) return bad('ประเภทงานไม่ถูกต้อง'); p.type = b.type; }
  if ('priority' in b) { if (!['high', 'medium', 'low'].includes(b.priority)) return bad('ความสำคัญไม่ถูกต้อง'); p.priority = b.priority; }
  if ('date' in b) { if (!DATE.test(b.date)) return bad('วันที่ไม่ถูกต้อง'); p.date = b.date; }
  if ('start' in b) { if (!HHMM.test(b.start)) return bad('เวลาเริ่มไม่ถูกต้อง'); p.start = b.start; }
  if ('dur' in b) { const d = Number(b.dur); if (!Number.isInteger(d) || d < 5 || d > 1440) return bad('ระยะเวลาไม่ถูกต้อง'); p.dur = d; }
  if ('repeat' in b) { if (!['none', 'daily', 'weekly', 'monthly'].includes(b.repeat)) return bad('รูปแบบงานไม่ถูกต้อง'); p.repeat = b.repeat; }
  if ('reminders' in b) {
    if (!Array.isArray(b.reminders) || b.reminders.length > 10 || !b.reminders.every((n) => Number.isInteger(n) && n >= 0 && n <= 10080)) return bad('การเตือนไม่ถูกต้อง');
    p.reminders = b.reminders;
  }
  if ('renag' in b) p.renag = !!b.renag;
  if ('channels' in b) {
    if (!Array.isArray(b.channels) || !b.channels.every((c) => ['sound', 'push', 'popup'].includes(c))) return bad('ช่องทางแจ้งเตือนไม่ถูกต้อง');
    p.channels = b.channels;
  }
  if ('mode' in b) { if (!['onsite', 'online', 'hybrid'].includes(b.mode)) return bad('รูปแบบการประชุมไม่ถูกต้อง'); p.mode = b.mode; }
  if ('location' in b) { if (!str(b.location, 200)) return bad('สถานที่ยาวเกินไป'); p.location = b.location; }
  if ('link' in b) { if (!str(b.link, 500) || (b.link && !/^https?:\/\//i.test(b.link))) return bad('ลิงก์ต้องขึ้นต้นด้วย https://'); p.link = b.link; }
  if ('attendees' in b) {
    if (!Array.isArray(b.attendees) || b.attendees.length > 50 || !b.attendees.every((id) => { const u = getUser(id); return u && u.rk !== 'admin'; })) return bad('ผู้เข้าร่วมไม่ถูกต้อง');
    p.attendees = b.attendees;
  }
  if ('ext' in b) { if (!str(b.ext, 500)) return bad('รายชื่อภายนอกยาวเกินไป'); p.ext = b.ext; }
  if ('note' in b) { if (!str(b.note, 4000)) return bad('หมายเหตุยาวเกินไป'); p.note = b.note; }
  if ('status' in b) { if (!STATUSES.includes(b.status)) return bad('สถานะไม่ถูกต้อง'); p.status = b.status; }
  if ('cancelReason' in b) { if (!str(b.cancelReason, 500)) return bad('เหตุผลการยกเลิกยาวเกินไป'); p.cancelReason = b.cancelReason.trim(); }
  for (const k of ['startedAt', 'doneAt']) if (k in b) { if (b[k] !== '' && !HHMM.test(b[k])) return bad('เวลาไม่ถูกต้อง'); p[k] = b[k]; }
  return { patch: p };
}

function filesFor(ids) {
  if (!ids.length) return {};
  const rows = db.prepare(`SELECT * FROM files WHERE task_id IN (${ids.map(() => '?').join(',')}) ORDER BY uploaded_at`).all(...ids);
  const m = {};
  rows.forEach((f) => (m[f.task_id] = m[f.task_id] || []).push({ id: f.id, name: f.name, size: f.size, mime: f.mime, by: f.uploaded_by, at: f.uploaded_at }));
  return m;
}
const taskOut = (row, files) => ({ ...JSON.parse(row.data), id: row.id, assignee: row.assignee, files: (files && files[row.id]) || [] });
function visibleTasks(u) {
  if (u.rk === 'admin') return [];
  const rows = db.prepare('SELECT * FROM tasks').all();
  const ok = rows.filter((r) => canSee(u, { assignee: r.assignee, ...JSON.parse(r.data) }));
  const files = filesFor(ok.map((r) => r.id));
  return ok.map((r) => taskOut(r, files));
}

/* ---------- auth ---------- */
const PW_MIN = 8;
function pwProblem(pw, user) {
  if (typeof pw !== 'string' || pw.length < PW_MIN) return `รหัสผ่านต้องยาวอย่างน้อย ${PW_MIN} ตัวอักษร`;
  if (pw.length > 100) return 'รหัสผ่านยาวเกินไป';
  if (!/[A-Za-z฀-๿]/.test(pw) || !/\d/.test(pw)) return 'รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข';
  if (user && pw.toLowerCase() === user.username.toLowerCase()) return 'รหัสผ่านต้องไม่ตรงกับชื่อผู้ใช้';
  return '';
}

if (!db.prepare('SELECT 1 FROM users LIMIT 1').get()) {
  const initial = process.env.ADMIN_PASSWORD || '1234';
  db.prepare('INSERT INTO users(id,username,name,role,short,rk,manages,active,pw_hash,must_change,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
    .run('admin', 'admin', 'ผู้ดูแลระบบ', 'ฝ่ายเทคโนโลยีสารสนเทศ', 'AD', 'admin', '[]', 1, hashPw(initial), 1, now());
  audit(null, 'system.init', 'user', 'admin', { note: 'สร้างบัญชี admin เริ่มต้น' });
  console.log(`[init] created default account admin / ${initial} (must change on first login)`);
}

const failures = new Map(); // key -> {n, until}
function lockedFor(key) {
  const f = failures.get(key);
  return f && f.until > Date.now() ? Math.ceil((f.until - Date.now()) / 60000) : 0;
}
function noteFail(key) {
  const f = failures.get(key) || { n: 0, until: 0 };
  f.n += 1;
  if (f.n >= 5) { f.until = Date.now() + 10 * 60 * 1000; f.n = 0; }
  failures.set(key, f);
}

function auth({ allowMustChange = false } = {}) {
  return (req, res, next) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    const th = token && sha(token);
    const s = th && db.prepare('SELECT * FROM sessions WHERE token=?').get(th);
    const t = Date.now();
    if (!s || t - s.last_seen > IDLE_MS || t - s.created_at > MAX_SESSION_MS) {
      if (s) db.prepare('DELETE FROM sessions WHERE token=?').run(th);
      return res.status(401).json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่', code: 'SESSION' });
    }
    const u = getUser(s.user_id);
    if (!u || !u.active) return res.status(401).json({ error: 'บัญชีนี้ถูกระงับ', code: 'SESSION' });
    if (t - s.last_seen > 15000) db.prepare('UPDATE sessions SET last_seen=? WHERE token=?').run(t, th);
    if (u.must_change && !allowMustChange) return res.status(403).json({ error: 'ต้องเปลี่ยนรหัสผ่านก่อนใช้งาน', code: 'MUST_CHANGE' });
    req.user = u; req.tokenHash = th;
    next();
  };
}
const adminOnly = (req, res, next) => (req.user.rk === 'admin' ? next() : res.status(403).json({ error: 'เฉพาะผู้ดูแลระบบ' }));

/* ---------- app ---------- */
const app = express();
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'no-referrer' });
  next();
});
app.use(express.json({ limit: '1mb' }));
const api = express.Router();
app.use('/api', api);

api.get('/bootstrap-status', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) c FROM users').get().c;
  const admin = db.prepare("SELECT must_change FROM users WHERE username='admin'").get();
  res.json({ fresh: count === 1 && !!admin && admin.must_change === 1 });
});

api.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!str(username, 100) || !str(password, 200) || !username || !password) return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
  const ux = username.trim().toLowerCase();
  const key = ux.split('@')[0] + '|' + req.ip;
  const wait = lockedFor(key);
  if (wait) return res.status(429).json({ error: `ลองผิดหลายครั้ง กรุณารอ ${wait} นาทีแล้วลองใหม่` });
  const u = db.prepare('SELECT * FROM users WHERE username=?').get(ux) || db.prepare('SELECT * FROM users WHERE username=?').get(ux.split('@')[0]);
  if (!u || !checkPw(password, u.pw_hash)) {
    noteFail(key);
    audit(u || null, 'login.fail', 'user', u ? u.id : null, { username: ux.slice(0, 60), ip: req.ip });
    return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
  }
  if (!u.active) return res.status(403).json({ error: 'บัญชีนี้ถูกระงับ กรุณาติดต่อผู้ดูแลระบบ' });
  failures.delete(key);
  const token = crypto.randomBytes(32).toString('hex');
  const t = Date.now();
  db.prepare('DELETE FROM sessions WHERE ?-last_seen>?').run(t, IDLE_MS);
  db.prepare('INSERT INTO sessions(token,user_id,created_at,last_seen) VALUES(?,?,?,?)').run(sha(token), u.id, t, t);
  audit(u, 'login', 'user', u.id, { ip: req.ip });
  res.json({ token, mustChange: !!u.must_change });
});

api.post('/logout', auth({ allowMustChange: true }), (req, res) => {
  db.prepare('DELETE FROM sessions WHERE token=?').run(req.tokenHash);
  audit(req.user, 'logout', 'user', req.user.id);
  res.json({ ok: true });
});

api.post('/idle-logout', auth({ allowMustChange: true }), (req, res) => {
  db.prepare('DELETE FROM sessions WHERE token=?').run(req.tokenHash);
  audit(req.user, 'logout.idle', 'user', req.user.id);
  res.json({ ok: true });
});

api.post('/password', auth({ allowMustChange: true }), (req, res) => {
  const { current, next } = req.body || {};
  const u = req.user;
  if (!str(current, 200) || !checkPw(current || '', u.pw_hash)) return res.status(400).json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
  const prob = pwProblem(next, u);
  if (prob) return res.status(400).json({ error: prob });
  if (next === current) return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องไม่ซ้ำรหัสผ่านเดิม' });
  db.prepare('UPDATE users SET pw_hash=?, must_change=0 WHERE id=?').run(hashPw(next), u.id);
  db.prepare('DELETE FROM sessions WHERE user_id=? AND token<>?').run(u.id, req.tokenHash);
  audit(u, 'password.change', 'user', u.id);
  res.json({ ok: true });
});

api.get('/sync', auth({ allowMustChange: true }), (req, res) => {
  const u = req.user;
  if (u.must_change) return res.json({ me: pub(u, u), mustChange: true });
  const st = db.prepare('SELECT data FROM settings WHERE user_id=?').get(u.id);
  const ah = db.prepare("SELECT v FROM kv WHERE k='attHistory'").get();
  res.json({
    me: pub(u, u), mustChange: false,
    users: allUsers().map((x) => pub(x, u)),
    tasks: visibleTasks(u),
    settings: st ? JSON.parse(st.data) : null,
    attHistory: ah ? JSON.parse(ah.v) : [],
  });
});

api.put('/settings', auth(), (req, res) => {
  const s = req.body;
  if (!s || typeof s !== 'object' || JSON.stringify(s).length > 4000) return res.status(400).json({ error: 'การตั้งค่าไม่ถูกต้อง' });
  db.prepare('INSERT INTO settings(user_id,data) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data').run(req.user.id, JSON.stringify(s));
  res.json({ ok: true });
});

api.post('/att-history', auth(), (req, res) => {
  const name = (req.body && req.body.name || '').toString().trim().slice(0, 100);
  if (!name) return res.status(400).json({ error: 'ชื่อไม่ถูกต้อง' });
  const row = db.prepare("SELECT v FROM kv WHERE k='attHistory'").get();
  const list = row ? JSON.parse(row.v) : [];
  if (!list.includes(name)) list.push(name);
  db.prepare("INSERT INTO kv(k,v) VALUES('attHistory',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(JSON.stringify(list.slice(-200)));
  res.json({ ok: true });
});

/* tasks */
const TRACKED = ['title', 'type', 'priority', 'date', 'start', 'dur', 'repeat', 'status', 'assignee', 'mode', 'location', 'link'];
api.post('/tasks', auth(), (req, res) => {
  const u = req.user;
  const b = req.body || {};
  const assignee = b.assignee || u.id;
  const target = getUser(assignee);
  if (!target || target.rk === 'admin' || !target.active) return res.status(400).json({ error: 'ผู้รับผิดชอบไม่ถูกต้อง' });
  if (!canEditAssignee(u, assignee)) return res.status(403).json({ error: 'ไม่มีสิทธิ์สร้างงานในตารางนี้' });
  const { patch, error } = cleanTask({ status: 'pending', note: '', startedAt: '', doneAt: '', repeat: 'none', reminders: [], channels: [], ...b });
  if (error) return res.status(400).json({ error });
  for (const k of ['title', 'type', 'priority', 'date', 'start', 'dur']) if (patch[k] == null) return res.status(400).json({ error: 'ข้อมูลงานไม่ครบ' });
  if (patch.status === 'cancelled') return res.status(400).json({ error: 'สร้างงานใหม่เป็นสถานะยกเลิกไม่ได้' });
  delete patch.cancelReason;
  const id = rid('t');
  // a task a delegate (e.g. secretary) creates on a director's calendar starts out awaiting that director's confirmation
  const approvalStatus = (target.rk === 'dir' && assignee !== u.id) ? 'pending' : 'none';
  const data = { ...patch, creator: u.id, approvalStatus, approvalReason: '', approvalAt: '', approvalBy: '' };
  db.prepare('INSERT INTO tasks(id,assignee,data,created_at,updated_at) VALUES(?,?,?,?,?)').run(id, assignee, JSON.stringify(data), now(), now());
  audit(u, 'task.create', 'task', id, { title: data.title, date: data.date, start: data.start, assignee });
  res.json({ task: taskOut(db.prepare('SELECT * FROM tasks WHERE id=?').get(id), {}) });
});

api.patch('/tasks/:id', auth(), (req, res) => {
  const u = req.user;
  const row = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  if (!row || !canSee(u, { assignee: row.assignee, ...JSON.parse(row.data) })) return res.status(404).json({ error: 'ไม่พบงาน' });
  if (!canEditAssignee(u, row.assignee)) return res.status(403).json({ error: 'ไม่มีสิทธิ์แก้ไขงานนี้' });
  const b = { ...req.body };
  let assignee = row.assignee;
  if ('assignee' in b) {
    const target = getUser(b.assignee);
    if (!target || target.rk === 'admin' || !target.active || !canEditAssignee(u, b.assignee)) return res.status(400).json({ error: 'ผู้รับผิดชอบไม่ถูกต้อง' });
    assignee = b.assignee; delete b.assignee;
  }
  const { patch, error } = cleanTask(b);
  if (error) return res.status(400).json({ error });
  const old = JSON.parse(row.data);
  const next = { ...old, ...patch, cancelReason: old.cancelReason || '' };
  // approval: a delegate-created task on a director's calendar needs that director's confirmation again
  // whenever it moves to a new director or its date/time changes after a decision was already made
  const creatorId = old.creator || row.assignee;
  const newAssigneeUser = getUser(assignee);
  const inApprovalCtx = !!(newAssigneeUser && newAssigneeUser.rk === 'dir' && creatorId !== assignee);
  if (!inApprovalCtx) {
    next.approvalStatus = 'none'; next.approvalReason = ''; next.approvalAt = ''; next.approvalBy = '';
  } else {
    const wasCtx = old.approvalStatus && old.approvalStatus !== 'none';
    const reassignedDirector = assignee !== row.assignee;
    const timeChanged = (patch.date !== undefined && patch.date !== old.date) || (patch.start !== undefined && patch.start !== old.start) || (patch.dur !== undefined && patch.dur !== old.dur);
    if (!wasCtx || reassignedDirector || (timeChanged && (old.approvalStatus === 'approved' || old.approvalStatus === 'rejected'))) {
      next.approvalStatus = 'pending'; next.approvalReason = ''; next.approvalAt = ''; next.approvalBy = '';
    }
  }
  let rsvpReset = false;
  if (next.rsvp) {
    const att = new Set(next.attendees || []);
    next.rsvp = Object.fromEntries(Object.entries(next.rsvp).filter(([k]) => att.has(k)));
    if ((patch.date !== undefined && patch.date !== old.date) || (patch.start !== undefined && patch.start !== old.start) || (patch.dur !== undefined && patch.dur !== old.dur)) {
      rsvpReset = Object.keys(next.rsvp).length > 0; next.rsvp = {};
    }
  }
  const wasCancelled = old.status === 'cancelled', toCancelled = patch.status === 'cancelled';
  let cancelEntry = null;
  if (toCancelled && !wasCancelled) {
    const reason = (patch.cancelReason || '').trim();
    if (reason.length < 3) return res.status(400).json({ error: 'กรุณาระบุเหตุผลการยกเลิก (อย่างน้อย 3 ตัวอักษร)' });
    cancelEntry = { at: now(), by: u.id, byName: u.name, reason };
    next.cancelReason = reason;
    next.cancelLog = [...(old.cancelLog || []), cancelEntry];
  } else if ('status' in patch && !toCancelled && wasCancelled) {
    next.cancelReason = '';
  }
  const changes = {};
  for (const k of TRACKED) {
    const a = k === 'assignee' ? row.assignee : old[k], z = k === 'assignee' ? assignee : next[k];
    if (a !== z) changes[k] = [a, z];
  }
  if (cancelEntry) delete changes.status;
  if (patch.note !== undefined && patch.note !== old.note) changes.note = 'แก้ไขบันทึก';
  if (rsvpReset) changes.rsvp = 'ล้างการตอบรับ (เปลี่ยนเวลาประชุม)';
  db.prepare('UPDATE tasks SET assignee=?, data=?, updated_at=? WHERE id=?').run(assignee, JSON.stringify(next), now(), row.id);
  if (cancelEntry) audit(u, 'task.cancel', 'task', row.id, { title: next.title, date: next.date, start: next.start, reason: cancelEntry.reason });
  if (Object.keys(changes).length) audit(u, 'task.update', 'task', row.id, { title: next.title, changes });
  res.json({ task: taskOut(db.prepare('SELECT * FROM tasks WHERE id=?').get(row.id), filesFor([row.id])) });
});

function removeFileRow(f) {
  try { fs.unlinkSync(path.join(DATA_DIR, 'files', f.id)); } catch { /* already gone */ }
  db.prepare('DELETE FROM files WHERE id=?').run(f.id);
}
api.delete('/tasks/:id', auth(), (req, res) => {
  const u = req.user;
  const row = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  if (!row || !canSee(u, { assignee: row.assignee, ...JSON.parse(row.data) })) return res.status(404).json({ error: 'ไม่พบงาน' });
  if (!canEditAssignee(u, row.assignee)) return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบงานนี้' });
  db.prepare('SELECT * FROM files WHERE task_id=?').all(row.id).forEach(removeFileRow);
  db.prepare('DELETE FROM tasks WHERE id=?').run(row.id);
  const d = JSON.parse(row.data);
  audit(u, 'task.delete', 'task', row.id, { title: d.title, date: d.date, start: d.start, assignee: row.assignee });
  res.json({ ok: true });
});

/* attachments (raw body, filename in X-Filename) */
const BLOCKED_EXT = /\.(exe|bat|cmd|com|msi|scr|ps1|vbs|js|jar|sh|dll|lnk)$/i;
api.post('/tasks/:id/files', auth(), express.raw({ type: () => true, limit: MAX_FILE }), (req, res) => {
  const u = req.user;
  const row = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'ไม่พบงาน' });
  if (!canEditAssignee(u, row.assignee)) return res.status(403).json({ error: 'ไม่มีสิทธิ์แนบไฟล์ในงานนี้' });
  let name = '';
  try { name = decodeURIComponent(req.headers['x-filename'] || ''); } catch { /* keep empty */ }
  name = path.basename(name).replace(/[\u0000-\u001f]/g, '').slice(0, 150);
  if (!name) return res.status(400).json({ error: 'ไม่พบชื่อไฟล์' });
  if (BLOCKED_EXT.test(name)) return res.status(400).json({ error: 'ไม่อนุญาตไฟล์ประเภทนี้' });
  if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'ไฟล์ว่างเปล่า' });
  if (db.prepare('SELECT COUNT(*) c FROM files WHERE task_id=?').get(row.id).c >= MAX_FILES_PER_TASK) return res.status(400).json({ error: `แนบได้สูงสุด ${MAX_FILES_PER_TASK} ไฟล์ต่องาน` });
  const id = rid('f');
  fs.writeFileSync(path.join(DATA_DIR, 'files', id), req.body);
  db.prepare('INSERT INTO files(id,task_id,name,size,mime,uploaded_by,uploaded_at) VALUES(?,?,?,?,?,?,?)')
    .run(id, row.id, name, req.body.length, String(req.headers['content-type'] || 'application/octet-stream').slice(0, 100), u.id, now());
  audit(u, 'file.upload', 'task', row.id, { file: name, size: req.body.length, title: JSON.parse(row.data).title });
  res.json({ files: filesFor([row.id])[row.id] });
});

api.get('/files/:id', auth(), (req, res) => {
  const f = db.prepare('SELECT * FROM files WHERE id=?').get(req.params.id);
  const row = f && db.prepare('SELECT * FROM tasks WHERE id=?').get(f.task_id);
  if (!row || !canSee(req.user, { assignee: row.assignee, ...JSON.parse(row.data) })) return res.status(404).json({ error: 'ไม่พบไฟล์' });
  audit(req.user, 'file.download', 'task', row.id, { file: f.name });
  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(f.name)}`,
  });
  res.sendFile(path.join(DATA_DIR, 'files', f.id));
});

api.delete('/files/:id', auth(), (req, res) => {
  const f = db.prepare('SELECT * FROM files WHERE id=?').get(req.params.id);
  const row = f && db.prepare('SELECT * FROM tasks WHERE id=?').get(f.task_id);
  if (!row) return res.status(404).json({ error: 'ไม่พบไฟล์' });
  if (!canEditAssignee(req.user, row.assignee)) return res.status(403).json({ error: 'ไม่มีสิทธิ์ลบไฟล์นี้' });
  removeFileRow(f);
  audit(req.user, 'file.delete', 'task', row.id, { file: f.name });
  res.json({ files: filesFor([row.id])[row.id] || [] });
});

/* user management (admin) */
const USERNAME = /^[A-Za-z0-9._@-]{3,40}$/;
function cleanManages(rk, m) {
  if (rk !== 'sec') return [];
  return (Array.isArray(m) ? m : []).filter((id) => { const x = getUser(id); return x && x.rk === 'dir'; });
}
api.post('/users', auth(), adminOnly, (req, res) => {
  const b = req.body || {};
  if (!str(b.name, 100) || !b.name.trim()) return res.status(400).json({ error: 'กรุณาใส่ชื่อ-นามสกุล' });
  if (!str(b.username, 40) || !USERNAME.test(b.username)) return res.status(400).json({ error: 'ชื่อผู้ใช้ใช้ได้เฉพาะ a-z 0-9 . _ - @ (3–40 ตัว)' });
  if (!RKS.includes(b.rk)) return res.status(400).json({ error: 'บทบาทไม่ถูกต้อง' });
  if (db.prepare('SELECT 1 FROM users WHERE username=?').get(b.username)) return res.status(400).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' });
  if (typeof b.password !== 'string' || b.password.length < 6) return res.status(400).json({ error: 'รหัสผ่านชั่วคราวต้องยาวอย่างน้อย 6 ตัวอักษร' });
  const id = rid('u');
  db.prepare('INSERT INTO users(id,username,name,role,short,rk,manages,active,pw_hash,must_change,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').run(
    id, b.username, b.name.trim(), (str(b.role, 100) && b.role.trim()) || ROLE_LABEL[b.rk], shortOf(b.name), b.rk,
    JSON.stringify(cleanManages(b.rk, b.manages)), b.active === false ? 0 : 1, hashPw(b.password), 1, now());
  audit(req.user, 'user.create', 'user', id, { username: b.username, name: b.name.trim(), rk: b.rk });
  res.json({ user: pub(getUser(id), req.user) });
});

api.patch('/users/:id', auth(), adminOnly, (req, res) => {
  const u = getUser(req.params.id);
  if (!u) return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
  const b = req.body || {};
  const self = u.id === req.user.id;
  const set = {}, log = {};
  if ('name' in b) { if (!str(b.name, 100) || !b.name.trim()) return res.status(400).json({ error: 'กรุณาใส่ชื่อ-นามสกุล' }); set.name = b.name.trim(); set.short = shortOf(b.name); }
  if ('role' in b) { if (!str(b.role, 100)) return res.status(400).json({ error: 'ตำแหน่งไม่ถูกต้อง' }); set.role = b.role.trim() || ROLE_LABEL[b.rk || u.rk]; }
  if ('username' in b && b.username !== u.username) {
    if (!str(b.username, 40) || !USERNAME.test(b.username)) return res.status(400).json({ error: 'ชื่อผู้ใช้ไม่ถูกต้อง' });
    if (db.prepare('SELECT 1 FROM users WHERE username=? AND id<>?').get(b.username, u.id)) return res.status(400).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' });
    set.username = b.username;
  }
  if ('rk' in b && b.rk !== u.rk) {
    if (!RKS.includes(b.rk)) return res.status(400).json({ error: 'บทบาทไม่ถูกต้อง' });
    if (self) return res.status(400).json({ error: 'ไม่สามารถเปลี่ยนบทบาทของบัญชีตัวเองได้' });
    set.rk = b.rk;
  }
  const rk = set.rk || u.rk;
  if ('manages' in b || set.rk) set.manages = JSON.stringify(cleanManages(rk, 'manages' in b ? b.manages : JSON.parse(u.manages)));
  if ('active' in b && !!b.active !== !!u.active) {
    if (self) return res.status(400).json({ error: 'ไม่สามารถระงับบัญชีตัวเองได้' });
    set.active = b.active ? 1 : 0;
  }
  if (b.password) {
    if (typeof b.password !== 'string' || b.password.length < 6) return res.status(400).json({ error: 'รหัสผ่านชั่วคราวต้องยาวอย่างน้อย 6 ตัวอักษร' });
    set.pw_hash = hashPw(b.password); set.must_change = 1; log.passwordReset = true;
  }
  const keys = Object.keys(set);
  if (!keys.length) return res.json({ user: pub(u, req.user) });
  db.prepare(`UPDATE users SET ${keys.map((k) => k + '=?').join(',')} WHERE id=?`).run(...keys.map((k) => set[k]), u.id);
  if (set.active === 0 || set.pw_hash) db.prepare('DELETE FROM sessions WHERE user_id=?').run(u.id);
  for (const k of ['name', 'username', 'rk', 'role', 'active', 'manages']) if (k in set) log[k] = k === 'manages' ? 'แก้ไข' : [u[k], set[k]];
  audit(req.user, log.passwordReset ? 'user.reset-password' : 'user.update', 'user', u.id, { name: set.name || u.name, ...log });
  res.json({ user: pub(getUser(u.id), req.user) });
});

api.get('/audit', auth(), adminOnly, (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 500);
  const q = (req.query.q || '').toString().trim().toLowerCase().slice(0, 60);
  const rows = db.prepare('SELECT * FROM audit ORDER BY id DESC LIMIT ?').all(q ? 2000 : limit)
    .filter((r) => !q || [r.user_name, r.action, r.entity_id, r.detail].join(' ').toLowerCase().includes(q))
    .slice(0, limit)
    .map((r) => ({ id: r.id, ts: r.ts, userId: r.user_id, userName: r.user_name, action: r.action, entity: r.entity, entityId: r.entity_id, detail: r.detail ? JSON.parse(r.detail) : null }));
  res.json({ rows });
});

installExtras(api, { db, auth, audit, getUser, allUsers, mgOf, visIds, canSee, canEditAssignee, now });

api.use((req, res) => res.status(404).json({ error: 'ไม่พบ API' }));

/* production: serve the built frontend */
const DIST = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.use((req, res, next) => (req.method === 'GET' ? res.sendFile(path.join(DIST, 'index.html')) : next()));
}
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'ไฟล์ใหญ่เกินไป (สูงสุด 15 MB)' });
  console.error(err);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
});

app.listen(PORT, HOST, () => console.log(`Smart Schedule API on http://${HOST}:${PORT}  (data: ${DATA_DIR})`));
