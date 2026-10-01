import React from 'react';

const glass = { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.16)' };
const rowGrid = { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 104px 96px', gap: 10, alignItems: 'center', padding: '11px 14px', borderRadius: 12, ...glass };
const avatar = (grad, ml) => ({ width: 26, height: 26, borderRadius: '50%', background: grad, border: '2px solid rgba(255,255,255,0.6)', marginLeft: ml });
const Avatars = () => (
  <span style={{ display: 'flex' }}>
    <span style={avatar('linear-gradient(#e2e8f0,#94a3b8)')} />
    <span style={avatar('linear-gradient(#f1f5f9,#cbd5e1)', -10)} />
  </span>
);
const Pill = ({ bg, c, children }) => (
  <span style={{ display: 'flex' }}>
    <span style={{ background: bg, color: c, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>{children}</span>
  </span>
);
const PreviewRow = ({ icon, iconBg, title, pillBg, pillC, pill }) => (
  <div style={rowGrid}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <span style={{ width: 26, height: 26, flex: 'none', borderRadius: 7, background: iconBg, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13 }}>{icon}</span>
      <span style={{ color: '#fff', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
    </span>
    <Pill bg={pillBg} c={pillC}>{pill}</Pill>
    <Avatars />
  </div>
);
const Feature = ({ icon, title, desc }) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 }}>
    <span style={{ fontSize: 30, lineHeight: 1, flex: 'none' }}>{icon}</span>
    <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={{ color: '#fff', fontSize: 16, fontWeight: 600 }}>{title}</span>
      <span style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.55 }}>{desc}</span>
    </span>
  </div>
);
const mask = 'radial-gradient(closest-side,#000 62%,transparent 100%)';
const floatImg = { position: 'absolute', pointerEvents: 'none', WebkitMaskImage: mask, maskImage: mask, filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.35))' };
const svgProps = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: '#64748b', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', style: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' } };
const inputStyle = { width: '100%', padding: '12px 16px 12px 44px', borderRadius: 12, border: '1px solid #dbe1ea', fontSize: 15, background: '#fff', color: '#0f172a', outline: 'none', transition: 'box-shadow 0.15s,background 0.15s' };
const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, color: '#1e293b', marginBottom: 8 };

export default function Login({ V }) {
  return (
    <div data-noprint="1" style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'grid', gridTemplateColumns: V.loginCols, gridTemplateRows: V.loginRows, height: '100%', overflow: V.loginOv, background: '#eef1f5' }}>
      {/* brand panel */}
      <div style={{ position: 'relative', overflow: 'hidden', height: V.loginPanelH, background: '#0b1636' }}>
        <div style={{ position: 'absolute', inset: -40, backgroundImage: "url('/assets/login-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(22px) saturate(1.2)', transform: 'scale(1.08)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(10,22,58,0.55),rgba(8,14,40,0.72) 60%,rgba(6,10,28,0.88))' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', overflowY: V.loginInnerOv, padding: V.loginPad, display: 'flex', flexDirection: 'column', gap: 28, scrollbarWidth: 'thin', scrollbarColor: 'rgba(148,163,184,0.3) transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, flex: 'none', borderRadius: 14, background: 'linear-gradient(145deg,#1e293b,#020617)', boxShadow: '0 10px 24px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 24, letterSpacing: '-0.04em' }}>
              <span><span style={{ color: '#fff' }}>S</span><span style={{ color: '#3b82f6' }}>T</span></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: V.loginTitleSize, fontWeight: 600, color: '#fff', lineHeight: 1.25 }}>Smart Task Scheduling &amp; Alert System</h1>
              <p style={{ margin: 0, fontSize: 14, color: '#cbd5e1' }}>ระบบจัดตารางงาน &amp; แจ้งเตือนอัจฉริยะ</p>
            </div>
          </div>

          <div style={{ position: 'relative', maxWidth: 560, width: '100%', padding: '0 40px 40px 0' }}>
            <div style={{ position: 'relative', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 22, padding: '22px 22px 26px', boxShadow: '0 30px 60px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h2 style={{ margin: '0 0 6px', color: '#fff', fontSize: 26, fontWeight: 700 }}>ปฏิทินตารางงาน</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 104px 96px', gap: 10, padding: '9px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>
                <span>งาน</span><span style={{ whiteSpace: 'nowrap' }}>กำหนดส่ง</span><span style={{ whiteSpace: 'nowrap' }}>ผู้รับผิดชอบ</span>
              </div>
              <PreviewRow icon="✓" iconBg="#22c55e" title="วางแผนงานได้ง่าย" pillBg="#dcfce7" pillC="#15803d" pill="Done" />
              <PreviewRow icon="🔔" iconBg="#f59e0b" title="แจ้งเตือนทันเวลา" pillBg="#fef3c7" pillC="#b45309" pill="In Progress" />
              <PreviewRow icon="▤" iconBg="#3b82f6" title="ติดตามสถานะ & สรุปผล" pillBg="#dbeafe" pillC="#1d4ed8" pill="Pending" />
            </div>
            <img src="/assets/login-bell.png" alt="" style={{ ...floatImg, right: -6, top: -78, width: 150 }} />
            <img src="/assets/login-calendar.png" alt="" style={{ ...floatImg, right: -18, bottom: -14, width: 170 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 'auto' }}>
            <h2 style={{ margin: 0, color: '#fff', fontSize: V.loginHeadSize, fontWeight: 700, lineHeight: 1.25, whiteSpace: 'nowrap' }}>ระบบจัดตารางงาน &amp; แจ้งเตือนอัจฉริยะ</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: '18px 22px' }}>
              <Feature icon="📅" title="วางแผนงานง่าย" desc="งานครั้งเดียวหรือวนซ้ำ กำหนดวัน เวลา และความสำคัญ" />
              <Feature icon="🔔" title="แจ้งเตือนทันเวลา" desc="เสียง Push Popup เตือนล่วงหน้าและเตือนซ้ำอัตโนมัติ" />
              <Feature icon="📊" title="ติดตาม & สรุปผล" desc="อัปเดตสถานะ บันทึกเวลาเริ่ม–เสร็จ ดู Dashboard และรายงาน" />
            </div>
          </div>
        </div>
      </div>

      {/* form panel */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: V.loginPad, height: V.loginPanelH, overflowY: V.loginRightOv, background: 'linear-gradient(180deg,#f3f5f9,#e9edf3)' }}>
        <div style={{ width: '100%', maxWidth: 440, background: '#fff', padding: V.loginCardPad, borderRadius: 22, boxShadow: '0 24px 48px -12px rgba(15,23,42,0.18),0 2px 6px rgba(15,23,42,0.05)', margin: 'auto 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#2563eb', fontWeight: 600 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#3b82f6' }} />ยินดีต้อนรับ
          </div>
          <h2 style={{ margin: '8px 0 4px', fontSize: 32, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>เข้าสู่ระบบ</h2>
          <p style={{ margin: '0 0 26px', color: '#64748b', fontSize: 14 }}>กรุณากรอกข้อมูลเพื่อเข้าใช้งาน</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>ชื่อผู้ใช้งาน หรือ อีเมล</label>
              <div style={{ position: 'relative' }}>
                <svg {...svgProps}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></svg>
                <input className="login-input" value={V.loginU} onChange={V.onLoginU} onKeyDown={V.onLoginKey} autoComplete="username" placeholder="username@domain.com" style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>รหัสผ่าน</label>
              <div style={{ position: 'relative' }}>
                <svg {...svgProps}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5" /></svg>
                <input className="login-input" type="password" value={V.loginP} onChange={V.onLoginP} onKeyDown={V.onLoginKey} autoComplete="current-password" placeholder="••••••••" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14, gap: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#334155', cursor: 'pointer' }}>
                <input type="checkbox" checked={V.loginRemember} onChange={V.onLoginRemember} style={{ width: 18, height: 18, accentColor: '#2563eb', margin: 0 }} />จดจำการใช้งาน
              </label>
              <a className="login-forgot" href="#" onClick={V.onForgot} style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}>ลืมรหัสผ่าน?</a>
            </div>
            {V.hasLoginErr && <div style={{ fontSize: 13, color: '#b91c1c', background: '#fee2e2', borderRadius: 10, padding: '9px 12px' }}>{V.loginErr}</div>}
            <button className="login-btn" type="button" onClick={V.doLogin} disabled={V.loginBusy} style={{ opacity: V.loginBusy ? 0.7 : 1, width: '100%', height: 50, background: 'linear-gradient(90deg,#2f6fe0,#5aa9f0)', color: '#fff', fontWeight: 600, border: 'none', borderRadius: 12, boxShadow: '0 12px 24px -8px rgba(47,111,224,0.55)', fontSize: 16, cursor: 'pointer', marginTop: 4 }}>{V.loginBusy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}</button>
          </div>
          {V.bootstrapFresh ? (
            <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a', fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
              <b>ติดตั้งระบบครั้งแรก?</b> ยังไม่มีผู้ใช้ในระบบนี้ — เข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบเริ่มต้น ชื่อผู้ใช้ <b>admin</b> รหัสผ่าน <b>1234</b> ระบบจะให้ตั้งรหัสผ่านใหม่ทันที จากนั้นใช้เมนู “จัดการผู้ใช้” สร้างบัญชีอื่น ๆ ต่อไป (ข้อความนี้จะหายไปเองหลังตั้งค่าเสร็จ)
            </div>
          ) : (
            <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 10, background: '#eff6ff', border: '1px solid #dbeafe', fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>
              <b>เข้าใช้งานครั้งแรก?</b> ท่านต้องได้รับ <b>ชื่อผู้ใช้</b> และ <b>รหัสผ่านชั่วคราว</b> จากฝ่ายไอทีหรือผู้ดูแลระบบของหน่วยงานท่านก่อน จึงจะเข้าสู่ระบบได้ — ระบบจะให้ตั้งรหัสผ่านใหม่ของตนเองทันทีในการเข้าสู่ระบบครั้งแรก หากยังไม่เคยได้รับ กรุณาติดต่อฝ่ายไอทีหรือหัวหน้างานของท่าน
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', fontSize: 13, color: '#475569', lineHeight: 1.6, marginTop: 24 }}>
          <div>Smart Task System</div>
          <div style={{ color: '#94a3b8' }}>version 1.0.0</div>
        </div>
      </div>
    </div>
  );
}
