import React from 'react';
import { MONO, Seg } from './ui.jsx';
import Login from './Login.jsx';
import { Dashboard, List, Calendar, Team, Report, Users, Alerts, Audit } from './pages.jsx';
import { Toasts, TaskDetail, CreateTask, UserForm, ChangePassword } from './overlays.jsx';

const badge = { fontSize: 11, fontFamily: MONO, background: '#B83A32', color: '#fff', borderRadius: 99 };

function Sidebar({ V }) {
  return (
    <aside data-noprint="1" style={{ background: '#16302E', color: '#E7EFEC', display: V.sideDisplay, flexDirection: 'column', padding: '20px 12px', gap: 24, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
        <div style={{ width: 38, height: 38, flex: 'none', borderRadius: 10, background: 'linear-gradient(145deg,#1e293b,#020617)', boxShadow: '0 4px 10px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.12)', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 16, letterSpacing: '-0.04em' }}>
          <span><span style={{ color: '#fff' }}>S</span><span style={{ color: '#3b82f6' }}>T</span></span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3, color: '#fff' }}>Smart Task Scheduling &amp; Alert System</div>
          <div style={{ fontSize: 11, color: '#9DB5B0', lineHeight: 1.4, marginTop: 2 }}>ระบบจัดตารางงาน &amp; แจ้งเตือนอัจฉริยะ</div>
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {V.navItems.map((n) => (
          <button key={n.label} onClick={n.onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', border: 'none', borderRadius: 8, background: n.bg, color: n.c, fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={n.d} /></svg>
            <span style={{ flex: 1 }}>{n.label}</span>
            {n.hasBadge && <span style={{ ...badge, padding: '1px 7px' }}>{n.badge}</span>}
          </button>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, color: '#8BA6A0' }}>เวลาในระบบ</span>
          <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 500 }}>{V.nowText}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 10px', borderTop: '1px solid rgba(231,239,236,0.12)' }}>
          <span style={{ width: 36, height: 36, flex: 'none', borderRadius: '50%', background: '#E7EFEC', color: '#16302E', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600 }}>{V.user.short}</span>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{V.user.name}</span>
            <span style={{ fontSize: 11, color: '#9DB5B0' }}>{V.user.role}</span>
          </span>
          <button onClick={V.openPw} title="เปลี่ยนรหัสผ่าน" style={{ border: '1px solid rgba(231,239,236,0.25)', background: 'transparent', color: '#E7EFEC', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', display: 'grid', placeItems: 'center' }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="5.5" cy="10.5" r="2.7" /><path d="M7.5 8.5 13.5 2.5M11 5l1.8 1.8M9.5 6.5l1.5 1.5" /></svg></button>
          <button onClick={V.logout} title="ออกจากระบบ" style={{ border: '1px solid rgba(231,239,236,0.25)', background: 'transparent', color: '#E7EFEC', borderRadius: 7, padding: '5px 8px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>ออก</button>
        </div>
      </div>
    </aside>
  );
}

function NotificationLog({ V }) {
  return (
    <div style={{ position: 'absolute', top: 60, right: 14, width: 'min(380px,calc(100% - 28px))', maxHeight: 460, overflow: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 18px 40px rgba(22,48,46,0.16)', zIndex: 30, padding: 8 }}>
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
  return (
    <header data-noprint="1" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: V.headerPad, borderBottom: '1px solid var(--border)', background: 'var(--bg2)', flexWrap: 'wrap', position: 'relative' }}>
      {V.isMobile && (
        <button onClick={V.logout} title="ออกจากระบบ" style={{ width: 36, height: 36, flex: 'none', border: 'none', borderRadius: '50%', background: '#16302E', color: '#E7EFEC', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{V.user.short}</button>
      )}
      <div style={{ fontSize: 18, fontWeight: 600, marginRight: 'auto' }}>{V.viewTitle}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 9, padding: '0 12px', height: 38, minWidth: 0, flex: V.searchFlex, order: V.searchOrder }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.6"><circle cx="7" cy="7" r="5" /><path d="m11 11 3.5 3.5" /></svg>
        <input value={V.q} onChange={V.onQ} placeholder="ค้นหางาน ประเภท หรือผู้รับผิดชอบ" style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, width: '100%', color: 'var(--text)' }} />
      </div>
      {V.hasScope && <Seg items={V.scopeOpts} nowrap style={{ order: V.searchOrder }} />}
      <button onClick={V.toggleLog} style={{ position: 'relative', width: 38, height: 38, borderRadius: 9, border: '1px solid var(--border2)', background: 'var(--surface)', cursor: 'pointer', display: 'grid', placeItems: 'center', flex: 'none' }}>
        <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="var(--text)" strokeWidth="1.5"><path d="M4 11V7a4 4 0 0 1 8 0v4l1.2 1.5H2.8L4 11Z" /><path d="M6.5 14a1.6 1.6 0 0 0 3 0" /></svg>
        {V.hasUnread && <span style={{ ...badge, position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, display: 'grid', placeItems: 'center', padding: '0 4px' }}>{V.unread}</span>}
      </button>
      {V.showCreateBtn && <button onClick={V.openCreate} style={{ height: 38, border: 'none', borderRadius: 9, background: '#1F5E5B', color: '#fff', padding: '0 14px', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flex: 'none' }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>{V.createLabel}
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
            <div data-print-auto="1" style={{ flex: 1, overflow: 'auto', padding: V.contentPad }}>
              {V.isDash && <Dashboard V={V} />}
              {V.isList && <List V={V} />}
              {V.isCal && <Calendar V={V} />}
              {V.isTeam && <Team V={V} />}
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
