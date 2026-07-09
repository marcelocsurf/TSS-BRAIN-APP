'use client';

import { useEffect, useState } from 'react';
import { SpaceBoard, type BoardApi } from '@/components/spaces/SpaceBoard';
import {
  listSpacesByToken,
  listBookingsForDayByToken,
  createBookingByToken,
  cancelBookingByToken,
  type AcademySpace,
  type SpaceBooking,
} from '@/lib/actions/spaces';

function todayIso() {
  const now = new Date();
  const es = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  return es.toISOString().slice(0, 10);
}

// Coach-portal (token) wrapper around the shared SpaceBoard. Loads the academy
// spaces + today's bookings on mount and injects token-based actions.
export function PortalSpaces({ token, coachId }: { token: string; coachId: string }) {
  const today = todayIso();
  const [spaces, setSpaces] = useState<AcademySpace[] | null>(null);
  const [bookings, setBookings] = useState<SpaceBooking[]>([]);

  useEffect(() => {
    let alive = true;
    Promise.all([listSpacesByToken(token), listBookingsForDayByToken(token, today)])
      .then(([s, b]) => { if (alive) { setSpaces(s); setBookings(b); } })
      .catch(() => { if (alive) setSpaces([]); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const api: BoardApi = {
    listDay: (d) => listBookingsForDayByToken(token, d),
    create: (i) => createBookingByToken(token, i),
    cancel: (id) => cancelBookingByToken(token, id),
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="rounded-2xl px-4 py-5" style={{ background: '#0A1628' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">Espacios</p>
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>Reserva de espacios</h2>
        <p className="text-[11px] text-white/50 mt-1">Reservá los espacios de la academia. Todos ven lo que está libre.</p>
      </div>

      {spaces === null ? (
        <p className="text-sm text-white/40 px-1">Cargando…</p>
      ) : (
        <div className="rounded-2xl bg-white p-3">
          <SpaceBoard
            spaces={spaces}
            initialDate={today}
            initialBookings={bookings}
            currentCoachId={coachId}
            canManage={false}
            api={api}
          />
        </div>
      )}
    </div>
  );
}
