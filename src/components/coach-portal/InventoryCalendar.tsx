'use client';

// ═══ Calendario de inventario ═══
// Marcelo (2026-09-15, pedido de Daren): "un calendario donde se vea la última
// vez que se hizo inventario, que se pueda actualizar y vayan quedando las
// actualizaciones como último inventario". Cada guardado en el panel ya deja
// su registro; acá se ve por día (punto en el calendario), quién contó y qué.
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import { getInventoryHistory, getInventoryDay, type InventoryDay, type InventoryCheckRow } from '@/lib/actions/inventory';

const INK = '#10263B', SAND = '#E9E2D2', PAPER = '#F7F9FA', BORDER = '#DCD7C6', GREY = '#55666E', CYAN = '#00D2FF', DEEP = '#00A8CC';
const MONO: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 };

const fmtLong = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export function InventoryCalendar({ token, refreshKey = 0 }: { token: string | null; refreshKey?: number }) {
  const [hist, setHist] = useState<{ last: InventoryDay | null; days: InventoryDay[] } | null>(null);
  const [open, setOpen] = useState(false);
  const today = new Date();
  const [month, setMonth] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [sel, setSel] = useState<string | null>(null);
  const [rows, setRows] = useState<InventoryCheckRow[] | null>(null);

  useEffect(() => {
    getInventoryHistory(token).then((h) => {
      setHist(h);
      // Si este mes no tiene conteos, abrir en el mes del último inventario.
      if (h.last) {
        const cur = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
        if (!h.days.some((d) => d.date.startsWith(cur))) setMonth({ y: Number(h.last.date.slice(0, 4)), m: Number(h.last.date.slice(5, 7)) - 1 });
      }
    }).catch(() => setHist({ last: null, days: [] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refreshKey]);
  useEffect(() => {
    if (!sel) { setRows(null); return; }
    setRows(null);
    getInventoryDay(token, sel).then(setRows).catch(() => setRows([]));
  }, [sel, token]);

  const dayMap = new Map((hist?.days ?? []).map((d) => [d.date, d]));
  const first = new Date(month.y, month.m, 1);
  const startPad = (first.getDay() + 6) % 7; // lunes primero
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(startPad).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => `${month.y}-${String(month.m + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`)];
  const todayKey = today.toLocaleDateString('en-CA', { timeZone: 'America/El_Salvador' });

  return (
    <div className="rounded-lg p-4" style={{ background: SAND, border: `1px solid ${BORDER}` }}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p style={{ ...MONO, color: DEEP }}>Last inventory</p>
          {hist === null ? (
            <p className="text-[13px]" style={{ color: GREY }}>Loading…</p>
          ) : hist.last ? (
            <p className="text-[15px] font-bold leading-snug" style={{ color: INK }}>
              {fmtLong(hist.last.date)} <span className="font-normal" style={{ color: GREY }}>· {hist.last.items} item{hist.last.items === 1 ? '' : 's'} · {hist.last.by.join(', ') || '—'}</span>
            </p>
          ) : (
            <p className="text-[13px]" style={{ color: GREY }}>No counts logged yet. Update any item below and it becomes the last inventory.</p>
          )}
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-[5px] px-3 py-2 text-[12px] font-bold"
          style={{ background: open ? INK : CYAN, color: open ? PAPER : '#061C2B' }}>
          <CalendarCheck size={14} /> {open ? 'Close' : 'Calendar'}
        </button>
      </div>

      {open && (
        <div className="mt-3 rounded-[5px] p-3" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-2">
            <button type="button" aria-label="Previous month" onClick={() => setMonth(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))} className="p-1.5"><ChevronLeft size={16} style={{ color: INK }} /></button>
            <p className="text-[14px] font-bold" style={{ color: INK }}>{first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            <button type="button" aria-label="Next month" onClick={() => setMonth(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))} className="p-1.5"><ChevronRight size={16} style={{ color: INK }} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} style={{ ...MONO, color: GREY }}>{d}</span>)}
            {cells.map((key, i) => {
              if (!key) return <span key={`p${i}`} />;
              const d = dayMap.get(key);
              const isSel = sel === key;
              return (
                <button key={key} type="button" onClick={() => setSel(isSel ? null : key)} disabled={!d}
                  className="h-9 rounded-[5px] text-[13px] font-semibold relative disabled:opacity-40"
                  style={{ background: isSel ? INK : d ? 'rgba(0,210,255,.16)' : 'transparent', color: isSel ? PAPER : INK, border: key === todayKey ? `1px solid ${DEEP}` : '1px solid transparent' }}>
                  {Number(key.slice(-2))}
                  {d && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: isSel ? CYAN : DEEP }} />}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] mt-2" style={{ color: GREY }}>Days with a dot had an inventory count. Tap one to see what was updated and by whom.</p>

          {sel && (
            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
              <p className="text-[14px] font-bold" style={{ color: INK }}>{fmtLong(sel)}{dayMap.get(sel) ? <span className="font-normal" style={{ color: GREY }}> · {dayMap.get(sel)!.by.join(', ')}</span> : null}</p>
              {rows === null ? (
                <p className="text-[13px] mt-1" style={{ color: GREY }}>Loading…</p>
              ) : rows.length === 0 ? (
                <p className="text-[13px] mt-1" style={{ color: GREY }}>Nothing logged that day.</p>
              ) : (
                <ul className="mt-1.5 divide-y" style={{ borderColor: BORDER }}>
                  {rows.map((r) => (
                    <li key={r.id} className="py-1.5 flex items-start gap-3 text-[13px]" style={{ color: INK }}>
                      <span className="shrink-0 w-11 tabular-nums" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', color: DEEP }}>{r.time}</span>
                      <span className="min-w-0 flex-1">
                        <span className="font-bold">{r.item}</span>{r.category ? <span style={{ color: GREY }}> · {r.category}</span> : null}
                        <span className="block text-[12px]" style={{ color: GREY }}>in use {r.qty_in_use ?? '—'} · in stock {r.qty_in_stock ?? '—'}{r.note ? ` · ${r.note}` : ''}{r.by ? ` · ${r.by}` : ''}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
