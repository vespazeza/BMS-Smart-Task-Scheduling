import React from 'react';

export const MONO = "'IBM Plex Mono'";

export const card = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
};

export function Toggle({ x }) {
  return (
    <button
      onClick={x.onClick}
      style={{ width: 40, height: 24, borderRadius: 99, border: 'none', background: x.trackBg, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flex: 'none' }}
    >
      <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', marginLeft: x.knobL, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

/** label + description on the left, switch on the right */
export function ToggleRow({ x, compact }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {compact ? (
        <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{x.label}</span>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>{x.label}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{x.desc}</span>
        </div>
      )}
      <Toggle x={x} />
    </div>
  );
}

/** segmented control: items are {label,onClick,bg,c,sh} */
export function Seg({ items, track = 'var(--track)', pad = '6px 11px', grow, nowrap, style }) {
  return (
    <div style={{ display: 'flex', background: track, borderRadius: 9, padding: 3, gap: 2, ...style }}>
      {items.map((o, i) => (
        <button
          key={i}
          onClick={o.onClick}
          style={{ flex: grow ? 1 : undefined, border: 'none', borderRadius: 7, padding: pad, fontSize: 13, cursor: 'pointer', background: o.bg, color: o.c, boxShadow: o.sh, whiteSpace: nowrap ? 'nowrap' : undefined }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** pill chips: items are {label,onClick,bg,c,border} */
export function Chips({ items, pad = '6px 12px', radius = 99 }) {
  return (
    <>
      {items.map((c, i) => (
        <button
          key={i}
          onClick={c.onClick}
          style={{ padding: pad, borderRadius: radius, border: `1px solid ${c.border}`, background: c.bg, color: c.c, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flex: 'none' }}
        >
          {c.label}
        </button>
      ))}
    </>
  );
}

export function Kpi({ s, size = 28, pad = '14px 16px' }) {
  return (
    <div style={{ ...card, padding: pad, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{s.label}</span>
      <span style={{ fontSize: size, fontWeight: 500, fontFamily: MONO, color: s.c, lineHeight: 1.1 }}>{s.value}</span>
    </div>
  );
}

export function Bar({ r, labelW }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `${labelW}px minmax(0,1fr) 88px`, gap: 10, alignItems: 'center', fontSize: 13 }}>
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</span>
      <div style={{ height: 10, background: 'var(--track)', borderRadius: 99, overflow: 'hidden', display: 'flex' }}>
        <div style={{ width: r.doneW, background: '#1F5E5B' }} />
        <div style={{ width: r.lateW, background: '#D97A5E' }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--muted)', textAlign: 'right' }}>
        {r.done}/{r.total} · {r.pct}%
      </span>
    </div>
  );
}

/** one schedule row, shared by dashboard / list / calendar / team views */
export function TaskRow({ t }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: t.rowCols, gap: '8px 14px', alignItems: 'center', padding: '12px 14px', borderRadius: 10, background: t.rowBg, border: '1px solid var(--border)' }}>
      <div style={{ fontFamily: MONO, fontSize: 14, color: 'var(--text)', display: 'flex', flexDirection: 'column', gridRow: t.spanRow, alignSelf: 'start' }}>
        <span>{t.start}</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.durLabel}</span>
      </div>
      <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, background: t.priC, gridRow: t.spanRow }} />
      <button onClick={t.open} style={{ border: 'none', background: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, font: 'inherit' }}>
        <span style={{ fontSize: 15, fontWeight: 500, textDecoration: t.deco, color: t.titleC, textWrap: 'pretty' }}>{t.title}</span>
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px', alignItems: 'center', fontSize: 12, color: 'var(--muted)' }}>
          <span style={{ background: 'var(--soft)', color: 'var(--text2)', padding: '1px 8px', borderRadius: 5 }}>{t.type}</span>
          <span style={{ color: t.priC, fontWeight: 600 }}>{t.priLabel}</span>
          {t.hasRepeat && <span>↻ {t.repeatLabel}</span>}
          {t.showAssignee && <span>{t.assigneeName}</span>}
          {t.hasFlag && <span style={{ color: t.flagC, background: t.flagBg, padding: '1px 8px', borderRadius: 99, fontWeight: 600 }}>{t.flag}</span>}
          {t.hasNote && <span>· มีบันทึก</span>}
          {t.cancelNote && <span style={{ color: '#6B6963' }}>{t.cancelNote}</span>}
        </span>
      </button>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: t.actJust, gridColumn: t.actCol }}>
        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: t.statusBg, color: t.statusC, whiteSpace: 'nowrap' }}>
          {t.statusG} {t.statusLabel}
        </span>
        {t.hasNext && (
          <button onClick={t.onNext} style={{ border: '1px solid #1F5E5B', background: t.nextBg, color: t.nextC, borderRadius: 8, padding: '5px 12px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
            {t.nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function Stack({ gap = 12, children, style }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>;
}

export const selectStyle = { height: 38, border: '1px solid var(--border2)', borderRadius: 9, padding: '0 10px', fontSize: 14, background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', width: '100%' };
export const fieldStyle = { border: '1px solid var(--border2)', borderRadius: 9, padding: '10px 12px', fontSize: 14, outline: 'none', color: 'var(--text)', background: 'var(--surface)', width: '100%' };
export const btnGhost = { border: '1px solid var(--border2)', background: 'var(--surface)', borderRadius: 9, padding: '10px 16px', fontSize: 14, cursor: 'pointer' };
export const btnPrimary = { border: 'none', background: '#1F5E5B', color: '#fff', borderRadius: 9, padding: '10px 18px', fontSize: 14, fontWeight: 500, cursor: 'pointer' };
