'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { getMyAppointments, type MyAppointment } from '@/lib/actions/programs';

// ─── Próximas citas del alumno (Paso 5) — tarjeta del Home ───
// Mismo patrón autocontenido: null si no hay citas → Home idéntico para todos.
// Student-facing: inglés.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };

const KIND_LABEL: Record<string, string> = {
  fisico: 'Physical session',
  mental: 'Mental session',
  tecnico: 'Technique session',
  otro: 'Session',
};

function prettyDate(d: string): string {
  const dt = new Date(`${d}T12:00:00Z`);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function prettyTime(t: string | null): string | null {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function AppointmentCard({ token }: { token: string }) {
  const [items, setItems] = useState<MyAppointment[]>([]);

  useEffect(() => {
    getMyAppointments(token)
      .then((r) => { if (r.ok) setItems(r.appointments); })
      .catch(() => {});
  }, [token]);

  if (items.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,209,102,.07)', border: '1px solid rgba(255,209,102,.4)' }}
    >
      <p className="text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5" style={{ ...MONO, color: '#FFD166' }}>
        <CalendarClock size={12} /> Upcoming sessions
      </p>
      <div className="mt-2 space-y-2">
        {items.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: '#f4f9fc' }}>
                {a.title || KIND_LABEL[a.kind] || 'Session'}
              </p>
              {a.coach_name && (
                <p className="text-[11px]" style={{ color: '#8aa0b2' }}>with {a.coach_name}</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[12px] font-bold" style={{ color: '#FFD166' }}>{prettyDate(a.appointment_date)}</p>
              {a.appointment_time && (
                <p className="text-[11px]" style={{ color: '#b8cad8' }}>{prettyTime(a.appointment_time)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
