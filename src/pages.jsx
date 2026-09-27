import React from 'react';
import { MONO, card, Toggle, ToggleRow, Seg, Chips, Kpi, Bar, TaskRow, Stack, selectStyle } from './ui.jsx';

const grid = (min, gap = 12, extra) => ({ display: 'grid', gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))`, gap, ...extra });
const h1 = { margin: '4px 0 0', fontSize: 24, fontWeight: 600 };
const muted = { fontSize: 13, color: 'var(--muted)' };
const cardTitle = { fontWeight: 600, fontSize: 15 };
const linkBtn = { border: 'none', background: 'none', color: '#1F5E5B', fontSize: 13, cursor: 'pointer' };
const navBtn = { border: '1px solid var(--border2)', background: 'var(--surface)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' };

export function Dashboard({ V }) {
  return (
    <Stack gap={18} style={{ maxWidth: 1280 }}>
      <div>
        <div style={muted}>{V.todayLabel}</div>
        <h1 style={{ ...h1, letterSpacing: '-0.01em' }}>สวัสดี {V.user.name}</h1>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>{V.user.role} · {V.scopeLabel}</div>
      </div>

      <div style={grid(150)}>
        {V.stats.map((s, i) => (
          <button key={i} onClick={s.onClick} style={{ ...card, textAlign: 'left', padding: '14px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ ...muted, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.c, flex: 'none' }} />{s.label}
            </span>
            <span style={{ fontSize: 32, fontWeight: 500, fontFamily: MONO, color: 'var(--text)', lineHeight: 1.1 }}>{s.value}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s.sub}</span>
          </button>
        ))}
      </div>

      <div style={grid(290)}>
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
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: '#1F5E5B' }} />ตรงเวลา</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: '#D97A5E' }} />ล่าช้า/ค้าง</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 8, alignItems: 'end' }}>
            {V.week7.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, fontFamily: MONO, color: 'var(--muted)' }}>{d.pctText}</span>
                <div style={{ width: '100%', maxWidth: 26, height: 104, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
                  <div style={{ height: d.lateH, background: '#D97A5E', borderRadius: 3 }} />
                  <div style={{ height: d.doneH, background: '#1F5E5B', borderRadius: 3 }} />
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
          {V.noProactive && <div style={{ ...muted, padding: '12px 0' }}>ไม่มีงานที่ต้องจับตาในตอนนี้</div>}
        </Stack>
      </div>

      <Stack gap={10} style={{ ...card, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={cardTitle}>ตารางวันนี้</div>
          <button onClick={V.goCal} style={linkBtn}>ดูปฏิทิน →</button>
        </div>
        {V.todayTasks.map((t) => <TaskRow key={t.id} t={t} />)}
        {V.todayEmpty && <div style={{ ...muted, padding: '16px 0' }}>ไม่มีงานวันนี้</div>}
      </Stack>
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
      {V.listEmpty && <div style={{ background: 'var(--surface)', border: '1px dashed var(--border2)', borderRadius: 12, padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>ไม่พบงานตามเงื่อนไข</div>}
    </Stack>
  );
}

function TaskTip({ tip }) {
  const { t, ghost, x, y } = tip;
  const W = 300;
  const left = Math.max(8, Math.min(x + 14, window.innerWidth - W - 8));
  const top = y + 200 > window.innerHeight ? Math.max(8, y - 190) : y + 16;
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
    <div style={{ position: 'fixed', left, top, width: W, zIndex: 60, pointerEvents: 'none', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `4px solid ${t.priC}`, borderRadius: 10, boxShadow: '0 14px 34px rgba(22,48,46,0.22)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
    onMouseEnter: (e) => setTip({ t: { ...t, isMeetingTip: t.type === 'ประชุม' && !!t.location }, ghost, x: e.clientX, y: e.clientY }),
    onMouseMove: (e) => setTip((p) => p && { ...p, x: e.clientX, y: e.clientY }),
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
            {V.selDayEmpty && <div style={{ ...muted, padding: '8px 0' }}>ไม่มีงานในวันนี้</div>}
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
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: '#16302E', color: '#E7EFEC', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 600, flex: 'none' }}>{m.short}</span>
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
                <div style={{ height: '100%', width: m.pctW, background: '#1F5E5B', borderRadius: 99 }} />
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
        {V.teamOverdueEmpty && <div style={{ ...muted, padding: '8px 0' }}>ไม่มีงานค้าง</div>}
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
        <button data-noprint="1" onClick={V.exportPdf} style={{ height: 36, border: 'none', borderRadius: 9, background: '#1F5E5B', color: '#fff', padding: '0 14px', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 13.5h11" /></svg>Export PDF
        </button>
        <button data-noprint="1" onClick={V.exportXlsx} style={{ height: 36, border: '1px solid #1F5E5B', borderRadius: 9, background: 'var(--surface)', color: '#1F5E5B', padding: '0 14px', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
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
                <span style={{ width: 34, height: 34, flex: 'none', borderRadius: '50%', background: '#16302E', color: '#E7EFEC', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>{r.short}</span>
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
  { k: 'appearance', title: 'ธีมหน้าจอ', sub: 'สว่าง · มืด · ตามอุปกรณ์', icon: 'M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  { k: 'calendar', title: 'ปฏิทินภายนอก', sub: 'Google Calendar · Outlook', icon: 'M2 3h12v11H2zM2 6.5h12M5 1.5v3M11 1.5v3', tasks: true },
  { k: 'digest', title: 'สรุปงานประจำวัน', sub: 'อีเมล · LINE', icon: 'M2 4h12v8H2zM2 4l6 5 6-5', tasks: true },
  { k: 'account', title: 'บัญชีของฉัน', sub: 'รหัสผ่านและการออกจากระบบ', icon: 'M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5' },
  { k: 'channels', title: 'รูปแบบการแจ้งเตือน', sub: 'เสียง · Push · Popup', icon: 'M4 11V7a4 4 0 0 1 8 0v4l1.2 1.5H2.8L4 11zM6.5 14a1.6 1.6 0 0 0 3 0', tasks: true },
  { k: 'intensity', title: 'ความเข้มของการเตือน', sub: 'ตามระดับความสำคัญของงาน', icon: 'M2 13V9M6 13V6M10 13V3M14 13V7', tasks: true },
  { k: 'timing', title: 'เวลาและการเตือนซ้ำ', sub: 'เตือนล่วงหน้า · เตือนซ้ำ', icon: 'M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM8 4.5V8l2.5 1.5', tasks: true },
  { k: 'proactive', title: 'การแจ้งเตือนเชิงรุก', sub: 'งานค้าง · งานสำคัญ · AI', icon: 'M8 1.5 9.6 6l4.4.4-3.3 3 1 4.6L8 11.7 4.3 14l1-4.6-3.3-3L6.4 6 8 1.5z', tasks: true },
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
              <button key={o.k} onClick={o.onClick} style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--surface)', color: 'var(--text)', border: o.on ? '2px solid #1F5E5B' : '2px solid var(--border)', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                  <span style={{ width: 14, height: 14, borderRadius: '50%', border: o.on ? '4px solid #1F5E5B' : '2px solid var(--border2)', flex: 'none' }} />
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
          <button onClick={V.copyFeed} style={{ height: 38, padding: '0 14px', border: 'none', borderRadius: 9, background: '#1F5E5B', color: '#fff', fontSize: 13, cursor: 'pointer' }}>คัดลอกลิงก์</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={V.downloadIcs} style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid #1F5E5B', background: 'var(--surface)', color: '#1F5E5B', fontSize: 13, cursor: 'pointer' }}>ดาวน์โหลดไฟล์ .ics</button>
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
          <button onClick={V.dg.save} disabled={V.dg.busy} style={{ padding: '9px 16px', border: 'none', borderRadius: 9, background: '#1F5E5B', color: '#fff', fontSize: 13, cursor: 'pointer', opacity: V.dg.busy ? 0.7 : 1 }}>บันทึก</button>
          <button onClick={V.dg.test} disabled={V.dg.busy} style={{ padding: '9px 16px', border: '1px solid #1F5E5B', borderRadius: 9, background: 'var(--surface)', color: '#1F5E5B', fontSize: 13, cursor: 'pointer', opacity: V.dg.busy ? 0.7 : 1 }}>บันทึกและส่งทดสอบตอนนี้</button>
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
        <button onClick={V.openPw} style={{ alignSelf: 'flex-start', padding: '8px 14px', borderRadius: 9, border: '1px solid #1F5E5B', background: 'var(--surface)', color: '#1F5E5B', fontSize: 13, cursor: 'pointer' }}>เปลี่ยนรหัสผ่าน</button>
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
        <button onClick={V.testAlert} style={{ alignSelf: 'flex-start', padding: '8px 14px', borderRadius: 9, border: 'none', background: '#1F5E5B', color: '#fff', fontSize: 13, cursor: 'pointer' }}>ทดสอบการแจ้งเตือน</button>
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
            <button key={s.k} onClick={() => V.setSettingsSec(s.k)} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', border: 'none', borderRadius: 9, padding: '10px 12px', cursor: 'pointer', background: on ? '#DCEBE7' : 'transparent', color: on ? '#16302E' : 'var(--text)', flex: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={on ? '#1F5E5B' : 'var(--muted)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}><path d={s.icon} /></svg>
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
  'logout.idle': ['ออกจากระบบอัตโนมัติ', '#9A6210'], 'password.change': ['เปลี่ยนรหัสผ่าน', '#1F5E5B'],
  'task.create': ['สร้างงาน', '#1F5E5B'], 'task.update': ['แก้ไขงาน', '#9A6210'], 'task.delete': ['ลบงาน', '#B83A32'],
  'file.upload': ['แนบไฟล์', '#1F5E5B'], 'file.download': ['ดาวน์โหลดไฟล์', 'var(--muted)'], 'file.delete': ['ลบไฟล์', '#B83A32'], 'task.cancel': ['ยกเลิกงาน', '#6B6963'], 'task.rsvp': ['ตอบรับคำเชิญ', '#1F5E5B'], 'report.export': ['ส่งออกรายงาน Excel', '#5E6966'], 'calendar.feed-regenerate': ['สร้างลิงก์ปฏิทินใหม่', '#9A6210'], 'digest.update': ['ตั้งค่าสรุปงานประจำวัน', '#5E6966'], 'digest.test': ['ทดสอบส่งสรุปงาน', '#5E6966'],
  'user.create': ['เพิ่มผู้ใช้', '#1F5E5B'], 'user.update': ['แก้ไขผู้ใช้', '#9A6210'], 'user.reset-password': ['รีเซ็ตรหัสผ่านผู้ใช้', '#B83A32'],
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
        <button type="submit" style={{ height: 38, border: 'none', borderRadius: 9, background: '#1F5E5B', color: '#fff', padding: '0 16px', fontSize: 14, cursor: 'pointer' }}>{V.auditLoading ? 'กำลังโหลด…' : 'ค้นหา / รีเฟรช'}</button>
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
