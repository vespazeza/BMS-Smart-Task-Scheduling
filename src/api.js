const KEY = 'st_token';
let token = null;
try { token = sessionStorage.getItem(KEY); } catch { /* storage unavailable */ }

export const hasToken = () => !!token;
export function setToken(t) {
  token = t;
  try { if (t) sessionStorage.setItem(KEY, t); else sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function send(url, init) {
  let r;
  try {
    r = await fetch(url, { ...init, headers: { ...(init.headers || {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) } });
  } catch {
    throw new ApiError(0, 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
  }
  return r;
}

export async function api(method, url, body) {
  const r = await send(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await r.json(); } catch { /* empty body */ }
  if (!r.ok) throw new ApiError(r.status, (data && data.error) || `เกิดข้อผิดพลาด (${r.status})`, data && data.code);
  return data;
}

export async function uploadFile(taskId, file) {
  const r = await send(`/api/tasks/${taskId}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream', 'X-Filename': encodeURIComponent(file.name) },
    body: file,
  });
  let data = null;
  try { data = await r.json(); } catch { /* empty body */ }
  if (!r.ok) throw new ApiError(r.status, (data && data.error) || `อัปโหลดไม่สำเร็จ (${r.status})`, data && data.code);
  return data;
}

export async function downloadFile(f) {
  const r = await send(`/api/files/${f.id}`, { method: 'GET' });
  if (!r.ok) throw new ApiError(r.status, 'ดาวน์โหลดไม่สำเร็จ');
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = f.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function downloadUrl(url, name) {
  const r = await send(url, { method: 'GET' });
  if (!r.ok) {
    let msg = 'ดาวน์โหลดไม่สำเร็จ';
    try { msg = (await r.json()).error || msg; } catch { /* not json */ }
    throw new ApiError(r.status, msg);
  }
  const href = URL.createObjectURL(await r.blob());
  const a = document.createElement('a');
  a.href = href; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10000);
}
