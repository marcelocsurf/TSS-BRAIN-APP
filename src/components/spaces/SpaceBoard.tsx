'use client';

import { useState, useTransition } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  listBookingsForDay,
  createBooking,
  cancelBooking,
  type AcademySpace,
  type SpaceBooking,
} from '@/lib/actions/spaces';

// Resource day-grid: rows = hours, columns = spaces. Booked blocks are coloured
// and positioned by time; empty cells are tappable to book. Same layout on
// desktop (all columns fit) and mobile (scrolls sideways, hours stay pinned).

const START_HOUR = 6;
const END_HOUR = 21;
const ROW_H = 46; // px per hour
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayIso() {
  const now = new Date();
  const es = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  return es.toISOString().slice(0, 10);
}
function pad(n: number) { return String(n).padStart(2, '0'); }
function hourLabel(h: number) { return `${((h + 11) % 12) + 1}${h < 12 ? 'a' : 'p'}`; }
// Local (El Salvador) hour-of-day as a float, from a stored timestamptz.
function esHourFloat(ts: string) {
  const s = new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', timeZone: 'America/El_Salvador' });
  const [h, m] = s.split(':').map(Number);
  return h + m / 60;
}
function hhmm(ts: string) {
  return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/El_Salvador' });
}
// Compact time parts (El Salvador) for a Google-Calendar-style range label.
function esParts(ts: string) {
  const s = new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/El_Salvador' });
  const m = s.match(/(\d+):(\d+)\s*(AM|PM)/i);
  return m ? { hm: m[2] === '00' ? m[1] : `${m[1]}:${m[2]}`, ap: m[3].toLowerCase() } : { hm: s, ap: '' };
}
// "7–9am" · "7:30–9am" · "11am–1pm" — meridiem shown once when it matches.
function rangeLabel(startTs: string, endTs: string) {
  const a = esParts(startTs), b = esParts(endTs);
  const start = a.ap === b.ap ? a.hm : `${a.hm}${a.ap}`;
  return `${start}–${b.hm}${b.ap}`;
}

export type BoardApi = {
  listDay: (date: string) => Promise<SpaceBooking[]>;
  create: (input: { spaceId: string; date: string; startTime: string; endTime: string; title?: string }) => Promise<{ ok: boolean; error?: string }>;
  cancel: (id: string) => Promise<{ ok: boolean; error?: string }>;
};

const SESSION_API: BoardApi = {
  listDay: (d) => listBookingsForDay(d),
  create: (i) => createBooking(i),
  cancel: (id) => cancelBooking(id),
};

export function SpaceBoard({ spaces, initialDate, initialBookings, currentCoachId, canManage, api = SESSION_API }: {
  spaces: AcademySpace[];
  initialDate: string;
  initialBookings: SpaceBooking[];
  currentCoachId: string | null;
  canManage: boolean;
  api?: BoardApi;
}) {
  const [date, setDate] = useState(initialDate);
  const [bookings, setBookings] = useState<SpaceBooking[]>(initialBookings);
  const [form, setForm] = useState<{ space: AcademySpace; hour: number } | null>(null);
  const [pending, start] = useTransition();

  function load(d: string) { start(async () => setBookings(await api.listDay(d))); }
  function shiftDay(delta: number) {
    const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() + delta);
    const next = iso(d); setDate(next); load(next);
  }
  function pickDate(v: string) { setDate(v); load(v); }

  const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (spaces.length === 0) return <p className="text-sm text-[#55666E]">No spaces defined for this academy yet.</p>;

  return (
    <div className="space-y-3">
      {/* Date bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button onClick={() => shiftDay(-1)} className="p-2 rounded-lg text-[#55666E] hover:bg-[#F7F9FA]"><ChevronLeft size={16} /></button>
          <div className="text-sm font-semibold text-[var(--tss-navy)] min-w-[180px] text-center">{dayLabel}</div>
          <button onClick={() => shiftDay(1)} className="p-2 rounded-lg text-[#55666E] hover:bg-[#F7F9FA]"><ChevronRight size={16} /></button>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={(e) => pickDate(e.target.value)} className="text-sm px-2.5 py-1.5 rounded-lg border border-[#DCD7C6] text-[#10263B]" />
          <button onClick={() => pickDate(todayIso())} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#DCD7C6] text-[#55666E] hover:bg-[#F7F9FA]">Today</button>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-lg border border-[#DCD7C6] bg-[#F7F9FA] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="flex min-w-max">
            {/* Time gutter */}
            <div className="shrink-0 sticky left-0 z-10 bg-[#F7F9FA] border-r border-[#DCD7C6]">
              <div className="h-10 border-b border-[#DCD7C6]" />
              {HOURS.map((h) => (
                <div key={h} className="relative border-b border-[#DCD7C6]" style={{ height: ROW_H, width: 48 }}>
                  <span className="absolute -top-2 right-2 text-[11px] font-mono text-[#55666E]">{hourLabel(h)}</span>
                </div>
              ))}
            </div>

            {/* Space columns */}
            {spaces.map((s) => {
              const rows = bookings.filter((b) => b.space_id === s.id);
              return (
                <div key={s.id} className="shrink-0 border-r border-[#DCD7C6]" style={{ width: 132 }}>
                  {/* Header */}
                  <div className="h-10 px-2 flex items-center gap-1.5 border-b border-[#DCD7C6] bg-[#F7F9FA]/60 sticky top-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color || '#55666E' }} />
                    <span className="text-[11px] font-semibold text-[var(--tss-navy)] leading-tight line-clamp-2">{s.name}</span>
                  </div>
                  {/* Track */}
                  <div className="relative" style={{ height: HOURS.length * ROW_H }}>
                    {/* Tappable empty hour cells */}
                    {HOURS.map((h) => (
                      <button
                        key={h}
                        onClick={() => setForm({ space: s, hour: h })}
                        className="absolute left-0 right-0 border-b border-[#DCD7C6] hover:bg-[var(--tss-cyan,#00D2FF)]/5 transition-colors"
                        style={{ top: (h - START_HOUR) * ROW_H, height: ROW_H }}
                        title={`Reservar ${hourLabel(h)}`}
                      />
                    ))}
                    {/* Booking blocks */}
                    {rows.map((b) => {
                      const s0 = Math.max(START_HOUR, esHourFloat(b.starts_at));
                      const s1 = Math.min(END_HOUR, esHourFloat(b.ends_at));
                      const top = (s0 - START_HOUR) * ROW_H;
                      const height = Math.max(20, (s1 - s0) * ROW_H - 2);
                      const mine = b.coach_id === currentCoachId;
                      // Reserva corta (menos de ~50 min): una sola línea "hora · quién",
                      // así nada queda cortado (Marcelo 2026-09-11: "se ve como cortado").
                      const compact = height < 40;
                      return (
                        <div
                          key={b.id}
                          className={`absolute left-0.5 right-0.5 rounded-md px-1.5 overflow-hidden ${compact ? "py-0.5" : "py-1"}`}
                          style={{ top, height, background: (s.color || '#55666E') + '22', borderLeft: `3px solid ${s.color || '#55666E'}` }}
                          title={`${hhmm(b.starts_at)}–${hhmm(b.ends_at)} · ${b.title || 'Reserva'} · Reservado por ${b.coach_name || '—'}`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            {/* From–to range, Google-Calendar style. */}
                            <p className="text-[11px] font-semibold leading-tight truncate" style={{ color: '#10263B' }}>
                              {rangeLabel(b.starts_at, b.ends_at)}
                              {compact && <span className="font-bold" style={{ color: s.color || '#10263B' }}> · {b.coach_name || 'Reserva'}</span>}
                            </p>
                            {(mine || canManage) && (
                              <button
                                onClick={() => start(async () => { const r = await api.cancel(b.id); if (r.ok) load(date); else alert(r.error); })}
                                className="text-[#55666E] hover:text-red-500 -mt-0.5"
                                aria-label="Cancelar"
                              ><X size={11} /></button>
                            )}
                          </div>
                          {/* WHO booked it — the fact the coordinator needs, so it
                              leads and never gets clipped behind the title. */}
                          {!compact && (
                            <p className="text-[11px] font-bold leading-tight truncate" style={{ color: s.color || '#10263B' }}>
                              {b.coach_name || 'Reserva'}
                            </p>
                          )}
                          {!compact && b.title && (
                            <p className="text-[11px] text-[#55666E] leading-tight truncate">{b.title}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[#55666E]">Tocá una franja libre para reservar · bloque de color = reservado · ✕ cancela (la tuya; el coordinador, cualquiera).</p>

      {form && (
        <BookingModal
          space={form.space}
          date={date}
          hour={form.hour}
          api={api}
          onClose={() => setForm(null)}
          onDone={() => { setForm(null); load(date); }}
        />
      )}
    </div>
  );
}

function BookingModal({ space, date, hour, api, onClose, onDone }: {
  space: AcademySpace;
  date: string;
  hour: number;
  api: BoardApi;
  onClose: () => void;
  onDone: () => void;
}) {
  const [startTime, setStartTime] = useState(`${pad(hour)}:00`);
  const [endTime, setEndTime] = useState(`${pad(Math.min(END_HOUR, hour + 1))}:00`);
  const [title, setTitle] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [saving, start] = useTransition();

  function submit() {
    setErr(null);
    start(async () => {
      const r = await api.create({ spaceId: space.id, date, startTime, endTime, title });
      if (!r.ok) { setErr(r.error || 'No se pudo reservar.'); return; }
      onDone();
    });
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#F7F9FA] rounded-t-2xl sm:rounded-lg p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="inline-flex items-center gap-2 text-base font-bold text-[var(--tss-navy)]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: space.color || '#55666E' }} />
            {space.name}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#55666E] hover:bg-[#F7F9FA]"><X size={18} /></button>
        </div>
        <p className="text-[11px] text-[#55666E] mb-3">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <label className="text-xs text-[#55666E]">De</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-[#DCD7C6]" />
          <label className="text-xs text-[#55666E]">a</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-[#DCD7C6]" />
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A nombre de… (cliente, clase o coach)" className="w-full text-sm px-3 py-2 rounded-lg border border-[#DCD7C6] mb-2" />
        {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
        <div className="flex gap-2">
          <button onClick={submit} disabled={saving} className="flex-1 text-sm font-semibold px-3 py-2.5 rounded-[5px] bg-[var(--tss-navy)] text-[#10263B] disabled:opacity-50">
            {saving ? 'Reservando…' : 'Confirmar reserva'}
          </button>
          <button onClick={onClose} className="text-sm px-3 py-2.5 rounded-[5px] text-[#55666E] hover:bg-[#F7F9FA]">Cancelar</button>
        </div>
      </div>
    </div>
  );
}
