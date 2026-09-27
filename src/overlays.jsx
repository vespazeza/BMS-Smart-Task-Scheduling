import React from 'react';
import { MONO, Toggle, ToggleRow, Seg, Chips, Stack, fieldStyle, btnGhost, btnPrimary } from './ui.jsx';

const lbl = { fontSize: 13, color: 'var(--muted)' };
const closeBtn = { border: 'none', background: 'var(--bg)', width: 36, height: 36, borderRadius: 8, cursor: 'pointer' };
const modal = (w) => ({ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: `min(${w}px,calc(100% - 20px))`, maxHeight: 'calc(100% - 24px)', overflow: 'auto', background: 'var(--surface)', borderRadius: 16, zIndex: 51, boxShadow: '0 30px 60px rgba(22,48,46,0.25)', display: 'flex', flexDirection: 'column' });
const scrim = { position: 'fixed', inset: 0, background: 'rgba(22,48,46,0.32)', zIndex: 50 };
const modalHead = { display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--soft)' };
const modalFoot = { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: '1px solid var(--soft)' };
const modalBody = { padding: '16px 20px', display: 'flex', flexDirection: 'column' };

export function Toasts({ V }) {
  return (
    <div data-noprint="1" style={{ position: 'fixed', bottom: V.toastBottom, right: 14, zIndex: 70, display: 'flex', flexDirection: 'column-reverse', gap: 10, width: 'min(340px,calc(100% - 28px))', maxHeight: 'calc(100% - 120px)', overflow: 'auto', pointerEvents: 'none' }}>
      {V.toasts.map((n) => (
        <div key={n.id} style={{ pointerEvents: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `4px solid ${n.c}`, borderRadius: 10, boxShadow: '0 14px 34px rgba(22,48,46,0.2)', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: n.c }}>{n.tag}</span>
            <span style={{ fontSize: 12, color: 'var(--muted2)', fontFamily: MONO }}>{n.time}</span>
            <button onClick={n.close} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted2)', fontSize: 14 }}>✕</button>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{n.task}</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{n.title} · {n.msg}</div>
          {n.hasTask && (
            <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
              <button onClick={n.start} style={{ border: 'none', background: '#1F5E5B', color: '#fff', borderRadius: 7, padding: '6px 10px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>เริ่มงาน</button>
              <button onClick={n.snooze} style={{ border: '1px solid var(--border2)', background: 'var(--surface)', borderRadius: 7, padding: '6px 10px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>เลื่อน 5 นาที</button>
              <button onClick={n.open} style={{ border: 'none', background: 'none', color: '#1F5E5B', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>รายละเอียด</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function TaskDetail({ V }) {
  const sel = V.sel;
  const rows = [
    ['วันที่', sel.dateLabel],
    ['เวลา', <span style={{ fontFamily: MONO }}>{sel.timeRange} <span style={{ fontFamily: "'IBM Plex Sans Thai'", color: 'var(--muted)' }}>({sel.durLabel})</span></span>],
    ['ผู้รับผิดชอบ', sel.assigneeName],
    ['สร้างโดย', sel.creatorName],
    ['รูปแบบงาน', sel.repeatLabel],
    ['เตือนล่วงหน้า', sel.remText],
    ['ช่องทาง', sel.chanText],
  ];
  return (
    <>
      <div data-noprint="1" onClick={V.closeSel} style={{ position: 'fixed', inset: 0, background: 'rgba(22,48,46,0.28)', zIndex: 40 }} />
      <aside data-noprint="1" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(560px,calc(100% - 20px))', maxHeight: 'calc(100% - 24px)', background: 'var(--surface)', borderRadius: 16, zIndex: 41, overflow: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 30px 60px rgba(22,48,46,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ background: 'var(--soft)', color: 'var(--text2)', padding: '2px 10px', borderRadius: 5, fontSize: 12 }}>{sel.type}</span>
          <span style={{ background: sel.priBg, color: sel.priC, padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>ความสำคัญ{sel.priLabel}</span>
          {sel.hasFlag && <span style={{ color: sel.flagC, background: sel.flagBg, padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{sel.flag}</span>}
          {sel.canEdit && !sel.hist && (
            <button onClick={V.onEdit} style={{ marginLeft: 'auto', border: '1px solid #1F5E5B', background: 'var(--surface)', color: '#1F5E5B', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>แก้ไขงาน</button>
          )}
          <button onClick={V.closeSel} style={{ ...closeBtn, marginLeft: sel.canEdit && !sel.hist ? 0 : 'auto', fontSize: 16 }}>✕</button>
        </div>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 600, lineHeight: 1.35, textWrap: 'pretty' }}>{sel.title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '104px minmax(0,1fr)', gap: '10px 12px', fontSize: 14 }}>
          {rows.map(([k, v]) => (
            <React.Fragment key={k}><span style={{ color: 'var(--muted)' }}>{k}</span><span>{v}</span></React.Fragment>
          ))}
        </div>

        {sel.shiftChips.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg2)', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ ...lbl, marginRight: 4 }}>เลื่อนงาน</span>
              <Chips items={sel.shiftChips.map((c) => ({ ...c, bg: 'var(--surface)', c: '#1F5E5B', border: '#1F5E5B' }))} pad="5px 12px" />
            </div>
            <CustomReschedule key={sel.id + sel.date + sel.start + sel.dur} sel={sel} apply={V.applyReschedule} />
          </div>
        )}

        {sel.isMeeting && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--tint)', borderRadius: 10, padding: '12px 14px', fontSize: 13 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>การประชุม · {sel.modeLabel}</span>
            {sel.hasLocation && <span><span style={{ color: 'var(--muted)' }}>สถานที่ </span>{sel.location}</span>}
            <span><span style={{ color: 'var(--muted)' }}>ผู้เข้าร่วม </span>{sel.attText}</span>
            {sel.rsvpList.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ color: 'var(--muted)' }}>การตอบรับ</span>
                {sel.rsvpList.map((a, i) => (
                  <span key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500 }}>{a.name}</span>
                    <span style={{ fontSize: 12, padding: '1px 8px', borderRadius: 99, background: a.status === 'accepted' ? '#DDF0E1' : a.status === 'declined' ? '#E4E3E0' : '#FBF0C3', color: a.status === 'accepted' ? '#2E7040' : a.status === 'declined' ? '#6B6963' : '#8A6500' }}>{a.status === 'accepted' ? 'ตอบรับ' : a.status === 'declined' ? 'ปฏิเสธ' : 'รอตอบรับ'}</span>
                    {a.reason && <span style={{ fontSize: 12, color: 'var(--muted)' }}>({a.reason})</span>}
                  </span>
                ))}
              </div>
            )}
            {sel.isInvitee && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' }}>
                <span style={{ fontWeight: 600 }}>คุณได้รับเชิญเข้าร่วมประชุมนี้ — {sel.myRsvp === 'accepted' ? 'คุณตอบรับแล้ว' : sel.myRsvp === 'declined' ? 'คุณปฏิเสธแล้ว' : 'กรุณาตอบรับหรือปฏิเสธ'}</span>
                <input value={V.rsvpReason} onChange={V.onRsvpReason} placeholder="เหตุผล (ถ้าปฏิเสธ — ไม่บังคับ)" style={{ border: '1px solid var(--border2)', borderRadius: 9, padding: '8px 10px', fontSize: 13, background: 'var(--surface)', color: 'var(--text)' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => V.onRsvp('accepted')} style={{ border: 'none', background: sel.myRsvp === 'accepted' ? '#2E7040' : '#1F5E5B', color: '#fff', borderRadius: 9, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}>✓ ตอบรับ</button>
                  <button onClick={() => V.onRsvp('declined')} style={{ border: '1px solid #6B6963', background: sel.myRsvp === 'declined' ? '#E4E3E0' : 'var(--surface)', color: '#4E4C47', borderRadius: 9, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}>✕ ปฏิเสธ</button>
                </div>
              </div>
            )}
            {sel.hasLink && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                <a className="join-link" href={sel.link} target="_blank" rel="noopener noreferrer" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, background: '#2D8CFF', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 500 }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="1.5" y="4" width="9" height="8" rx="1.5" /><path d="m10.5 7 4-2.5v7l-4-2.5" /></svg>เข้าร่วมประชุมออนไลน์
                </a>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: 'var(--muted)', overflowWrap: 'anywhere' }}>{sel.link}</span>
              </div>
            )}
          </div>
        )}

        {sel.readOnly && sel.roText && <div style={{ fontSize: 13, color: 'var(--muted)', background: 'var(--bg2)', borderRadius: 9, padding: '10px 12px' }}>{sel.roText}</div>}

        {sel.canEdit && (
          <Stack gap={8}>
            <span style={lbl}>อัปเดตสถานะ</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
              {V.statusOpts.map((o) => (
                <button key={o.label} onClick={o.onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 12px', minHeight: 48, borderRadius: 10, border: `1.5px solid ${o.border}`, background: o.bg, color: o.c, cursor: 'pointer', fontSize: 14, textAlign: 'left' }}>
                  <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>{o.g}</span>
                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 500 }}>{o.label}</span>
                    <span style={{ fontSize: 11, opacity: 0.8 }}>{o.en}</span>
                  </span>
                </button>
              ))}
            </div>
          </Stack>
        )}

        {V.cancelAsk && V.cancelAsk.id === sel.id && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: '#F1F0ED', border: '1px solid #C9C7C1', borderRadius: 12, padding: '12px 14px' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#4E4C47' }}>ยกเลิกงานนี้ — ระบุเหตุผล</span>
            <textarea autoFocus value={V.cancelAsk.reason} onChange={V.onCancelReason} rows={3} placeholder="เช่น ผู้บริหารติดภารกิจ / เลื่อนตามหนังสือเชิญใหม่" style={{ border: `1px solid ${V.cancelAsk.err ? '#B83A32' : '#C9C7C1'}`, borderRadius: 9, padding: '8px 10px', fontSize: 14, resize: 'vertical', outline: 'none', background: 'var(--surface)' }} />
            {V.cancelAsk.err && <span style={{ fontSize: 12, color: '#B83A32' }}>{V.cancelAsk.err}</span>}
            <span style={{ fontSize: 12, color: '#6B6963' }}>เหตุผลและประวัติการยกเลิกจะถูกเก็บไว้ในระบบและ audit log</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={V.confirmCancel} style={{ border: 'none', background: '#6B6963', color: '#fff', borderRadius: 9, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>ยืนยันยกเลิกงาน</button>
              <button onClick={V.closeCancel} style={{ ...btnGhost, padding: '8px 14px', fontSize: 13 }}>ไม่ยกเลิก</button>
            </div>
          </div>
        )}
        {sel.cancelInfo && (
          <div style={{ background: '#ECEBE8', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#4E4C47' }}>
            <b>ยกเลิกแล้ว</b> — เหตุผล: {sel.cancelInfo}
          </div>
        )}
        {sel.cancelHistory.length > 0 && (
          <Stack gap={4}>
            <span style={lbl}>ประวัติการยกเลิก</span>
            {sel.cancelHistory.map((c, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text2)', borderLeft: '3px solid #9A9892', paddingLeft: 8 }}>
                {c.atText} · {c.byName || '—'} · {c.reason}
              </div>
            ))}
          </Stack>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8, background: 'var(--bg2)', borderRadius: 10, padding: 12 }}>
          {[['เริ่ม (อัตโนมัติ)', sel.startedText], ['เสร็จ (อัตโนมัติ)', sel.doneText], ['ใช้เวลา', sel.spentText]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{l}</span>
              <span style={{ fontFamily: MONO, fontSize: 16 }}>{v}</span>
            </div>
          ))}
        </div>

        <Stack gap={8}>
          <span style={lbl}>ไฟล์แนบผลงาน{sel.files.length ? ` · ${sel.files.length} ไฟล์` : ''}</span>
          {sel.files.map((f) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--border)', borderRadius: 9, padding: '8px 10px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--muted)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}><path d="M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3" /></svg>
              <button onClick={f.onDownload} title="ดาวน์โหลด" style={{ flex: 1, minWidth: 0, textAlign: 'left', border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 13, color: '#1F5E5B', overflowWrap: 'anywhere' }}>{f.name}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{f.sizeText} · {f.byName} · {f.atText}</span>
              </button>
              {sel.canEdit && <button onClick={f.onRemove} title="ลบไฟล์" style={{ border: 'none', background: 'none', color: '#B83A32', cursor: 'pointer', fontSize: 13 }}>ลบ</button>}
            </div>
          ))}
          {!sel.files.length && !sel.canEdit && <span style={{ fontSize: 13, color: 'var(--muted)' }}>ไม่มีไฟล์แนบ</span>}
          {sel.canEdit && (
            <label style={{ alignSelf: 'flex-start', border: '1px dashed #1F5E5B', color: '#1F5E5B', borderRadius: 9, padding: '8px 14px', fontSize: 13, cursor: V.uploading ? 'wait' : 'pointer', opacity: V.uploading ? 0.6 : 1 }}>
              {V.uploading ? 'กำลังอัปโหลด…' : '+ แนบไฟล์ (สูงสุด 15 MB ต่อไฟล์)'}
              <input type="file" multiple disabled={V.uploading} onChange={V.onUpload} style={{ display: 'none' }} />
            </label>
          )}
        </Stack>

        <Stack gap={8}>
          <span style={lbl}>หมายเหตุ / ผลลัพธ์งาน</span>
          <textarea value={sel.note} onChange={V.onNote} readOnly={sel.readOnly} rows={5} placeholder="บันทึกผลการดำเนินงาน เช่น ส่งเอกสารแล้ว เลขที่รับ 123/2569" style={{ border: '1px solid var(--border2)', borderRadius: 10, padding: '10px 12px', fontSize: 14, resize: 'vertical', outline: 'none', color: 'var(--text)', background: sel.noteBg }} />
        </Stack>
        {sel.canEdit && <button onClick={V.onDelete} style={{ alignSelf: 'flex-start', border: 'none', background: 'none', color: '#B83A32', fontSize: 13, cursor: 'pointer', padding: 0 }}>ลบงานนี้</button>}
      </aside>
    </>
  );
}

const Field = ({ label, children, gap = 6 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap }}>
    <span style={lbl}>{label}</span>
    {children}
  </div>
);
const dateField = { border: '1px solid var(--border2)', borderRadius: 9, padding: '9px 10px', fontSize: 14 };

export function CreateTask({ V }) {
  const f = V.form;
  return (
    <>
      <div data-noprint="1" onClick={V.closeCreate} style={scrim} />
      <div data-noprint="1" style={modal(640)}>
        <div style={modalHead}>
          <span style={{ fontSize: 18, fontWeight: 600, marginRight: 'auto' }}>{V.isEditing ? 'แก้ไขงาน / กิจกรรม' : 'สร้างงาน / กิจกรรมใหม่'}</span>
          <button onClick={V.closeCreate} style={closeBtn}>✕</button>
        </div>
        <div style={{ ...modalBody, gap: 16 }}>
          <Field label="ชื่องาน">
            <input value={f.title} onChange={V.onFTitle} placeholder="เช่น ตรวจสอบเอกสารเบิกจ่าย" style={{ border: `1px solid ${V.formErrBorder}`, borderRadius: 9, padding: '10px 12px', fontSize: 15, outline: 'none', color: 'var(--text)' }} />
          </Field>
          {V.canAssign && (
            <Field label="สร้างในตารางของ">
              <Seg items={V.fUserChips} pad="8px" grow />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>เลขานุการจัดการตารางผู้บริหารได้ ผู้ใช้อื่นสร้างได้เฉพาะตารางของตนเอง</span>
            </Field>
          )}
          {V.noMgr && (
            <div style={{ fontSize: 13, color: '#9A6210', background: '#FAF0DC', borderRadius: 9, padding: '10px 12px' }}>
              ยังไม่ได้รับมอบหมายให้ดูแลตารางผู้บริหาร จึงลงนัดได้เฉพาะตารางของตนเอง — ให้ผู้ดูแลระบบเปิด "จัดการผู้ใช้" → แก้ไขบัญชีของคุณ → เลือก "ผู้บริหารที่ดูแล" (ต้องมีบัญชีบทบาทผู้บริหารในระบบก่อน)
            </div>
          )}
          <Field label="ประเภทงาน"><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><Chips items={V.fTypeChips} /></div></Field>

          {V.isMeeting && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--tint)', borderRadius: 12, padding: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>รายละเอียดการประชุม</span>
              <Field label="รูปแบบการประชุม"><Seg items={V.fModeChips} track="var(--tint2)" pad="8px 4px" grow nowrap /></Field>
              {V.showLocation && (
                <Field label="สถานที่ / ห้องประชุม">
                  <input value={f.location} onChange={V.onFLocation} placeholder="เช่น ห้องประชุม 1 ชั้น 3" style={fieldStyle} />
                </Field>
              )}
              {V.showLink && (
                <Field label="ลิงก์ประชุมออนไลน์ (Zoom / Google Meet / Teams)">
                  <input type="url" value={f.link} onChange={V.onFLink} placeholder="https://zoom.us/j/..." style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono',monospace", fontSize: 13 }} />
                  {V.linkWarn && <span style={{ fontSize: 12, color: '#B83A32' }}>ลิงก์ควรขึ้นต้นด้วย https://</span>}
                </Field>
              )}
              <Field label={`ผู้เข้าร่วมประชุม · ${V.attCount} คน`}>
                <div style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', border: '1px solid var(--border2)', borderRadius: 9, padding: '6px 8px', background: 'var(--surface)', minHeight: 46 }}>
                    {V.attTokens.map((p, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: p.bg, color: p.c, borderRadius: 99, padding: '4px 6px 4px 11px', fontSize: 13, whiteSpace: 'nowrap' }}>
                        {p.label}
                        <button className="tok-x" onClick={p.onRemove} title="นำออก" style={{ border: 'none', background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: 13, lineHeight: 1, width: 20, height: 20, borderRadius: '50%', padding: 0 }}>✕</button>
                      </span>
                    ))}
                    <input value={V.attQ} onChange={V.onAttQ} onKeyDown={V.onAttKey} onFocus={V.onAttFocus} onBlur={V.onAttBlur} placeholder="พิมพ์ชื่อผู้เข้าร่วม แล้วกด Enter" style={{ flex: 1, minWidth: 150, border: 'none', outline: 'none', fontSize: 14, padding: '5px 4px', background: 'transparent', color: 'var(--text)' }} />
                  </div>
                  {V.hasAttSuggest && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 14px 30px rgba(22,48,46,0.16)', maxHeight: 220, overflow: 'auto', zIndex: 5, padding: 4 }}>
                      {V.attSuggest.map((o, i) => (
                        <button key={i} className="sug" onMouseDown={o.onPick} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '9px 10px', border: 'none', borderRadius: 7, background: 'var(--surface)', textAlign: 'left', cursor: 'pointer', fontSize: 14, color: 'var(--text)' }}>
                          <span style={{ fontWeight: o.w }}>{o.label}</span>
                          <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{o.sub}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>เลือกจากรายชื่อในระบบ หรือพิมพ์ชื่อใหม่ ชื่อที่เพิ่มจะถูกเก็บไว้ในรายการให้เลือกครั้งต่อไป</span>
              </Field>
            </div>
          )}

          <Field label="ความสำคัญ">
            <div style={{ display: 'flex', gap: 6 }}>
              {V.fPriChips.map((c, i) => (
                <button key={i} onClick={c.onClick} style={{ flex: 1, padding: '9px 8px', borderRadius: 9, border: `1.5px solid ${c.border}`, background: c.bg, color: c.c, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>{c.label}</button>
              ))}
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
            <Field label="วันที่"><input type="date" value={f.date} onChange={V.onFDate} style={dateField} /></Field>
            <Field label="เวลาเริ่ม"><input type="time" value={f.start} onChange={V.onFStart} style={dateField} /></Field>
            <Field label="ระยะเวลา">
              <select value={f.dur} onChange={V.onFDur} style={{ ...dateField, background: 'var(--surface)' }}>
                <option value="15">15 นาที</option><option value="30">30 นาที</option><option value="45">45 นาที</option>
                <option value="60">1 ชม.</option><option value="90">1 ชม. 30 น.</option><option value="120">2 ชม.</option><option value="180">3 ชม.</option>
                {V.fDurCustom && <option value={f.dur}>{V.fDurCustom}</option>}
              </select>
            </Field>
          </div>

          {V.isEditing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'var(--bg2)', borderRadius: 12, padding: '12px 14px' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>เลื่อนตารางงาน</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><Chips items={V.fShiftChips} /></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13, background: V.shiftChanged ? 'var(--tint)' : 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 10px' }}>
                <span style={{ color: 'var(--muted)' }}>เดิม {V.shiftFrom}</span><span>→</span>
                <span style={{ fontWeight: 600, color: V.shiftChanged ? '#1F5E5B' : 'var(--text)' }}>{V.shiftChanged ? 'ใหม่' : 'ยังไม่เปลี่ยน'} {V.shiftChanged ? V.shiftTo : ''}</span>
                {V.shiftChanged && <button type="button" onClick={V.resetShift} style={{ marginLeft: 'auto', border: 'none', background: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>คืนค่าเดิม</button>}
              </div>
              <span style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>หรือกำหนดเอง</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 10 }}>
                <Field label="เลื่อนไปวันที่"><input type="date" value={f.date} onChange={V.onFDate} style={dateField} /></Field>
                <Field label="เวลาเริ่ม"><input type="time" value={f.start} onChange={V.onFStart} style={dateField} /></Field>
                <Field label="เวลาสิ้นสุด"><input type="time" value={V.fEnd} onChange={V.onFEnd} style={{ ...dateField, borderColor: V.endErr ? '#B83A32' : 'var(--border2)' }} /></Field>
              </div>
              {V.endErr && <span style={{ fontSize: 12, color: '#B83A32' }}>เวลาสิ้นสุดต้องหลังเวลาเริ่มอย่างน้อย 5 นาที</span>}
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>เลือกวัน/เวลาเอง หรือกดปุ่มด้านบนเพื่อเลื่อน (กดซ้ำเพื่อเลื่อนต่อ) แล้วกด "บันทึกการแก้ไข"</span>
            </div>
          )}

          {V.conflictLines.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#FAE8E5', border: '1px solid #E8B4AE', borderRadius: 10, padding: '10px 12px' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#B83A32' }}>⚠ เวลานี้ชนกับงานอื่น</span>
              {V.conflictLines.map((t, i) => <span key={i} style={{ fontSize: 13, color: '#7A2A24' }}>• {t}</span>)}
              <span style={{ fontSize: 12, color: '#7A2A24' }}>ยังบันทึกได้ ระบบจะถามยืนยันอีกครั้งก่อนบันทึก</span>
            </div>
          )}

          {V.hasSuggest && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--tint)', borderRadius: 10, padding: '10px 12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1F5E5B', background: 'var(--surface)', borderRadius: 5, padding: '2px 7px' }}>AI</span>
              <span style={{ fontSize: 13, color: 'var(--text)', flex: 1, minWidth: 160 }}>{V.suggestText}</span>
              <button onClick={V.applySuggest} style={{ border: '1px solid #1F5E5B', background: 'var(--surface)', color: '#1F5E5B', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>ใช้เวลานี้</button>
            </div>
          )}

          <Field label="รูปแบบงาน"><Seg items={V.fRepChips} pad="8px 4px" grow /></Field>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg2)', borderRadius: 12, padding: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>การแจ้งเตือนของงานนี้</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ ...lbl, width: 72 }}>เตือนก่อน</span><Chips items={V.fRemChips} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ ...lbl, width: 72 }}>ช่องทาง</span><Chips items={V.fChanChips} />
            </div>
            {V.fRenag.map((x, i) => <ToggleRow key={i} x={x} compact />)}
          </div>
        </div>
        <div style={modalFoot}>
          <button onClick={V.closeCreate} style={btnGhost}>ยกเลิก</button>
          <button onClick={V.saveTask} disabled={V.formBusy} style={{ ...btnPrimary, opacity: V.formBusy ? 0.7 : 1 }}>{V.formBusy ? 'กำลังบันทึก…' : V.isEditing ? 'บันทึกการแก้ไข' : 'บันทึกงาน'}</button>
        </div>
      </div>
    </>
  );
}

const uInput = { height: 42, border: '1px solid var(--border2)', borderRadius: 9, padding: '0 12px', fontSize: 15, outline: 'none', color: 'var(--text)', background: 'var(--surface)', width: '100%' };

export function UserForm({ V }) {
  const uf = V.uf;
  return (
    <>
      <div data-noprint="1" onClick={V.closeUserForm} style={scrim} />
      <div data-noprint="1" style={modal(560)}>
        <div style={modalHead}>
          <span style={{ fontSize: 18, fontWeight: 600, marginRight: 'auto' }}>{uf.titleText}</span>
          <button onClick={V.closeUserForm} style={closeBtn}>✕</button>
        </div>
        <div style={{ ...modalBody, gap: 14 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>ชื่อ-นามสกุล</span><input value={uf.name} onChange={V.onUfName} placeholder="เช่น คุณมานี รักงาน" style={uInput} /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>ตำแหน่ง</span><input value={uf.role} onChange={V.onUfTitle} placeholder="เช่น เลขานุการผู้อำนวยการ" style={uInput} /></label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>ชื่อผู้ใช้ (สำหรับเข้าสู่ระบบ)</span><input value={uf.username} onChange={V.onUfUser} placeholder="เช่น manee" style={{ ...uInput, fontFamily: MONO }} /></label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ ...lbl, display: 'flex', justifyContent: 'space-between' }}>รหัสผ่านชั่วคราว<button type="button" onClick={V.genPw} style={{ border: 'none', background: 'none', color: '#1F5E5B', fontSize: 12, cursor: 'pointer', padding: 0 }}>สุ่มรหัสผ่าน</button></span><input value={uf.pw} onChange={V.onUfPw} placeholder={uf.pwPh} autoComplete="off" style={{ ...uInput, fontFamily: MONO }} /></label>
          </div>
          <Field label="บทบาท (Role)">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><Chips items={V.rkChips} pad="7px 13px" /></div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{uf.rkDesc}</span>
          </Field>
          {V.ufIsSec && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--bg2)', borderRadius: 10, padding: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>ผู้บริหารที่ดูแล</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>เลขาจะลงนัด แก้ไขตาราง และรับการแจ้งเตือนแทนผู้บริหารที่เลือกได้</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><Chips items={V.execChips} /></div>
              {V.noExecs && <span style={{ fontSize: 12, color: 'var(--muted)' }}>ยังไม่มีบัญชีบทบาทผู้บริหาร</span>}
            </div>
          )}
          {V.ufActive.map((x, i) => <ToggleRow key={i} x={x} />)}
          {V.ufHasErr && <div style={{ fontSize: 13, color: '#B83A32', background: '#FAE8E5', borderRadius: 8, padding: '8px 12px' }}>{V.ufErr}</div>}
        </div>
        <div style={modalFoot}>
          <button onClick={V.closeUserForm} style={btnGhost}>ยกเลิก</button>
          <button onClick={V.saveUser} disabled={uf.busy} style={{ ...btnPrimary, opacity: uf.busy ? 0.7 : 1 }}>{uf.busy ? 'กำลังบันทึก…' : 'บันทึก'}</button>
        </div>
      </div>
    </>
  );
}

const pwInput = { height: 42, border: '1px solid var(--border2)', borderRadius: 9, padding: '0 12px', fontSize: 15, outline: 'none', color: 'var(--text)', background: 'var(--surface)', width: '100%' };

export function ChangePassword({ V }) {
  const p = V.pw;
  const submit = (e) => { e.preventDefault(); V.savePw(); };
  return (
    <>
      <div data-noprint="1" onClick={p.forced ? undefined : V.closePw} style={{ ...scrim, zIndex: 95, background: p.forced ? 'rgba(22,48,46,0.72)' : scrim.background }} />
      <form data-noprint="1" onSubmit={submit} style={{ ...modal(440), zIndex: 96 }}>
        <div style={modalHead}>
          <span style={{ fontSize: 18, fontWeight: 600, marginRight: 'auto' }}>{p.forced ? 'ตั้งรหัสผ่านใหม่ก่อนใช้งาน' : 'เปลี่ยนรหัสผ่าน'}</span>
          {!p.forced && <button type="button" onClick={V.closePw} style={closeBtn}>✕</button>}
        </div>
        <div style={{ ...modalBody, gap: 14 }}>
          {p.forced && <div style={{ fontSize: 13, color: '#9A6210', background: '#FAF0DC', borderRadius: 9, padding: '10px 12px' }}>บัญชีนี้ใช้รหัสผ่านชั่วคราว กรุณาตั้งรหัสผ่านของคุณเองก่อนเริ่มใช้งาน</div>}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>{p.forced ? 'รหัสผ่านชั่วคราวปัจจุบัน' : 'รหัสผ่านปัจจุบัน'}</span><input type="password" autoComplete="current-password" value={p.cur} onChange={V.onPwCur} autoFocus style={pwInput} /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>รหัสผ่านใหม่</span><input type="password" autoComplete="new-password" value={p.next} onChange={V.onPwNext} style={pwInput} /><span style={{ fontSize: 12, color: 'var(--muted)' }}>อย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวอักษรและตัวเลข</span></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={lbl}>ยืนยันรหัสผ่านใหม่</span><input type="password" autoComplete="new-password" value={p.next2} onChange={V.onPwNext2} style={pwInput} /></label>
          {p.err && <div style={{ fontSize: 13, color: '#B83A32', background: '#FAE8E5', borderRadius: 8, padding: '8px 12px' }}>{p.err}</div>}
        </div>
        <div style={modalFoot}>
          {p.forced ? <button type="button" onClick={V.logout} style={btnGhost}>ออกจากระบบ</button> : <button type="button" onClick={V.closePw} style={btnGhost}>ยกเลิก</button>}
          <button type="submit" disabled={p.busy} style={{ ...btnPrimary, opacity: p.busy ? 0.7 : 1 }}>{p.busy ? 'กำลังบันทึก…' : 'บันทึกรหัสผ่าน'}</button>
        </div>
      </form>
    </>
  );
}

/** manual reschedule: pick the new date + start/end time for a task from its detail dialog */
function CustomReschedule({ sel, apply }) {
  const endOf = (start, dur) => { const m = Number(start.slice(0, 2)) * 60 + Number(start.slice(3)) + dur; return String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const [open, setOpen] = React.useState(false);
  const [v, setV] = React.useState({ date: sel.date, start: sel.start, end: endOf(sel.start, sel.dur) });
  const [err, setErr] = React.useState('');
  const set = (p) => { setV((o) => ({ ...o, ...p })); setErr(''); };
  const inp = { border: '1px solid var(--border2)', borderRadius: 9, padding: '8px 10px', fontSize: 14, width: '100%', background: 'var(--surface)' };
  if (!open) return <button onClick={() => setOpen(true)} style={{ alignSelf: 'flex-start', border: 'none', background: 'none', color: '#1F5E5B', fontSize: 13, cursor: 'pointer', padding: 0 }}>กำหนดวันที่/เวลาเอง…</button>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)' }}>วันที่ใหม่</span><input type="date" value={v.date} onChange={(e) => set({ date: e.target.value })} style={inp} /></label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)' }}>เวลาเริ่ม</span><input type="time" value={v.start} onChange={(e) => set({ start: e.target.value })} style={inp} /></label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontSize: 12, color: 'var(--muted)' }}>เวลาสิ้นสุด</span><input type="time" value={v.end} onChange={(e) => set({ end: e.target.value })} style={inp} /></label>
      </div>
      {err && <span style={{ fontSize: 12, color: '#B83A32' }}>{err}</span>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => { const m = apply(sel.id, v); if (m) setErr(m); }} style={{ ...btnPrimary, padding: '7px 16px', fontSize: 13 }}>เลื่อนงาน</button>
        <button onClick={() => setOpen(false)} style={{ ...btnGhost, padding: '7px 14px', fontSize: 13 }}>ยกเลิก</button>
      </div>
    </div>
  );
}
