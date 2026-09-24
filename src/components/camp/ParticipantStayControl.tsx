'use client';

// ═══ Camp corto: hasta qué día se queda este campista ═══
// Pedido de Rick por Marcelo (2026-09-24). Va en la fila de Enrolled students,
// al lado de Finalize, porque es ahí donde el coordinador mira la lista.
//
// La diferencia con Finalize: esto es el PLAN (contrató 3 días) y se fija
// desde el principio, así que el coach lo ve en su plan desde el día 1.
// Finalize es el HECHO (se fue hoy) y se marca cuando pasa.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Plus, X } from 'lucide-react';
import { setParticipantLastDay } from '@/lib/actions/camps';
import { stayLength } from '@/lib/utils/camp-window';

const addDays = (iso: string, n: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

export function ParticipantStayControl({
  participantId,
  campId,
  studentName,
  campStart,
  campEnd,
  plannedDeparture,
  finalizedAt,
}: {
  participantId: string;
  campId: string;
  studentName: string;
  campStart: string | null;
  campEnd: string | null;
  plannedDeparture: string | null;
  finalizedAt: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Ya se fue: manda Finalize, que muestra su propia insignia. Dos controles
  // hablando de lo mismo confunden.
  if (finalizedAt) return null;
  if (!campStart || !campEnd) return null;

  const stay = stayLength({ planned_departure: plannedDeparture }, campStart, campEnd);
  if (!stay || stay.total < 2) return null; // un camp de un día no tiene estadía que elegir

  const save = async (lastDay: string | null) => {
    setBusy(true);
    const res = await setParticipantLastDay(participantId, campId, lastDay);
    setBusy(false);
    if (!res.ok) { alert(res.error || 'No se pudo guardar.'); return; }
    setOpen(false);
    router.refresh();
  };

  // Alargar un día: se mueve la salida hacia adelante. Al llegar al último día
  // del camp deja de ser corto y vuelve a ser el camp completo.
  const extend = () => {
    if (!plannedDeparture) return;
    const next = addDays(plannedDeparture, 1);
    save(next >= campEnd ? null : next);
  };

  if (open) {
    const days = Array.from({ length: stay.total }, (_, i) => addDays(campStart, i));
    return (
      <div className="shrink-0 flex items-center gap-1 flex-wrap justify-end">
        <span className="text-[10px] text-[#55666E]">Leaves after day</span>
        {days.map((d, i) => (
          <button
            key={d}
            onClick={() => save(i === days.length - 1 ? null : d)}
            disabled={busy}
            title={d}
            className="w-6 h-6 rounded-full text-[10px] font-bold border border-[#DCD7C6] hover:bg-[#F7F9FA] text-[var(--tss-navy)]"
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => setOpen(false)} title="Cancel" className="text-[#B8B1A0] hover:text-[#55666E] ml-0.5">
          <X size={13} />
        </button>
      </div>
    );
  }

  // Camp completo: el caso normal. Un botón discreto, sin ruido.
  if (!plannedDeparture) {
    return (
      <button
        onClick={() => setOpen(true)}
        title={`${studentName} — set a shorter stay`}
        className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-[#55666E] border border-[#DCD7C6] rounded-full px-2 py-0.5 hover:bg-[#F7F9FA]"
      >
        <CalendarDays size={11} strokeWidth={2} /> {stay.total} days
      </button>
    );
  }

  // Camp corto: se ve cuántos días contrató y se alarga de a uno.
  return (
    <div className="shrink-0 inline-flex items-center gap-1">
      <button
        onClick={() => setOpen(true)}
        title={`Leaves after ${plannedDeparture}`}
        className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 hover:bg-amber-100"
      >
        <CalendarDays size={11} strokeWidth={2} /> {stay.days} of {stay.total} days
      </button>
      <button
        onClick={extend}
        disabled={busy}
        title="Stay one more day"
        className="inline-flex items-center text-[10px] font-bold text-[var(--tss-navy)] border border-[#DCD7C6] rounded-full px-1.5 py-0.5 hover:bg-[#F7F9FA]"
      >
        <Plus size={11} strokeWidth={2.5} />1
      </button>
    </div>
  );
}
