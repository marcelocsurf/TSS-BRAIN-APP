'use client';

import { useState, useTransition } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react';
import {
  listBookingsForDay,
  createBooking,
  cancelBooking,
  type AcademySpace,
  type SpaceBooking,
} from '@/lib/actions/spaces';

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function hhmm(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}
function todayIso() {
  const now = new Date();
  const es = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  return es.toISOString().slice(0, 10);
}

export function SpaceBoard({ spaces, initialDate, initialBookings, currentCoachId, canManage }: {
  spaces: AcademySpace[];
  initialDate: string;
  initialBookings: SpaceBooking[];
  currentCoachId: string | null;
  canManage: boolean;
}) {
  const [date, setDate] = useState(initialDate);
  const [bookings, setBookings] = useState<SpaceBooking[]>(initialBookings);
  const [openForm, setOpenForm] = useState<string | null>(null); // spaceId
  const [pending, start] = useTransition();

  function shiftDay(delta: number) {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const next = iso(d);
    setDate(next);
    start(async () => setBookings(await listBookingsForDay(next)));
  }
  function refresh(d = date) {
    start(async () => setBookings(await listBookingsForDay(d)));
  }
  function pickDate(v: string) {
    setDate(v);
    start(async () => setBookings(await listBookingsForDay(v)));
  }

  const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (spaces.length === 0) {
    return <p className="text-sm text-gray-500">No spaces defined for this academy yet.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Date bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button onClick={() => shiftDay(-1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"><ChevronLeft size={16} /></button>
          <div className="text-sm font-semibold text-[var(--tss-navy)] min-w-[180px] text-center">{dayLabel}</div>
          <button onClick={() => shiftDay(1)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"><ChevronRight size={16} /></button>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={date} onChange={(e) => pickDate(e.target.value)} className="text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700" />
          <button onClick={() => pickDate(todayIso())} className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Today</button>
        </div>
      </div>

      {/* Spaces */}
      <div className="space-y-2">
        {spaces.map((s) => {
          const rows = bookings.filter((b) => b.space_id === s.id).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
          return (
            <div key={s.id} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-50">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--tss-navy)]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color || '#5A6B78' }} />
                  {s.name}
                </span>
                <button
                  onClick={() => setOpenForm(openForm === s.id ? null : s.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--tss-navy)] hover:underline"
                >
                  <Plus size={13} /> Reservar
                </button>
              </div>

              {openForm === s.id && (
                <BookingForm
                  space={s}
                  date={date}
                  pending={pending}
                  onDone={() => { setOpenForm(null); refresh(); }}
                />
              )}

              <div className="divide-y divide-gray-50">
                {rows.length === 0 ? (
                  <p className="px-4 py-3 text-[12px] text-gray-400">Libre todo el día.</p>
                ) : rows.map((b) => {
                  const mine = b.coach_id === currentCoachId;
                  return (
                    <div key={b.id} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-500 shrink-0">
                        <Clock size={12} /> {hhmm(b.starts_at)}–{hhmm(b.ends_at)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 truncate">
                          {b.title || 'Reserva'}{b.coach_name ? <span className="text-gray-400"> · {b.coach_name}</span> : ''}
                          {mine && <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#2E93BD)]">Tuya</span>}
                        </p>
                      </div>
                      {(mine || canManage) && (
                        <button
                          onClick={() => start(async () => { const r = await cancelBooking(b.id); if (r.ok) refresh(); else alert(r.error); })}
                          className="p-1 text-gray-300 hover:text-red-500 shrink-0"
                          aria-label="Cancelar"
                        >
                          <X size={15} />
                        </button>
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
  );
}

function BookingForm({ space, date, pending, onDone }: {
  space: AcademySpace;
  date: string;
  pending: boolean;
  onDone: () => void;
}) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [title, setTitle] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [saving, start] = useTransition();

  function submit() {
    setErr(null);
    start(async () => {
      const r = await createBooking({ spaceId: space.id, date, startTime, endTime, title });
      if (!r.ok) { setErr(r.error || 'No se pudo reservar.'); return; }
      onDone();
    });
  }

  return (
    <div className="bg-gray-50 px-4 py-3 space-y-2.5 border-b border-gray-100">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-gray-500">De</label>
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-gray-200" />
        <label className="text-xs text-gray-500">a</label>
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-gray-200" />
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (ej. Surf Skate 1 · alumno)" className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200" />
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex gap-2">
        <button onClick={submit} disabled={saving || pending} className="text-xs font-semibold px-3 py-2 rounded-lg bg-[var(--tss-navy)] text-white disabled:opacity-50">
          {saving ? 'Reservando…' : 'Confirmar reserva'}
        </button>
        <button onClick={onDone} className="text-xs px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100">Cancelar</button>
      </div>
    </div>
  );
}
