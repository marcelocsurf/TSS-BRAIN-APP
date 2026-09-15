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
      <div className="px-1">
        <p className="text-[11px] font-mono uppercase tracking-wider mb-0.5" style={{ color: '#00A8CC', letterSpacing: '0.12em' }}>Espacios</p>
        <h2 className="text-[23px] leading-tight" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#10263B' }}>Reserva de espacios</h2>
        <p className="text-[13px] text-[#55666E] mt-1">Reservá los espacios de la academia. Todos ven lo que está libre.</p>
      </div>

      {spaces === null ? (
        <p className="text-sm text-[#55666E] px-1">Cargando…</p>
      ) : (
        <div className="rounded-lg p-3" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
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
