import React from 'react';
import { MONO, card, Toggle, ToggleRow, Seg, Chips, Kpi, Bar, TaskRow, Stack, Empty, selectStyle } from './ui.jsx';

const grid = (min, gap = 12, extra) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))`, gap, ...extra });
const h1 = { margin: '4px 0 0', fontSize: 24, fontWeight: 600 };
const muted = { fontSize: 13, color: 'var(--muted)' };
const cardTitle = { fontWeight: 700, fontSize: 15, letterSpacing: '-0.005em' };
const linkBtn = { border: 'none', background: 'none', color: 'var(--primary)', fontSize: 13, cursor: 'pointer' };
const navBtn = { border: '1px solid var(--border2)', background: 'var(--surface)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' };

const STAT_ICONS = [
  'M4 5h16v15H4zM4 9.5h16M8 3v4M16 3v4M9 14.5l2 2 4-4',
  'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  'M12 3 2.5 20h19L12 3zM12 10v4.5M12 17.2v.1',
  'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l3 3 5-6',
];

// purely illustrative mock rows for the dashboard hero banner — the four pillars of the product
const HERO_MOCK = [
  { e: '▤', t: 'รายการงาน (Task List)', glow: '#00d4ff' },
  { e: '⏰', t: 'กำหนดส่ง (Due Dates)', glow: '#ffaa00' },
  { e: '📊', t: 'รายงานสรุปผล (Report)', glow: '#00e676' },
  { e: '🔔', t: 'แจ้งเตือนอัจฉริยะ', glow: '#d500f9' },
];

const heroIconStyle = (glow) => ({
  background: `radial-gradient(circle, color-mix(in srgb,${glow} 30%,transparent) 0%, color-mix(in srgb,${glow} 12%,transparent) 100%)`,
  color: glow,
  border: `1px solid color-mix(in srgb,${glow} 40%,transparent)`,
  boxShadow: `0 0 12px color-mix(in srgb,${glow} 30%,transparent)`,
});

const CALENDAR_PATH = 'M4 5h16v15H4zM4 9.5h16M8 3v4M16 3v4';

export function Dashboard({ V }) {
  return (
    <Stack gap={18} style={{ maxWidth: 1280 }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: V.isMobile ? '22px 20px' : '30px', color: '#fff', background: 'linear-gradient(135deg,#0B1A38 0%,#0D2858 50%,#061126 100%)', boxShadow: '0 15px 35px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1)', border: '1px solid rgba(0,162,255,0.2)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 26 }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 20%, rgba(0,162,255,0.15) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(0,81,255,0.1) 0%, transparent 40%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', flex: '1 1 320px', minWidth: 0, maxWidth: V.isMobile ? '100%' : 460 }}>
          <div style={{ fontSize: 13, color: '#8DA4CE', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={CALENDAR_PATH} /></svg>
            {V.todayLabel}
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.3, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>สวัสดี {V.user.name}</h1>
          <div style={{ fontSize: 14, color: '#A0B7E2', marginTop: 4, marginBottom: 24 }}>{V.user.role} · {V.scopeLabel}</div>

          <div style={{ marginBottom: 22, width: '100%', maxWidth: 340 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#8DA4CE', marginBottom: 8 }}>
              <span>ความก้าวหน้าของวันนี้</span>
              <span style={{ fontFamily: MONO }}>{V.pctSub} ({V.pct}%)</span>
            </div>
            <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ width: V.pct + '%', height: '100%', background: 'linear-gradient(90deg,#0082ff,#00d4ff)', boxShadow: '0 0 10px #00d4ff', borderRadius: 10, transition: 'width .6s ease' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="hero-btn" onClick={V.openCreate} style={{ height: 42, padding: '0 22px', border: 'none', borderRadius: 10, background: '#fff', color: '#0B1A38', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>+ สร้างงาน</button>
            <button className="hero-btn" onClick={V.goCal} style={{ height: 42, padding: '0 22px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={CALENDAR_PATH} /></svg>
              ดูปฏิทิน
            </button>
          </div>
        </div>

        {!V.isMobile && (
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 15, flex: '1 1 380px', maxWidth: 460 }}>
            {HERO_MOCK.map((r) => (
              <div key={r.t} className="hero-widget" style={{ background: 'rgba(16,36,75,0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(0,195,255,0.2)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
                <span style={{ width: 48, height: 48, flex: 'none', borderRadius: 12, display: 'grid', placeItems: 'center', fontSize: 20, ...heroIconStyle(r.glow) }}>{r.e}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.t}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <QuickAddBar V={V} />
      <NowNextRow V={V} />

      <TodayTimeline V={V} />

      <div style={grid(V.isMobile ? 140 : 190, 14)}>
        {V.stats.map((s, i) => (
          <button key={i} className="lift" onClick={s.onClick} style={{ ...card, textAlign: 'left', padding: V.isMobile ? '12px 12px' : '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: V.isMobile ? 10 : 14, color: 'var(--text)' }}>
            <span style={{ width: V.isMobile ? 38 : 46, height: V.isMobile ? 38 : 46, flex: 'none', borderRadius: 14, display: 'grid', placeItems: 'center', background: 'color-mix(in srgb,' + s.c + ' 14%,transparent)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={s.c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={STAT_ICONS[i % 4]} /></svg>
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{s.label}</span>
              <span style={{ fontSize: 30, fontWeight: 600, fontFamily: MONO, lineHeight: 1.15 }}>{s.value}</span>
              <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{s.sub}</span>
            </span>
          </button>
        ))}
      </div>

      <NextMeetingCard V={V} />
      <RolePanel V={V} />

      <Stack gap={10} style={{ ...card, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={cardTitle}>ตารางวันนี้</div>
          <button onClick={V.goCal} style={linkBtn}>ดูปฏิทิน →</button>
        </div>
        {V.todayTasks.map((t) => <TaskRow key={t.id} t={t} />)}
        {V.todayEmpty && <Empty icon="calendar" title="วันนี้ยังไม่มีงาน" sub="กด “สร้างงาน” เพื่อเพิ่มงานหรือนัดหมายแรกของวัน" />}
      </Stack>
      <WeekForecastRow V={V} />

      <div style={grid(290, 14, { alignItems: 'start' })}>
        <Stack gap={16} style={{ ...card, padding: 18 }}>
          <div style={cardTitle}>% งานสำเร็จวันนี้</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
            <div style={{ width: 124, height: 124, borderRadius: '50%', background: V.ringBg, display: 'grid', placeItems: 'center', flex: 'none' }}>
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--surface)', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: 26, fontWeight: 600, fontFamily: MONO }}>{V.pct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{V.pctSub}</div>
                </div>
              </div>
            </div>
            <Stack gap={8} style={{ flex: 1, minWidth: 120 }}>
              {V.breakdown.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: b.c }} />
                  <span style={{ flex: 1, color: 'var(--text2)' }}>{b.label}</span>
                  <span style={{ fontFamily: MONO }}>{b.count}</span>
                </div>
              ))}
            </Stack>
          </div>
        </Stack>

        <Stack gap={14} style={{ ...card, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={cardTitle}>งานล่าช้า · 7 วัน</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: 'var(--primary)' }} />ตรงเวลา</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: '#D97A5E' }} />ล่าช้า/ค้าง</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 8, alignItems: 'end' }}>
            {V.week7.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontFamily: MONO, color: 'var(--muted)' }}>{d.pctText}</span>
                <div style={{ width: '100%', maxWidth: 26, height: 104, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
                  <div style={{ height: d.lateH, background: '#D97A5E', borderRadius: 3 }} />
                  <div style={{ height: d.doneH, background: 'var(--primary)', borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, color: d.c, fontWeight: d.w }}>{d.label}</span>
              </div>
            ))}
          </div>
        </Stack>

        <Stack gap={10} style={{ ...card, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={cardTitle}>แจ้งเตือนเชิงรุก</div>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: MONO }}>{V.proactiveCount}</span>
          </div>
          {V.proactive.map((p, i) => (
            <button key={i} onClick={p.onClick} style={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'left', background: p.bg, border: 'none', borderRadius: 9, padding: '10px 12px', cursor: 'pointer' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: p.c, letterSpacing: '0.02em' }}>{p.tag}</span>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{p.title}</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{p.msg}</span>
            </button>
          ))}
          {V.noProactive && <Empty compact icon="check" title="เรียบร้อยดี" sub="ไม่มีงานที่ต้องจับตาในตอนนี้" />}
        </Stack>
      </div>
    </Stack>
  );
}

/* ---------- quick add: type a sentence, get a task ---------- */
function QuickAddBar({ V }) {
  return (
    <Stack gap={8} style={{ ...card, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', background: 'var(--ptint)', borderRadius: 5, padding: '2px 7px' }}>AI</span>
        <span style={{ ...cardTitle, fontSize: 14 }}>เพิ่มงานด่วน</span>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); V.onQuickAdd(); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={V.quickText} onChange={V.onQuickText} onKeyDown={V.onQuickKey} placeholder="เช่น “ประชุมทีม พรุ่งนี้ 9:30 ด่วน” — พิมพ์เป็นประโยคได้เลย" style={{ flex: '1 1 260px', height: 42, border: '1px solid var(--border2)', borderRadius: 10, padding: '0 14px', fontSize: 14, background: 'var(--surface)', color: 'var(--text)' }} />
        <button type="submit" disabled={V.quickBusy || !V.quickText.trim()} className="btn-grad" style={{ height: 42, padding: '0 18px', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: V.quickBusy || !V.quickText.trim() ? 0.6 : 1 }}>{V.quickBusy ? 'กำลังเพิ่ม…' : '+ เพิ่มงาน'}</button>
      </form>
      {V.quickErr && <span style={{ fontSize: 12.5, color: '#B83A32' }}>{V.quickErr}</span>}
      {V.quickPreview && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', alignItems: 'center', background: 'var(--tint)', borderRadius: 9, padding: '9px 12px', fontSize: 12.5 }}>
          <span style={{ color: 'var(--muted)' }}>ตัวอย่างงานที่จะสร้าง:</span>
          <span style={{ fontWeight: 600 }}>{V.quickPreview.title}</span>
          <span style={{ color: 'var(--muted)' }}>· {V.quickPreview.dateLabel}</span>
          <span style={{ color: 'var(--muted)' }}>· {V.quickPreview.timeLabel}</span>
          <span style={{ color: 'var(--muted)' }}>· {V.quickPreview.typeLabel}</span>
          <span style={{ color: 'var(--muted)' }}>· ความสำคัญ{V.quickPreview.priLabel}</span>
        </div>
      )}
    </Stack>
  );
}

/* ---------- ตอนนี้ / ถัดไป ---------- */
function NowCard({ n }) {
  if (!n) return <Stack gap={6} style={{ ...card, padding: 16 }}><div style={{ ...cardTitle, fontSize: 13, color: 'var(--muted)' }}>ตอนนี้</div><Empty compact icon="check" title="ไม่มีงานที่ต้องทำตอนนี้" /></Stack>;
  return (
    <Stack gap={10} style={{ ...card, padding: 16, borderLeft: `4px solid ${n.priC}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.02em' }}>ตอนนี้</span>
        <span style={{ fontSize: 12, color: n.isActive ? '#B4540F' : '#8A6500' }}>{n.remainLabel}</span>
      </div>
      <button onClick={n.open} style={{ border: 'none', background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{n.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{n.type} · ความสำคัญ{n.priLabel} · {n.timeLabel}</div>
      </button>
      {n.isActive && <div style={{ height: 7, background: 'var(--track)', borderRadius: 99, overflow: 'hidden' }}><div style={{ width: n.pct + '%', height: '100%', background: n.priC, borderRadius: 99 }} /></div>}
      <button onClick={n.onBtn} style={{ alignSelf: 'flex-start', border: 'none', background: n.isActive ? '#2E7040' : 'var(--primary)', color: '#fff', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{n.btnLabel}</button>
    </Stack>
  );
}
function NextCard({ n }) {
  if (!n) return <Stack gap={6} style={{ ...card, padding: 16 }}><div style={{ ...cardTitle, fontSize: 13, color: 'var(--muted)' }}>ถัดไป</div><Empty compact icon="calendar" title="ไม่มีงานถัดไปแล้ววันนี้" /></Stack>;
  return (
    <Stack gap={10} style={{ ...card, padding: 16, borderLeft: `4px solid ${n.priC}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.02em' }}>ถัดไป</span>
        <span style={{ fontFamily: MONO, fontSize: 12.5, color: 'var(--primary)', fontWeight: 600 }}>{n.untilLabel}</span>
      </div>
      <button onClick={n.open} style={{ border: 'none', background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{n.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{n.type} · ความสำคัญ{n.priLabel} · {n.timeLabel}</div>
      </button>
      <button onClick={n.onEarly} style={{ alignSelf: 'flex-start', border: '1px solid var(--primary)', background: 'var(--surface)', color: 'var(--primary)', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>เริ่มก่อนเวลา</button>
    </Stack>
  );
}
function NowNextRow({ V }) {
  return (
    <div style={grid(260, 14)}>
      <NowCard n={V.nowNext.now} />
      <NextCard n={V.nowNext.next} />
    </div>
  );
}

/* ---------- ไทม์ไลน์วันนี้ ---------- */
function TodayTimeline({ V }) {
  const t = V.timeline;
  return (
    <Stack gap={12} style={{ ...card, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={cardTitle}>ไทม์ไลน์วันนี้ · 08:00–18:00</div>
        <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--muted)' }}>
          <span>ว่างเหลือ <b style={{ color: 'var(--text)' }}>{t.freeLabel}</b></span>
          <span>ช่วงว่างถัดไป <b style={{ color: 'var(--text)', fontFamily: MONO }}>{t.nextGapLabel}</b></span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 64, background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)' }}>
        {t.hours.map((h, i) => (
          <div key={i} style={{ position: 'absolute', left: h.pct, top: 0, bottom: 0, borderLeft: '1px dashed var(--border2)' }}>
            <span style={{ position: 'absolute', top: -18, left: 2, fontSize: 10.5, fontFamily: MONO, color: 'var(--muted2)' }}>{h.label}</span>
          </div>
        ))}
        {t.inWindow && <div style={{ position: 'absolute', left: t.nowPct, top: -4, bottom: -4, width: 2, background: '#B83A32', zIndex: 2 }} />}
        {t.items.map((e, i) => (
          <button key={i} onClick={e.open} title={e.title} style={{ position: 'absolute', top: 8, bottom: 8, left: e.leftPct, width: e.widthPct, background: e.bg, border: e.overdue ? '1.5px solid #B83A32' : '1px solid transparent', borderLeft: `3px solid ${e.c}`, borderRadius: 6, padding: '2px 6px', cursor: 'pointer', overflow: 'hidden', textAlign: 'left' }}>
            <span style={{ fontSize: 11, color: '#1C2826', whiteSpace: 'nowrap' }}>{e.title}</span>
          </button>
        ))}
      </div>
    </Stack>
  );
}

/* ---------- ประชุมถัดไป ---------- */
function NextMeetingCard({ V }) {
  const m = V.nextMeeting;
  if (!m) return null;
  return (
    <Stack gap={10} style={{ ...card, padding: 18, borderLeft: `4px solid ${m.urgent ? '#B83A32' : 'var(--primary)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={cardTitle}>ประชุมถัดไป</div>
        <span style={{ fontSize: 12.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: m.urgent ? '#FAE8E5' : 'var(--ptint)', color: m.urgent ? '#B83A32' : 'var(--primary)' }}>{m.untilLabel}</span>
      </div>
      <button onClick={m.open} style={{ border: 'none', background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
        <div style={{ fontSize: 17, fontWeight: 600 }}>{m.title}</div>
      </button>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', fontSize: 13, color: 'var(--text2)' }}>
        <span>{m.dateLabel} · {m.timeLabel}</span>
        <span>{m.modeLabel}{m.hasLocation ? ' · ' + m.location : ''}</span>
        <span>ผู้เข้าร่วม: {m.attText}</span>
      </div>
      {m.hasLink && <a href={m.link} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#2D8CFF', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>เข้าร่วม Zoom</a>}
    </Stack>
  );
}

/* ---------- 7 วันข้างหน้า ---------- */
function WeekForecastRow({ V }) {
  return (
    <Stack gap={10} style={{ ...card, padding: 16 }}>
      <div style={cardTitle}>7 วันข้างหน้า</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8 }}>
        {V.weekForecast.map((d) => (
          <button key={d.iso} onClick={d.onClick} style={{ textAlign: 'left', border: d.isToday ? '1.5px solid var(--primary)' : '1px solid var(--border)', background: d.isToday ? 'var(--tint)' : 'var(--surface)', borderRadius: 10, padding: '10px 11px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{d.wd} <span style={{ fontFamily: MONO }}>{d.dayNum}</span></span>
            <span style={{ fontSize: 20, fontWeight: 700, fontFamily: MONO, color: d.count ? 'var(--text)' : 'var(--muted2)' }}>{d.count}</span>
            <span style={{ fontSize: 11.5, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.firstLabel}</span>
            {(d.meetCount > 0 || d.highCount > 0) && (
              <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {d.meetCount > 0 && <span style={{ fontSize: 10.5, fontWeight: 600, background: '#ECE6F4', color: '#5B3E8C', borderRadius: 99, padding: '1px 7px' }}>ประชุม {d.meetCount}</span>}
                {d.highCount > 0 && <span style={{ fontSize: 10.5, fontWeight: 600, background: '#FAE8E5', color: '#B83A32', borderRadius: 99, padding: '1px 7px' }}>สำคัญสูง {d.highCount}</span>}
              </span>
            )}
          </button>
        ))}
      </div>
    </Stack>
  );
}

/* ---------- role-specific panels ---------- */
function RolePanel({ V }) {
  if (V.isSec) return <SecPanel V={V} />;
  if (V.isDir) return <DirPanel V={V} />;
  if (V.isNur) return <NurPanel V={V} />;
  if (V.isGen) return <GenPanel V={V} />;
  return null;
}

function SecPanel({ V }) {
  return (
    <Stack gap={14} style={{ ...card, padding: 18 }}>
      <div style={cardTitle}>สำหรับเลขานุการ</div>
      {V.secHasConflicts && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#FAE8E5', borderRadius: 10, padding: '10px 12px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#B83A32' }}>⚠ วันนี้มีนัดเวลาชนกัน</span>
          {V.secConflicts.map((c, i) => <span key={i} style={{ fontSize: 12.5, color: '#7A2A24' }}>{c.range} · {c.a} (ของฉัน) ชนกับ {c.b} ({c.dirName})</span>)}
        </div>
      )}
      {V.secBoards.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${V.secBoards.length},minmax(200px,1fr))`, gap: 12, overflowX: 'auto' }}>
          {V.secBoards.map((b) => (
            <Stack key={b.id} gap={6}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</span>
              {b.items.slice(0, 5).map((t) => (
                <button key={t.id} onClick={t.open} style={{ border: 'none', background: 'var(--bg2)', borderRadius: 8, padding: '7px 10px', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: MONO, fontSize: 11.5, color: 'var(--muted)', flex: 'none' }}>{t.start}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                </button>
              ))}
              {b.empty && <span style={{ fontSize: 12, color: 'var(--muted)' }}>ไม่มีงานวันนี้</span>}
            </Stack>
          ))}
        </div>
      )}
      <div style={grid(220, 12)}>
        <Stack gap={6}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>นัดที่รอผู้บริหารยืนยัน · {V.secPendingAppt.length}</span>
          {V.secPendingAppt.map((t) => <PendingRow key={t.id} t={t} todayIso={V.todayIso} />)}
          {!V.secPendingAppt.length && <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>ไม่มีนัดที่รอยืนยัน</span>}
        </Stack>
        <Stack gap={6}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>เอกสารที่รอเสนอลงนาม · {V.secPendingDocs.length}</span>
          {V.secPendingDocs.map((t) => <PendingRow key={t.id} t={t} todayIso={V.todayIso} />)}
          {!V.secPendingDocs.length && <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>ไม่มีเอกสารรอลงนาม</span>}
        </Stack>
      </div>
    </Stack>
  );
}
function PendingRow({ t, todayIso }) {
  const rejected = t.approvalStatus === 'rejected';
  return (
    <button onClick={t.open} style={{ border: 'none', background: rejected ? 'var(--tintred)' : 'var(--bg2)', borderRadius: 8, padding: '8px 10px', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 12.5, color: 'var(--text)' }}>{t.title}</span>
      <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{t.assigneeName} · {t.date === todayIso ? 'วันนี้' : t.date} {t.start}</span>
      {rejected && <span style={{ fontSize: 11.5, color: '#B83A32' }}>ปฏิเสธ: {t.approvalReason}</span>}
    </button>
  );
}

function DirPanel({ V }) {
  const pendingN = V.dirPendingApprovals.length;
  return (
    <Stack gap={14} style={{ ...card, padding: 18 }}>
      <div style={cardTitle}>สำหรับผู้บริหาร</div>
      <div style={{ fontSize: 14, background: 'var(--tint)', borderRadius: 10, padding: '10px 12px' }}>{V.dirSummary}</div>
      {pendingN > 0 && (
        <button onClick={V.goApprovals} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #E8B4AE', background: '#FAE8E5', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ width: 30, height: 30, flex: 'none', borderRadius: '50%', background: '#B83A32', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700 }}>{pendingN}</span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#B83A32' }}>เลขานุการลงตารางไว้ รอคุณยืนยัน / ลงนาม</span>
            <span style={{ display: 'block', fontSize: 12.5, color: '#7A2A24' }}>แตะเพื่อดูรายการทั้งหมดและตัดสินใจ</span>
          </span>
          <span style={{ fontSize: 20, color: '#B83A32' }}>→</span>
        </button>
      )}
      {V.dirTeamOverdue.length > 0 && (
        <Stack gap={6}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>งานค้างของฉัน · {V.dirTeamOverdue.length}</span>
          {V.dirTeamOverdue.slice(0, 3).map((t) => (
            <button key={t.id} onClick={t.open} style={{ border: 'none', background: 'var(--tintred)', borderRadius: 8, padding: '8px 10px', textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ fontSize: 12.5, color: 'var(--text)' }}>{t.title}</span>
              <span style={{ fontSize: 11.5, color: '#B83A32', display: 'block' }}>ค้างเกินเวลา · {t.timeRange}</span>
            </button>
          ))}
        </Stack>
      )}
      {!pendingN && !V.dirTeamOverdue.length && <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>ไม่มีงานที่ต้องตัดสินใจตอนนี้</span>}
      <Stack gap={6}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>ความคืบหน้าทีมวันนี้</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
          {V.teamMini.map((m) => (
            <div key={m.id} style={{ background: 'var(--bg2)', borderRadius: 8, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{m.name}</span>
              <div style={{ height: 5, background: 'var(--track)', borderRadius: 99, overflow: 'hidden' }}><div style={{ width: m.pctW, height: '100%', background: 'var(--primary)' }} /></div>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{m.done}/{m.total} เสร็จ · ค้าง {m.overdue}</span>
            </div>
          ))}
        </div>
      </Stack>
    </Stack>
  );
}

/* ---------- dedicated page: director's approval queue ---------- */
function ApprovalRow({ t, todayIso }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', ...card, padding: '12px 14px' }}>
      <button onClick={t.open} style={{ flex: 1, minWidth: 200, border: 'none', background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
        <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{t.title}</span>
        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{t.date === todayIso ? 'วันนี้' : t.date} · {t.timeRange} · ความสำคัญ{t.priLabel} · จัดโดย {t.creatorName}</span>
      </button>
      <button onClick={t.onApprove} style={{ border: 'none', background: '#2E7040', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>ยืนยัน</button>
      <button onClick={t.onReject} style={{ border: '1px solid #B83A32', background: 'var(--surface)', color: '#B83A32', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>ปฏิเสธ</button>
    </div>
  );
}
export function Approvals({ V }) {
  const a = V.approveAsk;
  const appts = V.dirPendingApprovals.filter((t) => t.type !== 'เอกสาร');
  const docs = V.dirPendingApprovals.filter((t) => t.type === 'เอกสาร');
  return (
    <Stack gap={20} style={{ maxWidth: 900, position: 'relative' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>งานที่รอยืนยัน / ลงนาม</h1>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>รายการที่เลขานุการลงไว้ในตารางของคุณ ต้องยืนยันหรือปฏิเสธก่อนจึงจะถือว่าเป็นนัดที่ยืนยันแล้ว</div>
      </div>
      <Stack gap={10}>
        <div style={cardTitle}>นัดหมาย / ประชุมที่รอยืนยัน · {appts.length}</div>
        {appts.map((t) => <ApprovalRow key={t.id} t={t} todayIso={V.todayIso} />)}
        {!appts.length && <Empty compact icon="check" title="ไม่มีนัดที่รอยืนยัน" />}
      </Stack>
      <Stack gap={10}>
        <div style={cardTitle}>เอกสารที่รอลงนาม · {docs.length}</div>
        {docs.map((t) => <ApprovalRow key={t.id} t={t} todayIso={V.todayIso} />)}
        {!docs.length && <Empty compact icon="check" title="ไม่มีเอกสารที่รอลงนาม" />}
      </Stack>
      {V.dirTeamOverdue.length > 0 && (
        <Stack gap={10}>
          <div style={cardTitle}>งานค้างของฉัน · {V.dirTeamOverdue.length}</div>
          {V.dirTeamOverdue.map((t) => <TaskRow key={t.id} t={t} />)}
        </Stack>
      )}
      {a && (
        <>
          <div className="scrim-in" onClick={V.closeApprove} style={{ position: 'fixed', inset: 0, background: 'rgba(11,22,54,0.42)', zIndex: 60 }} />
          <div className="pop-in" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(420px,calc(100% - 32px))', background: 'var(--surface)', borderRadius: 16, padding: 20, zIndex: 61, boxShadow: '0 30px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>ปฏิเสธนัดนี้ — ระบุเหตุผล</span>
            <textarea autoFocus value={a.reason} onChange={V.onApproveReason} rows={3} placeholder="เช่น เวลาไม่สะดวก ให้เลื่อนไปช่วงบ่าย" style={{ border: `1px solid ${a.err ? '#B83A32' : 'var(--border2)'}`, borderRadius: 9, padding: '9px 11px', fontSize: 14 }} />
            {a.err && <span style={{ fontSize: 12, color: '#B83A32' }}>{a.err}</span>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={V.closeApprove} style={{ border: '1px solid var(--border2)', background: 'var(--surface)', borderRadius: 9, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>ยกเลิก</button>
              <button onClick={V.confirmApprove} style={{ border: 'none', background: '#B83A32', color: '#fff', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>ยืนยันการปฏิเสธ</button>
            </div>
          </div>
        </>
      )}
    </Stack>
  );
}
function NurPanel({ V }) {
  const f = V.nurseSwapForm;
  return (
    <Stack gap={16} style={{ ...card, padding: 18, position: 'relative' }}>
      <div style={cardTitle}>สำหรับพยาบาล</div>
      <div style={grid(240, 14)}>
        <Stack gap={6}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>รอบยา / ตรวจถัดไป</span>
          {V.nurseNextCare ? (
            <button onClick={V.nurseNextCare.open} style={{ border: 'none', background: V.nurseNextCare.due ? 'var(--tintamber)' : 'var(--tint)', borderRadius: 10, padding: '12px 14px', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{V.nurseNextCare.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{V.nurseNextCare.timeLabel} · {V.nurseNextCare.untilLabel}</div>
            </button>
          ) : <Empty compact icon="check" title="ไม่มีรอบที่ต้องทำต่อวันนี้" />}
        </Stack>
        <Stack gap={6}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>บันทึกส่งเวร</span>
          <textarea value={V.nurseHandoverNote} onChange={V.onHandoverNote} rows={3} placeholder="เช่น ผู้ป่วยเตียง 3 ไข้ขึ้นช่วงบ่าย ให้ยาลดไข้แล้ว ติดตามต่อ" style={{ border: '1px solid var(--border2)', borderRadius: 9, padding: '8px 10px', fontSize: 13, resize: 'vertical' }} />
          <button onClick={V.onSaveHandover} disabled={V.nurseHandoverBusy} style={{ alignSelf: 'flex-start', border: 'none', background: 'var(--primary)', color: '#fff', borderRadius: 8, padding: '6px 14px', fontSize: 12.5, cursor: 'pointer', opacity: V.nurseHandoverBusy ? 0.6 : 1 }}>{V.nurseHandoverBusy ? 'กำลังบันทึก…' : 'บันทึกส่งเวร'}</button>
        </Stack>
      </div>

      <Stack gap={8}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>เช็กลิสต์งานประจำเวร · {V.nurseChecklist.filter((c) => c.done).length}/{V.nurseChecklist.length}</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 8 }}>
          {V.nurseChecklist.map((c) => (
            <button key={c.id} onClick={c.onToggle} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)', background: c.done ? 'var(--tint2)' : 'var(--surface)', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 18, height: 18, flex: 'none', borderRadius: 5, border: `1.5px solid ${c.done ? '#2E7040' : 'var(--border2)'}`, background: c.done ? '#2E7040' : 'transparent', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12 }}>{c.done ? '✓' : ''}</span>
              <span style={{ fontSize: 12.5, textDecoration: c.done ? 'line-through' : 'none', color: c.done ? 'var(--muted)' : 'var(--text)' }}>{c.timeLabel} {c.title}</span>
            </button>
          ))}
          {!V.nurseChecklist.length && <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>ไม่มีงานวันนี้</span>}
        </div>
      </Stack>

      <Stack gap={8}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>สลับเวร เช้า / บ่าย / ดึก</span>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {V.nurseShiftDays.map((d) => (
            <div key={d.iso} style={{ flex: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 10px', minWidth: 96, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{d.label}</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {d.shiftOpts.map((o) => (
                  <button key={o.label} onClick={o.onClick} title={o.label} style={{ flex: 1, border: 'none', borderRadius: 6, padding: '4px 0', fontSize: 11, cursor: 'pointer', background: o.on ? 'var(--primary)' : 'var(--bg2)', color: o.on ? '#fff' : 'var(--text2)' }}>{o.label[0]}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>ดูเพื่อนร่วมงานวันที่</span>
          <input type="date" value={V.nurseColDate} onChange={(e) => V.onLoadColleagues(e.target.value)} style={{ border: '1px solid var(--border2)', borderRadius: 8, padding: '5px 8px', fontSize: 12.5 }} />
        </div>
        {V.nurseColleagues.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8 }}>
            {V.nurseColleagues.map((c) => (
              <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 12.5 }}>{c.name} <span style={{ color: 'var(--muted)' }}>· {c.shiftLabel}</span></span>
                {c.canSwap && <button onClick={c.onSwap} style={{ border: '1px solid var(--primary)', background: 'var(--surface)', color: 'var(--primary)', borderRadius: 7, padding: '4px 10px', fontSize: 11.5, cursor: 'pointer', whiteSpace: 'nowrap' }}>ขอสลับ</button>}
              </div>
            ))}
          </div>
        )}
        {(V.nurseSwapsIn.length > 0 || V.nurseSwapsOut.length > 0) && (
          <Stack gap={6}>
            {V.nurseSwapsIn.map((sw) => (
              <div key={sw.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: 'var(--tintamber)', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ fontSize: 12.5, flex: 1, minWidth: 160 }}>{sw.fromName} ขอสลับเวร {sw.date} · {sw.fromShift} ↔ {sw.toShift}ของคุณ</span>
                <button onClick={sw.onAccept} style={{ border: 'none', background: '#2E7040', color: '#fff', borderRadius: 7, padding: '4px 10px', fontSize: 11.5, cursor: 'pointer' }}>ตอบรับ</button>
                <button onClick={sw.onDecline} style={{ border: '1px solid #B83A32', background: 'var(--surface)', color: '#B83A32', borderRadius: 7, padding: '4px 10px', fontSize: 11.5, cursor: 'pointer' }}>ปฏิเสธ</button>
              </div>
            ))}
            {V.nurseSwapsOut.map((sw) => (
              <div key={sw.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: 'var(--bg2)', borderRadius: 8, padding: '8px 10px' }}>
                <span style={{ fontSize: 12.5, flex: 1, minWidth: 160 }}>ขอสลับกับ {sw.toName} · {sw.date} · <span style={{ color: sw.status === 'accepted' ? '#2E7040' : sw.status === 'declined' || sw.status === 'cancelled' ? '#6B6963' : '#9A6210' }}>{{ pending: 'รอตอบรับ', accepted: 'ตอบรับแล้ว', declined: 'ถูกปฏิเสธ', cancelled: 'ยกเลิกแล้ว' }[sw.status]}</span></span>
                {sw.onCancel && <button onClick={sw.onCancel} style={{ border: 'none', background: 'none', color: 'var(--muted)', fontSize: 11.5, cursor: 'pointer' }}>ยกเลิกคำขอ</button>}
              </div>
            ))}
          </Stack>
        )}
      </Stack>

      {f && (
        <>
          <div className="scrim-in" onClick={V.onCloseSwap} style={{ position: 'fixed', inset: 0, background: 'rgba(11,22,54,0.42)', zIndex: 60 }} />
          <div className="pop-in" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(380px,calc(100% - 32px))', background: 'var(--surface)', borderRadius: 16, padding: 20, zIndex: 61, boxShadow: '0 30px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>ขอสลับเวร</span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>วันที่ {f.date} — เวรของคุณ ({f.myShift}) ↔ เวรของเพื่อนร่วมงาน ({f.theirShift})</span>
            {V.nurseSwapErr && <span style={{ fontSize: 12, color: '#B83A32' }}>{V.nurseSwapErr}</span>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={V.onCloseSwap} style={{ border: '1px solid var(--border2)', background: 'var(--surface)', borderRadius: 9, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>ยกเลิก</button>
              <button onClick={V.onSendSwap} disabled={V.nurseSwapBusy} style={{ border: 'none', background: 'var(--primary)', color: '#fff', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: V.nurseSwapBusy ? 0.6 : 1 }}>{V.nurseSwapBusy ? 'กำลังส่ง…' : 'ส่งคำขอ'}</button>
            </div>
          </div>
        </>
      )}
    </Stack>
  );
}

function GenPanel({ V }) {
  return (
    <Stack gap={14} style={{ ...card, padding: 18 }}>
      <div style={cardTitle}>สำหรับคุณ</div>
      <div style={grid(220, 14)}>
        <Stack gap={6}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>บิล / ค่าใช้จ่ายใกล้ครบกำหนด</span>
          {V.genBills.map((t) => <PendingRow key={t.id} t={t} todayIso={V.todayIso} />)}
          {!V.genBills.length && <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>ไม่มีรายการค้าง</span>}
        </Stack>
        <Stack gap={6}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>นัดแพทย์ครั้งถัดไป</span>
          {V.genNextAppt ? (
            <button onClick={V.genNextAppt.open} style={{ border: 'none', background: 'var(--tint)', borderRadius: 10, padding: '10px 12px', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{V.genNextAppt.title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{V.genNextAppt.date} · {V.genNextAppt.start}</div>
            </button>
          ) : <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>ไม่มีนัดที่จะถึง</span>}
        </Stack>
        <Stack gap={6}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>สถานะเคลมที่ยื่นไว้</span>
          {V.genClaims.map((t) => (
            <button key={t.id} onClick={t.open} style={{ border: 'none', background: 'var(--bg2)', borderRadius: 8, padding: '8px 10px', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 12.5 }}>{t.title}</span>
              <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 99, background: t.statusBg, color: t.statusC, whiteSpace: 'nowrap' }}>{t.statusLabel}</span>
            </button>
          ))}
          {!V.genClaims.length && <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>ยังไม่มีการยื่นเคลม</span>}
        </Stack>
      </div>
    </Stack>
  );
}

function FilterSelect({ label, value, onChange, opts }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
      <select value={value} onChange={onChange} style={selectStyle}>
        {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}

export function List({ V }) {
  return (
    <Stack gap={16} style={{ maxWidth: 1100 }}>
      <Stack gap={12} style={{ ...card, padding: '14px 16px' }}>
        <div style={grid(170, 12, { alignItems: 'end' })}>
          <FilterSelect label="วันที่" value={V.fDate} onChange={V.onFDateSel} opts={V.dateOpts} />
          <FilterSelect label="สถานะ" value={V.fStatus} onChange={V.onFStatusSel} opts={V.statusOpts2} />
          <FilterSelect label="ความสำคัญ" value={V.fPri} onChange={V.onFPriSel} opts={V.priOpts2} />
          <FilterSelect label="ประเภทงาน" value={V.fType} onChange={V.onFTypeSel} opts={V.typeOpts2} />
        </div>
        {V.isCustomDate && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>เลือกวันที่</span>
            <input type="date" value={V.fDateVal} onChange={V.onFDateVal} style={{ height: 38, border: '1px solid var(--border2)', borderRadius: 9, padding: '0 10px', fontSize: 14 }} />
          </label>
        )}
        {V.hasActiveFilter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>กรองอยู่ {V.activeFilterCount} เงื่อนไข</span>
            <button onClick={V.clearFilters} style={{ ...linkBtn, padding: 0 }}>ล้างตัวกรอง</button>
          </div>
        )}
      </Stack>
      <div style={muted}>พบ {V.listCount} งาน</div>
      {V.groups.map((g, gi) => (
        <Stack key={gi} gap={8}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '0 2px' }}>
            <span style={cardTitle}>{g.label}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{g.sub} · {g.count} งาน</span>
          </div>
          {g.items.map((t) => <TaskRow key={t.id} t={t} />)}
        </Stack>
      ))}
      {V.listEmpty && <div style={{ ...card, borderStyle: 'dashed' }}><Empty icon="search" title="ไม่พบงานตามเงื่อนไข" sub="ลองเปลี่ยนตัวกรอง หรือล้างตัวกรองเพื่อดูงานทั้งหมด" /></div>}
    </Stack>
  );
}

function TaskTip({ tip }) {
  const { t, ghost, rect } = tip;
  const W = 300;
  const GAP = 10;
  const fitsRight = rect.right + GAP + W <= window.innerWidth - 8;
  const left = fitsRight ? rect.right + GAP : Math.max(8, rect.left - GAP - W);
  const H = 200;
  const top = Math.min(Math.max(8, rect.top), window.innerHeight - H - 8);
  const rows = [
    ['เวลา', `${t.timeRange} (${t.durLabel})`],
    ['ประเภท', t.type],
    t.cancelNote && ['ยกเลิก', t.cancelReason],
    ['ผู้รับผิดชอบ', t.assigneeName],
    ['รูปแบบ', t.repeatLabel],
    t.isMeetingTip && ['สถานที่', t.location],
    t.note && ['บันทึก', t.note],
  ].filter(Boolean);
  return (
    <div style={{ position: 'fixed', left, top, width: W, zIndex: 60, pointerEvents: 'none', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `4px solid ${t.priC}`, borderRadius: 10, boxShadow: '0 14px 34px rgba(11,22,54,0.22)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35, color: 'var(--text)' }}>{t.title}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 12 }}>
        <span style={{ background: t.priBg, color: t.priC, padding: '1px 8px', borderRadius: 99, fontWeight: 600 }}>ความสำคัญ{t.priLabel}</span>
        <span style={{ background: ghost ? 'var(--soft)' : t.statusBg, color: ghost ? 'var(--muted)' : t.statusC, padding: '1px 8px', borderRadius: 99 }}>{ghost ? '↻ รอบวนซ้ำ' : `${t.statusG} ${t.statusLabel}`}</span>
        {t.hasFlag && !ghost && <span style={{ background: t.flagBg, color: t.flagC, padding: '1px 8px', borderRadius: 99, fontWeight: 600 }}>{t.flag}</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '78px minmax(0,1fr)', gap: '4px 8px', fontSize: 12 }}>
        {rows.map(([k, v]) => (
          <React.Fragment key={k}><span style={{ color: 'var(--muted)' }}>{k}</span><span style={{ color: 'var(--text)', overflowWrap: 'anywhere' }}>{v}</span></React.Fragment>
        ))}
      </div>
    </div>
  );
}

export function Calendar({ V }) {
  const [tip, setTip] = React.useState(null);
  const bind = (t, ghost) => ({
    onMouseEnter: (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      setTip({ t: { ...t, isMeetingTip: t.type === 'ประชุม' && !!t.location }, ghost, rect: { left: r.left, right: r.right, top: r.top, bottom: r.bottom } });
    },
    onMouseLeave: () => setTip(null),
  });
  return (
    <Stack gap={14} style={{ maxWidth: 1280 }}>
      {tip && <TaskTip tip={tip} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Seg items={V.calModes} pad="6px 14px" />
        <div style={{ fontWeight: 600, fontSize: 16, marginRight: 'auto' }}>{V.calLabel}</div>
        <button onClick={V.calPrev} style={navBtn}>‹</button>
        <button onClick={V.calNow} style={navBtn}>วันนี้</button>
        <button onClick={V.calNext} style={navBtn}>›</button>
      </div>

      {V.isWeek && (
        <>
          <div style={{ ...card, overflow: 'auto' }}>
            <div style={{ minWidth: 880 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7,minmax(0,1fr))', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                <div />
                {V.calDays.map((d, i) => (
                  <div key={i} style={{ padding: '10px 8px', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{d.wd}</span>
                    <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: d.numC, background: d.numBg, borderRadius: 6, padding: '0 6px' }}>{d.num}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7,minmax(0,1fr))', height: 728 }}>
                <div style={{ position: 'relative' }}>
                  {V.hours.map((h, i) => (
                    <span key={i} style={{ position: 'absolute', top: h.top, right: 8, fontFamily: MONO, fontSize: 11, color: 'var(--muted2)', transform: 'translateY(-6px)' }}>{h.label}</span>
                  ))}
                </div>
                {V.calDays.map((d, i) => (
                  <div key={i} onClick={(ev) => { if (ev.target !== ev.currentTarget) return; const y = ev.clientY - ev.currentTarget.getBoundingClientRect().top; const m = 420 + Math.floor((y / 56) * 4) * 15; V.createAt(d.iso, String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')); }} style={{ position: 'relative', cursor: 'cell', borderLeft: '1px solid var(--border)', backgroundColor: d.bg, backgroundImage: 'repeating-linear-gradient(to bottom,transparent 0,transparent 55px,var(--line) 55px,var(--line) 56px)' }}>
                    {d.isToday && <div style={{ position: 'absolute', left: 0, right: 0, top: V.nowTop, height: 2, background: '#B83A32', zIndex: 2 }} />}
                    {d.events.map((e, j) => (
                      <button
                        key={j}
                        onClick={e.open}
                        {...bind(e.t, e.ghost)}
                        style={{ position: 'absolute', top: e.top, height: e.height, left: e.left, width: e.width, background: e.bg, border: `1px ${e.bs} ${e.bc}`, borderLeft: `3px solid ${e.stripe}`, borderRadius: 6, padding: '3px 6px', textAlign: 'left', cursor: 'pointer', overflow: 'hidden', opacity: e.op, display: 'flex', flexDirection: 'column', gap: 1 }}
                      >
                        <span style={{ fontSize: 11, fontFamily: MONO, color: e.c }}>{e.time}</span>
                        <span style={{ fontSize: 12, lineHeight: 1.3, color: e.textC, textDecoration: e.deco }}>{e.title}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>คลิกช่องว่างเพื่อสร้างงาน · กรอบเส้นประ = รอบถัดไปของงานวนซ้ำ · เส้นแดง = เวลาปัจจุบัน</div>
        </>
      )}

      {V.isMonth && (
        <>
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', borderBottom: '1px solid var(--border)' }}>
              {V.monthWd.map((w, i) => <div key={i} style={{ padding: 8, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>{w.label}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))' }}>
              {V.monthCells.map((c, i) => (
                <button key={i} onClick={c.onClick} onDoubleClick={c.onDbl} style={{ minHeight: V.cellH, border: 'none', borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: c.bg, boxShadow: c.ring, padding: 6, textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, opacity: c.op }}>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: c.numC, background: c.numBg, borderRadius: 6, padding: '0 5px', alignSelf: 'flex-start' }}>{c.num}</span>
                  {V.isMobile && (
                    <span style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {c.dots.map((o, j) => <span key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: o.c }} />)}
                    </span>
                  )}
                  {V.notMobile && (
                    <>
                      {c.chips.map((e, j) => (
                        <span key={j} {...bind(e.t, e.ghost)} style={{ display: 'block', fontSize: 11, lineHeight: 1.35, padding: '2px 5px', borderRadius: 4, background: e.bg, color: e.textC, borderLeft: `2px solid ${e.stripe}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: e.deco }}>
                          <span style={{ fontFamily: MONO, color: e.c }}>{e.time}</span> {e.title}
                        </span>
                      ))}
                      {c.hasMore && <span style={{ fontSize: 11, color: 'var(--muted)', paddingLeft: 4 }}>{c.more}</span>}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
          <Stack gap={8}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={cardTitle}>{V.selDayLabel}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{V.selDayCount} งาน</span>
              <button onClick={() => V.createAt(V.selDayIso)} style={{ ...linkBtn, marginLeft: 'auto' }}>+ สร้างงานในวันนี้</button>
            </div>
            {V.selDayItems.map((t, i) => <TaskRow key={t.id + i} t={t} />)}
            {V.selDayEmpty && <Empty compact icon="calendar" title="ไม่มีงานในวันนี้" />}
          </Stack>
        </>
      )}
    </Stack>
  );
}

export function Team({ V }) {
  return (
    <Stack gap={18} style={{ maxWidth: 1280 }}>
      <div>
        <div style={muted}>{V.todayLabel}</div>
        <h1 style={h1}>ภาพรวมทีม</h1>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>ดูได้อย่างเดียว · การแก้ไขตารางผู้บริหารทำผ่านเลขานุการ</div>
      </div>
      <div style={grid(150)}>{V.teamKpis.map((s, i) => <Kpi key={i} s={s} size={30} />)}</div>
      <div style={grid(260)}>
        {V.team.map((m) => (
          <Stack key={m.id} gap={12} style={{ ...card, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--navy)', color: '#E8EEFC', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, flex: 'none' }}>{m.short}</span>
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{m.role}</span>
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8 }}>
              {[['วันนี้', m.total, 'var(--text)'], ['เสร็จ', m.done, 'var(--text)'], ['ค้าง', m.overdue, m.odC]].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{l}</span>
                  <span style={{ fontFamily: MONO, fontSize: 18, color: c }}>{v}</span>
                </div>
              ))}
            </div>
            <Stack gap={5}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
                <span>ความคืบหน้าวันนี้</span><span style={{ fontFamily: MONO }}>{m.pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--track)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: m.pctW, background: 'var(--primary)', borderRadius: 99 }} />
              </div>
            </Stack>
            <div style={{ fontSize: 13, color: 'var(--text)', background: 'var(--bg2)', borderRadius: 8, padding: '8px 10px' }}>{m.curText}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>ตรงเวลา 7 วันล่าสุด <span style={{ fontFamily: MONO, color: 'var(--text)' }}>{m.rate7}</span></div>
          </Stack>
        ))}
      </div>
      <Stack gap={10} style={{ ...card, padding: 16 }}>
        <div style={cardTitle}>งานค้างเกินเวลาของทีม</div>
        {V.teamOverdue.map((t) => <TaskRow key={t.id} t={t} />)}
        {V.teamOverdueEmpty && <Empty compact icon="check" title="ไม่มีงานค้าง" sub="ทีมทำงานตามกำหนดทุกงาน" />}
      </Stack>
    </Stack>
  );
}

const repCols = '88px minmax(0,2fr) 90px 70px 96px 104px minmax(0,1.4fr)';

export function Report({ V }) {
  return (
    <Stack gap={16} style={{ maxWidth: 1100 }} >
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ marginRight: 'auto' }}>
          <div style={muted}>{V.rWho}</div>
          <h1 style={h1}>รายงานสรุปงาน</h1>
          <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>{V.rPeriod}</div>
        </div>
        <div data-noprint="1"><Seg items={V.rRanges} pad="6px 12px" /></div>
        <button data-noprint="1" onClick={V.exportPdf} style={{ height: 36, border: 'none', borderRadius: 9, background: 'var(--primary)', color: '#fff', padding: '0 14px', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 13.5h11" /></svg>Export PDF
        </button>
        <button data-noprint="1" onClick={V.exportXlsx} style={{ height: 36, border: '1px solid var(--primary)', borderRadius: 9, background: 'var(--surface)', color: 'var(--primary)', padding: '0 14px', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2.5 2.5h11v11h-11zM2.5 6.2h11M2.5 9.8h11M6.2 2.5v11" /></svg>Export Excel
        </button>
      </div>
      <div style={grid(150)}>{V.rKpis.map((s, i) => <Kpi key={i} s={s} />)}</div>
      <div style={grid(300)}>
        <Stack gap={12} style={{ ...card, padding: 16 }}>
          <div style={cardTitle}>แยกตามประเภทงาน</div>
          {V.rByType.map((r, i) => <Bar key={i} r={r} labelW={96} />)}
        </Stack>
        {V.hasByPerson && (
          <Stack gap={12} style={{ ...card, padding: 16 }}>
            <div style={cardTitle}>แยกตามผู้รับผิดชอบ</div>
            {V.rByPerson.map((r, i) => <Bar key={i} r={r} labelW={120} />)}
          </Stack>
        )}
      </div>
      <div style={{ ...card, overflow: 'auto' }}>
        <div style={{ padding: '14px 16px 6px', ...cardTitle }}>บันทึกงานล่าสุด</div>
        <div style={{ minWidth: 760 }}>
          <div style={{ display: 'grid', gridTemplateColumns: repCols, gap: 10, padding: '8px 16px', fontSize: 12, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
            <span>วันที่</span><span>งาน</span><span>ประเภท</span><span>สำคัญ</span><span>สถานะ</span><span>เริ่ม–เสร็จ</span><span>หมายเหตุ / ผลลัพธ์</span>
          </div>
          {V.rRows.map((r) => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: repCols, gap: 10, padding: '9px 16px', fontSize: 13, borderBottom: '1px solid var(--soft)', alignItems: 'center' }}>
              <span style={{ fontFamily: MONO, fontSize: 12 }}>{r.dateS}</span>
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span>{r.title}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{r.assigneeName}</span>
              </span>
              <span>{r.type}</span>
              <span style={{ color: r.priC, fontWeight: 600 }}>{r.priLabel}</span>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 99, background: r.statusBg, color: r.statusC, justifySelf: 'start', whiteSpace: 'nowrap' }}>{r.statusLabel}</span>
              <span style={{ fontFamily: MONO, fontSize: 12, color: r.timeC }}>{r.times}</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{r.noteS}</span>
            </div>
          ))}
        </div>
      </div>
    </Stack>
  );
}

const usersCols = 'minmax(0,1.6fr) 110px 140px minmax(0,1.3fr) 80px 130px';
const badge = (bg, c) => ({ fontSize: 12, padding: '2px 9px', borderRadius: 99, whiteSpace: 'nowrap', background: bg, color: c });

export function Users({ V }) {
  return (
    <Stack gap={16} style={{ maxWidth: 1180 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>จัดการผู้ใช้</h1>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4, textWrap: 'pretty' }}>กำหนดบทบาทให้แต่ละบัญชี เมื่อผู้ใช้เข้าสู่ระบบ ระบบจะแสดงหน้าจอและสิทธิ์ตามบทบาทนั้นโดยอัตโนมัติ</div>
      </div>
      <div style={grid(140)}>
        {V.userKpis.map((k, i) => (
          <div key={i} style={{ ...card, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={muted}>{k.label}</span>
            <span style={{ fontSize: 28, fontFamily: MONO, fontWeight: 500 }}>{k.value}</span>
          </div>
        ))}
      </div>
      <div style={{ ...card, overflow: 'auto' }}>
        <div style={{ minWidth: 820 }}>
          <div style={{ display: 'grid', gridTemplateColumns: usersCols, gap: 12, padding: '10px 16px', fontSize: 12, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
            <span>ผู้ใช้</span><span>ชื่อผู้ใช้</span><span>บทบาท</span><span>ผู้บริหารที่ดูแล</span><span>สถานะ</span><span />
          </div>
          {V.usersRows.map((r) => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: usersCols, gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--soft)', alignItems: 'center', fontSize: 13, opacity: r.rowOp }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{ width: 34, height: 34, flex: 'none', borderRadius: '50%', background: 'var(--navy)', color: '#E8EEFC', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>{r.short}</span>
                <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{r.role}</span>
                </span>
              </span>
              <span style={{ fontFamily: MONO, fontSize: 12 }}>{r.username}</span>
              <span style={{ display: 'flex' }}><span style={badge(r.roleBg, r.roleC)}>{r.roleLabel}</span></span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{r.managesText}</span>
              <span style={{ display: 'flex' }}><span style={badge(r.statusBg, r.statusC)}>{r.statusText}</span></span>
              <span style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button onClick={r.onEdit} style={{ border: '1px solid var(--border2)', background: 'var(--surface)', borderRadius: 8, padding: '5px 12px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>แก้ไข</button>
                {r.canToggle && <button onClick={r.onToggle} style={{ border: 'none', background: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>{r.toggleLabel}</button>}
              </span>
            </div>
          ))}
          {V.usersEmpty && <div style={{ padding: '24px 16px', ...muted }}>ไม่พบผู้ใช้</div>}
        </div>
      </div>
      <Stack gap={10} style={{ ...card, padding: 16 }}>
        <div style={cardTitle}>สิทธิ์ของแต่ละบทบาท</div>
        {V.roleDefs.map((d, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '150px minmax(0,1fr)', gap: 12, alignItems: 'center', padding: '6px 0', borderTop: '1px solid var(--soft)' }}>
            <span style={{ display: 'flex' }}><span style={badge(d.bg, d.c)}>{d.label}</span></span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>{d.desc}</span>
          </div>
        ))}
      </Stack>
    </Stack>
  );
}

const SETTING_SECTIONS = [
  { k: 'account', title: 'บัญชีของฉัน', sub: 'รหัสผ่านและการออกจากระบบ', icon: 'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5' },
  { k: 'appearance', title: 'ธีมหน้าจอ', sub: 'สว่าง · มืด · ตามอุปกรณ์', icon: 'M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  { k: 'channels', title: 'รูปแบบการแจ้งเตือน', sub: 'เสียง · Push · Popup', icon: 'M4 11V7a4 4 0 0 1 8 0v4l1.2 1.5H2.8L4 11zM6.5 14a1.6 1.6 0 0 0 3 0', tasks: true },
  { k: 'intensity', title: 'ความเข้มของการเตือน', sub: 'ตามระดับความสำคัญของงาน', icon: 'M2 13V9M6 13V6M10 13V3M14 13V7', tasks: true },
  { k: 'timing', title: 'เวลาและการเตือนซ้ำ', sub: 'เตือนล่วงหน้า · เตือนซ้ำ', icon: 'M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM8 4.5V8l2.5 1.5', tasks: true },
  { k: 'proactive', title: 'การแจ้งเตือนเชิงรุก', sub: 'งานค้าง · งานสำคัญ · AI', icon: 'M8 1.5 9.6 6l4.4.4-3.3 3 1 4.6L8 11.7 4.3 14l1-4.6-3.3-3L6.4 6 8 1.5z', tasks: true },
  { k: 'calendar', title: 'ปฏิทินภายนอก', sub: 'Google Calendar · Outlook', icon: 'M2 3h12v11H2zM2 6.5h12M5 1.5v3M11 1.5v3', tasks: true },
  { k: 'digest', title: 'สรุปงานประจำวัน', sub: 'อีเมล · LINE', icon: 'M2 4h12v8H2zM2 4l6 5 6-5', tasks: true },
];

export function Alerts({ V }) {
  const panel = { ...card, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 };
  const sections = SETTING_SECTIONS.filter((s) => !s.tasks || !V.isAdminUser);
  const active = sections.find((s) => s.k === V.settingsSec) || sections[0];
  const detail = {
    appearance: (
      <>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>เลือกธีมของหน้าจอระบบ การตั้งค่านี้จำไว้ในบัญชีของคุณ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
          {V.themeOpts.map((o) => {
            const dark = o.k === 'dark', sys = o.k === 'system';
            const pv = (d) => ({ bg: d ? '#151A19' : '#F3F1EB', card: d ? '#1F2726' : '#FFFFFF', line: d ? '#333D3B' : '#E4E0D6', txt: d ? '#E7EEEC' : '#1C2826' });
            const a = pv(dark), b = pv(true);
            return (
              <button key={o.k} onClick={o.onClick} style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', color: 'var(--text)', border: o.on ? '2px solid var(--primary)' : '2px solid var(--border)', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', height: 74, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {[a].concat(sys ? [b] : []).map((c, i) => (
                    <div key={i} style={{ flex: 1, background: c.bg, padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div style={{ height: 8, width: '55%', borderRadius: 4, background: c.txt, opacity: 0.85 }} />
                      <div style={{ flex: 1, background: c.card, border: '1px solid ' + c.line, borderRadius: 5, padding: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ height: 5, width: '80%', borderRadius: 3, background: c.line }} />
                        <div style={{ height: 5, width: '50%', borderRadius: 3, background: '#E6B422' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: o.on ? '4px solid var(--primary)' : '2px solid var(--border2)', flex: 'none' }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{o.label}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{o.desc}</span>
              </button>
            );
          })}
        </div>
      </>
    ),
    calendar: (
      <>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>แสดงตารางงานของคุณใน Google Calendar หรือ Outlook โดยสมัครรับปฏิทินจากลิงก์ด้านล่าง (ซิงก์ทางเดียว: ระบบนี้ → ปฏิทินภายนอก) อัปเดตตามรอบที่แอปปฏิทินกำหนด ซึ่งมักใช้เวลาหลายชั่วโมง</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input readOnly value={V.feedLoading ? 'กำลังโหลด…' : V.feedUrl} onFocus={(e) => e.target.select()} style={{ flex: 1, minWidth: 220, height: 38, border: '1px solid var(--border2)', borderRadius: 9, padding: '0 10px', fontSize: 12, fontFamily: MONO, background: 'var(--bg2)', color: 'var(--text)' }} />
          <button onClick={V.copyFeed} style={{ height: 38, padding: '0 14px', border: 'none', borderRadius: 9, background: 'var(--primary)', color: '#fff', fontSize: 13, cursor: 'pointer' }}>คัดลอกลิงก์</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={V.downloadIcs} style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid var(--primary)', background: 'var(--surface)', color: 'var(--primary)', fontSize: 13, cursor: 'pointer' }}>ดาวน์โหลดไฟล์ .ics</button>
          <button onClick={V.regenFeed} style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid var(--border2)', background: 'var(--surface)', color: 'var(--text)', fontSize: 13, cursor: 'pointer' }}>สร้างลิงก์ใหม่</button>
        </div>
        <div style={{ fontSize: 13, background: 'var(--bg2)', borderRadius: 10, padding: '12px 14px', lineHeight: 1.7 }}>
          <b>Google Calendar:</b> ปฏิทินอื่น (+) → จาก URL → วางลิงก์<br />
          <b>Outlook:</b> เพิ่มปฏิทิน → สมัครรับจากเว็บ → วางลิงก์<br />
          <b>ไฟล์ .ics:</b> นำเข้าครั้งเดียว (ไม่อัปเดตอัตโนมัติ)
        </div>
        <div style={{ fontSize: 12, color: '#9A6210', background: '#FAF0DC', borderRadius: 9, padding: '10px 12px', lineHeight: 1.6 }}>ลิงก์นี้เป็นความลับ ใครมีลิงก์จะเห็นตารางงานของคุณ อย่าส่งต่อ ถ้าหลุดให้กด "สร้างลิงก์ใหม่" · Google Calendar ต้องเข้าถึงเซิร์ฟเวอร์ผ่านอินเทอร์เน็ตได้ ถ้าระบบอยู่ในเครือข่ายโรงพยาบาลอย่างเดียวให้ใช้ Outlook ภายในเครือข่าย หรือไฟล์ .ics</div>
      </>
    ),
    digest: (
      <>
        <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>ระบบจะส่งสรุปงานของวันนั้น (รวมงานค้างและคำเชิญที่รอตอบรับ) ให้ทางอีเมลหรือ LINE ตามเวลาที่ตั้ง</div>
        <ToggleRow x={V.dg.enabledTog} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 13, color: 'var(--muted)', width: 90 }}>เวลาที่ส่ง</span><input type="time" value={V.dg.prefs.time} onChange={V.dg.onTime} style={{ border: '1px solid var(--border2)', borderRadius: 9, padding: '8px 10px', fontSize: 14, background: 'var(--surface)', color: 'var(--text)' }} /></label>
        <div style={{ borderTop: '1px solid var(--soft)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ToggleRow x={V.dg.emailTog} />
          <input type="email" placeholder="ชื่อ@โรงพยาบาล.go.th" value={V.dg.prefs.email} onChange={V.dg.onEmail} style={{ border: '1px solid var(--border2)', borderRadius: 9, padding: '9px 12px', fontSize: 14, background: 'var(--surface)', color: 'var(--text)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>สถานะเซิร์ฟเวอร์: {V.dg.emailStatus}</span>
        </div>
        <div style={{ borderTop: '1px solid var(--soft)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ToggleRow x={V.dg.lineTog} />
          <input placeholder="LINE User ID (U…)" value={V.dg.prefs.lineId} onChange={V.dg.onLineId} style={{ border: '1px solid var(--border2)', borderRadius: 9, padding: '9px 12px', fontSize: 13, fontFamily: MONO, background: 'var(--surface)', color: 'var(--text)' }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>ต้องเพิ่มเพื่อน LINE Official Account ของโรงพยาบาลก่อน และขอ LINE User ID จากผู้ดูแลระบบ · สถานะเซิร์ฟเวอร์: {V.dg.lineStatus}</span>
        </div>
        {V.dg.err && <div style={{ fontSize: 13, color: '#B83A32', background: '#FAE8E5', borderRadius: 8, padding: '8px 12px' }}>{V.dg.err}</div>}
        {V.dg.msg && <div style={{ fontSize: 13, color: '#2E7040', background: '#DDF0E1', borderRadius: 8, padding: '8px 12px' }}>{V.dg.msg}</div>}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={V.dg.save} disabled={V.dg.busy} style={{ padding: '9px 16px', border: 'none', borderRadius: 9, background: 'var(--primary)', color: '#fff', fontSize: 13, cursor: 'pointer', opacity: V.dg.busy ? 0.7 : 1 }}>บันทึก</button>
          <button onClick={V.dg.test} disabled={V.dg.busy} style={{ padding: '9px 16px', border: '1px solid var(--primary)', borderRadius: 9, background: 'var(--surface)', color: 'var(--primary)', fontSize: 13, cursor: 'pointer', opacity: V.dg.busy ? 0.7 : 1 }}>บันทึกและส่งทดสอบตอนนี้</button>
        </div>
        {V.dg.log.length > 0 && (
          <Stack gap={4}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>การส่งล่าสุด</span>
            {V.dg.log.map((l, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text2)' }}>{new Date(l.ts).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {l.channel === 'email' ? 'อีเมล' : l.channel === 'line' ? 'LINE' : 'ระบบ'} · <span style={{ color: l.status === 'error' ? '#B83A32' : '#2E7040' }}>{l.status === 'sent' ? 'ส่งแล้ว' : l.status === 'logged' ? 'บันทึกในระบบ (โหมดทดสอบ)' : 'ผิดพลาด'}</span>{l.status === 'error' && l.detail ? ' — ' + l.detail : ''}</div>
            ))}
          </Stack>
        )}
      </>
    ),
    account: (
      <>
        <div style={{ fontSize: 14 }}>{V.user.name}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: -8 }}>{V.user.role}</div>
        <button onClick={V.openPw} style={{ alignSelf: 'flex-start', padding: '8px 14px', borderRadius: 9, border: '1px solid var(--primary)', background: 'var(--surface)', color: 'var(--primary)', fontSize: 13, cursor: 'pointer' }}>เปลี่ยนรหัสผ่าน</button>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>ระบบจะออกจากระบบอัตโนมัติเมื่อไม่มีการใช้งานเกิน 15 นาที</div>
      </>
    ),
    channels: (
      <>
        {V.channelToggles.map((x, i) => <ToggleRow key={i} x={x} />)}
        <div style={{ borderTop: '1px solid var(--soft)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>เสียงแจ้งเตือน</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Chips items={V.toneChips} pad="7px 14px" radius={9} />
            <button onClick={V.testSound} style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid var(--border2)', background: 'var(--bg2)', fontSize: 13, cursor: 'pointer' }}>▶ ฟังเสียง</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)', width: 60 }}>ระดับเสียง</span>
            <input type="range" min="0" max="100" value={V.volume} onChange={V.onVolume} style={{ flex: 1 }} />
            <span style={{ fontFamily: MONO, fontSize: 13, width: 36, textAlign: 'right' }}>{V.volume}</span>
          </div>
        </div>
        <button onClick={V.testAlert} style={{ alignSelf: 'flex-start', padding: '8px 14px', borderRadius: 9, border: 'none', background: 'var(--primary)', color: '#fff', fontSize: 13, cursor: 'pointer' }}>ทดสอบการแจ้งเตือน</button>
      </>
    ),
    intensity: V.intensityRows.map((r, i) => (
      <Stack key={i} gap={6}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: r.c }} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{r.label}</span>
        </div>
        <Seg items={r.opts} pad="6px 8px" grow />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{r.desc}</span>
      </Stack>
    )),
    timing: (
      <>
        <Stack gap={8}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>เตือนล่วงหน้า (ค่าเริ่มต้นของงานใหม่)</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><Chips items={V.offChips} pad="5px 12px" /></div>
        </Stack>
        {V.renagToggle.map((x, i) => <ToggleRow key={i} x={x} />)}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--muted)', marginRight: 4 }}>เตือนซ้ำทุก</span>
          <Chips items={V.everyChips} pad="5px 12px" />
        </div>
      </>
    ),
    proactive: V.proToggles.map((x, i) => <ToggleRow key={i} x={x} />),
  }[active.k];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: V.isMobile ? 'minmax(0,1fr)' : '270px minmax(0,1fr)', gap: 16, maxWidth: 1080, alignItems: 'start' }}>
      <nav style={{ ...card, padding: 8, display: 'flex', flexDirection: V.isMobile ? 'row' : 'column', gap: 2, overflowX: V.isMobile ? 'auto' : 'visible' }}>
        {sections.map((s) => {
          const on = s.k === active.k;
          return (
            <button key={s.k} onClick={() => V.setSettingsSec(s.k)} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', border: 'none', borderRadius: 9, padding: '10px 12px', cursor: 'pointer', background: on ? 'var(--ptint)' : 'transparent', color: 'var(--text)', flex: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={on ? 'var(--primary)' : 'var(--muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}><path d={s.icon} /></svg>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 14, fontWeight: on ? 600 : 500 }}>{s.title}</span>
                {!V.isMobile && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s.sub}</span>}
              </span>
            </button>
          );
        })}
      </nav>
      <div style={panel}>
        <div style={{ ...cardTitle, fontSize: 17 }}>{active.title}</div>
        {detail}
      </div>
    </div>
  );
}

const ACTIONS = {
  login: ['เข้าสู่ระบบ', '#2E7040'], 'login.fail': ['เข้าสู่ระบบไม่สำเร็จ', '#B83A32'], logout: ['ออกจากระบบ', 'var(--muted)'],
  'logout.idle': ['ออกจากระบบอัตโนมัติ', '#9A6210'], 'password.change': ['เปลี่ยนรหัสผ่าน', 'var(--primary)'],
  'task.create': ['สร้างงาน', 'var(--primary)'], 'task.update': ['แก้ไขงาน', '#9A6210'], 'task.delete': ['ลบงาน', '#B83A32'],
  'file.upload': ['แนบไฟล์', 'var(--primary)'], 'file.download': ['ดาวน์โหลดไฟล์', 'var(--muted)'], 'file.delete': ['ลบไฟล์', '#B83A32'], 'task.cancel': ['ยกเลิกงาน', '#6B6963'], 'task.rsvp': ['ตอบรับคำเชิญ', 'var(--primary)'], 'report.export': ['ส่งออกรายงาน Excel', '#5E6966'], 'calendar.feed-regenerate': ['สร้างลิงก์ปฏิทินใหม่', '#9A6210'], 'digest.update': ['ตั้งค่าสรุปงานประจำวัน', '#5E6966'], 'digest.test': ['ทดสอบส่งสรุปงาน', '#5E6966'],
  'user.create': ['เพิ่มผู้ใช้', 'var(--primary)'], 'user.update': ['แก้ไขผู้ใช้', '#9A6210'], 'user.reset-password': ['รีเซ็ตรหัสผ่านผู้ใช้', '#B83A32'],
  'task.approve': ['ยืนยันนัด / ลงนาม', '#2E7040'], 'task.reject': ['ปฏิเสธนัด', '#B83A32'],
  'shift.set': ['ตั้งเวร', 'var(--primary)'], 'shift.swap-request': ['ขอสลับเวร', '#9A6210'], 'shift.swap-accept': ['ตอบรับสลับเวร', '#2E7040'], 'shift.swap-decline': ['ปฏิเสธสลับเวร', '#B83A32'], 'shift.swap-cancel': ['ยกเลิกคำขอสลับเวร', 'var(--muted)'],
  'handover.save': ['บันทึกส่งเวร', 'var(--primary)'],
  'system.init': ['เริ่มระบบ', 'var(--muted)'],
};
const FIELD = { title: 'ชื่องาน', type: 'ประเภท', priority: 'ความสำคัญ', date: 'วันที่', start: 'เวลาเริ่ม', dur: 'ระยะเวลา', repeat: 'รูปแบบ', status: 'สถานะ', assignee: 'ผู้รับผิดชอบ', mode: 'รูปแบบประชุม', location: 'สถานที่', link: 'ลิงก์', note: 'บันทึก', name: 'ชื่อ', username: 'ชื่อผู้ใช้', rk: 'บทบาท', role: 'ตำแหน่ง', active: 'สถานะบัญชี', manages: 'ผู้บริหารที่ดูแล' };
function describe(r) {
  const d = r.detail;
  if (!d) return '';
  if (r.action === 'task.update') {
    const ch = Object.entries(d.changes || {}).map(([k, v]) => (Array.isArray(v) ? `${FIELD[k] || k}: ${v[0] ?? '–'} → ${v[1] ?? '–'}` : `${FIELD[k] || k}: ${v}`));
    return `${d.title} · ${ch.join(' · ')}`;
  }
  if (r.action === 'task.cancel') return `${d.title} · ${d.date} ${d.start} · เหตุผล: ${d.reason}`;
  if (r.action === 'task.rsvp') return `${d.title} · ${d.status === 'accepted' ? 'ตอบรับ' : d.status === 'declined' ? 'ปฏิเสธ' + (d.reason ? ' (' + d.reason + ')' : '') : 'รอตอบรับ'}`;
  if (r.action === 'report.export') return `ช่วง ${d.range} วัน · ขอบเขต ${d.scope} · ${d.rows} แถว`;
  if (r.action === 'task.approve') return d.title || '';
  if (r.action === 'task.reject') return `${d.title || ''}${d.reason ? ' · เหตุผล: ' + d.reason : ''}`;
  if (r.action === 'shift.set') return `${r.entityId || ''} · เวร${d.shift || 'ว่าง'}`;
  if (r.action.startsWith('shift.swap')) return `${r.entityId ? 'วันที่ ' + d.date : ''}${d.to ? ' · กับ ' + d.to : ''}${d.myShift ? ' · เวร' + d.myShift + ' ↔ เวร' + d.theirShift : ''}`;
  if (r.action === 'handover.save') return `${r.entityId || ''} · ${d.len} ตัวอักษร`;
  if (r.action === 'task.create' || r.action === 'task.delete') return `${d.title} · ${d.date} ${d.start}`;
  if (r.action.startsWith('file.')) return `${d.file}${d.title ? ' · ' + d.title : ''}`;
  if (r.action === 'login' || r.action === 'login.fail') return [d.username, d.ip].filter(Boolean).join(' · ');
  if (r.action.startsWith('user.')) {
    const ch = Object.entries(d).filter(([k]) => k !== 'name' && k !== 'passwordReset').map(([k, v]) => (Array.isArray(v) ? `${FIELD[k] || k}: ${v[0] ?? '–'} → ${v[1] ?? '–'}` : `${FIELD[k] || k}: ${v}`));
    return `${d.name || ''}${d.username ? ' (' + d.username + ')' : ''}${d.passwordReset ? ' · ตั้งรหัสผ่านชั่วคราวใหม่' : ''}${ch.length ? ' · ' + ch.join(' · ') : ''}`;
  }
  return d.note || '';
}

export function Audit({ V }) {
  return (
    <Stack gap={14} style={{ maxWidth: 1180 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>ประวัติการใช้งาน (Audit log)</h1>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>บันทึกว่าใครทำอะไรเมื่อไร — การเข้าสู่ระบบ การสร้าง/แก้ไข/ลบงาน ไฟล์แนบ และการจัดการบัญชี · แก้ไขหรือลบไม่ได้</div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); V.onAuditGo(); }} style={{ display: 'flex', gap: 8 }}>
        <input value={V.auditQ} onChange={V.onAuditQ} placeholder="ค้นหา ชื่อผู้ใช้ การกระทำ หรือชื่องาน" style={{ flex: 1, height: 38, border: '1px solid var(--border2)', borderRadius: 9, padding: '0 12px', fontSize: 14, outline: 'none' }} />
        <button type="submit" style={{ height: 38, border: 'none', borderRadius: 9, background: 'var(--primary)', color: '#fff', padding: '0 16px', fontSize: 14, cursor: 'pointer' }}>{V.auditLoading ? 'กำลังโหลด…' : 'ค้นหา / รีเฟรช'}</button>
      </form>
      <div style={{ ...card, overflow: 'auto' }}>
        <div style={{ minWidth: 820 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 160px 170px minmax(0,1fr)', gap: 12, padding: '10px 16px', fontSize: 12, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
            <span>เวลา</span><span>ผู้ใช้</span><span>การกระทำ</span><span>รายละเอียด</span>
          </div>
          {V.auditRows.map((r) => {
            const [label, c] = ACTIONS[r.action] || [r.action, 'var(--muted)'];
            return (
              <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '150px 160px 170px minmax(0,1fr)', gap: 12, padding: '9px 16px', borderBottom: '1px solid var(--soft)', fontSize: 13, alignItems: 'start' }}>
                <span style={{ fontFamily: MONO, fontSize: 12 }}>{new Date(r.ts).toLocaleString('th-TH', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span>{r.userName || '—'}</span>
                <span style={{ color: c, fontWeight: 600 }}>{label}</span>
                <span style={{ color: 'var(--text2)', overflowWrap: 'anywhere' }}>{describe(r)}</span>
              </div>
            );
          })}
          {!V.auditRows.length && <div style={{ padding: '24px 16px', ...muted }}>{V.auditLoading ? 'กำลังโหลด…' : 'ไม่พบรายการ'}</div>}
        </div>
      </div>
    </Stack>
  );
}
