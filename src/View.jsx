import React from 'react';
import { MONO, Seg } from './ui.jsx';
import Login from './Login.jsx';
import { Dashboard, List, Calendar, Team, Approvals, Report, Users, Alerts, Audit } from './pages.jsx';
import { Toasts, TaskDetail, CreateTask, UserForm, ChangePassword } from './overlays.jsx';

const badge = { fontSize: 11, fontFamily: MONO, background: '#B83A32', color: '#fff', borderRadius: 99 };
const MANUAL_URL = '/manual.html';

function Sidebar({ V }) {
  const glass = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 14 };
  return (
    <aside data-noprint="1" style={{ background: 'linear-gradient(185deg,#0B1636 0%,#0E1F4D 55%,#123072 100%)', color: '#E8EEFC', display: V.sideDisplay, flexDirection: 'column', padding: '22px 14px 16px', gap: 24, overflow: 'auto', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(380px 260px at -12% -4%,rgba(59,130,246,0.32),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 11, padding: '0 6px' }}>
        <div style={{ width: 42, height: 42, flex: 'none', borderRadius: 12, background: 'linear-gradient(145deg,#1e293b,#020617)', boxShadow: '0 8px 18px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 17, letterSpacing: '-0.04em' }}>
          <span><span style={{ color: '#fff' }}>S</span><span style={{ color: '#3b82f6' }}>T</span></span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.3, color: '#fff' }}>Smart Task Scheduling</div>
          <div style={{ fontSize: 11, color: '#A3B3D6', lineHeight: 1.4, marginTop: 1 }}>ระบบจัดตารางงาน &amp; แจ้งเตือนอัจฉริยะ</div>
        </div>
      </div>
      <nav style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', color: '#8FA2CC', padding: '0 12px 4px' }}>เมนู</div>
        {V.navItems.map((n) => {
          const on = n.bg !== 'transparent';
          return (
            <button key={n.label} className={'navitem' + (on ? ' on' : '')} onClick={n.onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', border: 'none', borderRadius: 12, background: on ? 'var(--grad)' : 'transparent', boxShadow: on ? '0 10px 22px -10px rgba(37,99,235,0.9)' : 'none', color: on ? '#fff' : '#B9C6E6', fontSize: 14, fontWeight: on ? 600 : 400, cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 30, height: 30, flex: 'none', borderRadius: 9, background: on ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={n.d} /></svg>
              </span>
              <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{n.label}</span>
              {n.hasBadge && <span style={{ ...badge, padding: '1px 7px' }}>{n.badge}</span>}
            </button>
          );
        })}
        <a href={MANUAL_URL} target="_blank" rel="noopener noreferrer" className="navitem" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', border: 'none', borderRadius: 12, background: 'transparent', color: '#B9C6E6', fontSize: 14, fontWeight: 400, cursor: 'pointer', textAlign: 'left', textDecoration: 'none' }}>
          <span style={{ width: 30, height: 30, flex: 'none', borderRadius: 9, background: 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2.5h7l3 3v8H3zM10 2.5V6h3M5.5 8.5h5M5.5 11h5" /></svg>
          </span>
          <span style={{ flex: 1, whiteSpace: 'nowrap' }}>คู่มือการใช้งาน</span>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6, flex: 'none' }}><path d="M6.5 3.5h6v6M12.5 3.5 7 9M4 5.5H3.5v7H10.5V11" /></svg>
        </a>
      </nav>
      <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ ...glass, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="#8FA2CC" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="6" /><path d="M8 4.5V8l2.5 1.5" /></svg>
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 11, color: '#8FA2CC' }}>เวลาในระบบ</span>
            <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 500, color: '#fff', lineHeight: 1.15 }}>{V.nowText}</span>
          </span>
        </div>
        <div style={{ ...glass, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px 10px 12px' }}>
          <span style={{ width: 36, height: 36, flex: 'none', borderRadius: '50%', background: 'var(--grad)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, boxShadow: '0 0 0 2px rgba(255,255,255,0.25)' }}>{V.user.short}</span>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{V.user.name}</span>
            <span style={{ fontSize: 11, color: '#A3B3D6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{V.user.role}</span>
          </span>
          <button onClick={V.openPw} title="เปลี่ยนรหัสผ่าน" style={{ border: '1px solid rgba(232,238,252,0.22)', background: 'transparent', color: '#E8EEFC', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="5.5" cy="10.5" r="2.7" /><path d="M7.5 8.5 13.5 2.5M11 5l1.8 1.8M9.5 6.5l1.5 1.5" /></svg></button>
          <button onClick={V.logout} title="ออกจากระบบ" style={{ border: '1px solid rgba(232,238,252,0.22)', background: 'transparent', color: '#E8EEFC', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'grid', placeItems: 'center' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2.5H3.5v11H6M10 5l3 3-3 3M13 8H6.5" /></svg></button>
        </div>
      </div>
    </aside>
  );
}

function NotificationLog({ V }) {
  return (
    <div style={{ position: 'absolute', top: 60, right: 14, width: 'min(380px,calc(100% - 28px))', maxHeight: 460, overflow: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 18px 40px rgba(11,22,54,0.16)', zIndex: 30, padding: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px' }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>ประวัติการแจ้งเตือน</span>
        <button onClick={V.toggleLog} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13 }}>ปิด</button>
      </div>
      {V.log.map((l) => (
        <button key={l.id} onClick={l.open} style={{ display: 'flex', gap: 10, width: '100%', textAlign: 'left', border: 'none', background: 'transparent', padding: 10, borderRadius: 8, cursor: 'pointer', borderTop: '1px solid var(--soft)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.c, marginTop: 6, flex: 'none' }} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 12, color: l.c, fontWeight: 600 }}>
              {l.tag} · <span style={{ fontFamily: MONO, color: 'var(--muted)', fontWeight: 400 }}>{l.time}</span>
            </span>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>{l.task}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{l.title}</span>
          </span>
        </button>
      ))}
      {V.logEmpty && <div style={{ padding: '20px 10px', fontSize: 13, color: 'var(--muted)' }}>ยังไม่มีการแจ้งเตือน</div>}
    </div>
  );
}

function Header({ V }) {
  const ctl = { height: 40, borderRadius: 12 };
  return (
    <header data-noprint="1" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: V.headerPad, borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb,var(--surface) 88%,transparent)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', flexWrap: 'wrap', position: 'relative', zIndex: 5 }}>
      {V.isMobile && (
        <button onClick={V.logout} title="ออกจากระบบ" style={{ width: 38, height: 38, flex: 'none', border: 'none', borderRadius: '50%', background: 'var(--grad)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{V.user.short}</button>
      )}
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', marginRight: 'auto' }}>{V.viewTitle}</div>
      <div style={{ ...ctl, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', padding: '0 12px', minWidth: 0, flex: V.isMobile ? V.searchFlex : '0 1 260px', order: V.searchOrder }}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.6" style={{ flex: 'none' }}><circle cx="7" cy="7" r="5" /><path d="m11 11 3.5 3.5" /></svg>
        <input value={V.q} onChange={V.onQ} placeholder="ค้นหางาน ประเภท ผู้รับผิดชอบ" style={{ border: 'none', outline: 'none', boxShadow: 'none', background: 'transparent', fontSize: 14, width: '100%', color: 'var(--text)' }} />
      </div>
      {V.hasScope && <Seg items={V.scopeOpts} nowrap style={{ order: V.searchOrder }} />}
      <button onClick={V.toggleLog} title="ประวัติการแจ้งเตือน" style={{ ...ctl, position: 'relative', width: 40, border: '1px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', display: 'grid', placeItems: 'center', flex: 'none' }}>
        <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="var(--text)" strokeWidth="1.5"><path d="M4 11V7a4 4 0 0 1 8 0v4l1.2 1.5H2.8L4 11Z" /><path d="M6.5 14a1.6 1.6 0 0 0 3 0" /></svg>
        {V.hasUnread && <span style={{ ...badge, position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, display: 'grid', placeItems: 'center', padding: '0 4px' }}>{V.unread}</span>}
      </button>
      {V.showCreateBtn && <button className="btn-grad" onClick={V.openCreate} style={{ ...ctl, border: 'none', padding: '0 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
        <span style={{ fontSize: 19, lineHeight: 1 }}>+</span>{V.createLabel}
      </button>}
      {V.showLog && <NotificationLog V={V} />}
    </header>
  );
}

function MobileTabs({ V }) {
  return (
    <nav data-noprint="1" style={{ display: 'grid', gridTemplateColumns: V.tabCols, borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '6px 4px 10px' }}>
      {V.tabItems.map((n) => (
        <button key={n.label} onClick={n.onClick} style={{ border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 0', minHeight: 48, cursor: 'pointer', color: n.tc, position: 'relative' }}>
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d={n.d} /></svg>
          <span style={{ fontSize: 11 }}>{n.short}</span>
          {n.hasBadge && <span style={{ ...badge, position: 'absolute', top: 2, left: 'calc(50% + 6px)', minWidth: 16, height: 16, fontSize: 10, display: 'grid', placeItems: 'center', padding: '0 3px' }}>{n.badge}</span>}
        </button>
      ))}
    </nav>
  );
}

export default function View({ V }) {
  const fr = V.fr;
  return (
    <>
      <div data-print-auto="1" style={{ position: 'relative', width: fr.w, height: fr.h, margin: fr.m, borderRadius: fr.r, border: fr.b, transform: fr.t, overflow: 'hidden', background: 'var(--bg)' }}>
        {V.booting && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 14 }}>กำลังโหลด…</div>}
        {V.loggedOut && !V.booting && <Login V={V} />}
        {!V.loggedOut && !V.mustChange && <div data-print-auto="1" style={{ display: 'grid', gridTemplateColumns: V.shellCols, height: '100%', overflow: 'hidden' }}>
          <Sidebar V={V} />
          <main data-print-auto="1" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', position: 'relative' }}>
            <Header V={V} />
            <div data-print-auto="1" key={V.viewKey} className="page-in" style={{ flex: 1, overflow: 'auto', padding: V.contentPad, background: 'radial-gradient(900px 260px at 25% -40px,var(--glow),transparent 75%)' }}>
              {V.isDash && <Dashboard V={V} />}
              {V.isList && <List V={V} />}
              {V.isCal && <Calendar V={V} />}
              {V.isTeam && <Team V={V} />}
              {V.isApprovals && <Approvals V={V} />}
              {V.isReport && <Report V={V} />}
              {V.isUsers && <Users V={V} />}
              {V.isAlerts && <Alerts V={V} />}
              {V.isAudit && <Audit V={V} />}
            </div>
            {V.isMobile && <MobileTabs V={V} />}
          </main>
        </div>}

        {V.hasSel && <TaskDetail V={V} />}
        {V.showCreate && <CreateTask V={V} />}
        {V.showUserForm && <UserForm V={V} />}
        {V.showPwForm && <ChangePassword V={V} />}
        <Toasts V={V} />
      </div>
    </>
  );
}
