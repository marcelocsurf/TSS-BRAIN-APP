'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { confirmMembershipRenewal, type MembershipInfo } from '@/lib/actions/memberships';

// M156 — Estado de membresía en el perfil del alumno + confirmación de
// renovación (el alumno solicita desde su portal; acá se confirma el cobro).
export function MembershipPanel({ studentId, info }: { studentId: string; info: MembershipInfo }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const confirm = () => start(async () => {
    setErr(null);
    const res = await confirmMembershipRenewal(studentId);
    if (!res.ok) { setErr(res.error || 'No se pudo confirmar.'); return; }
    router.refresh();
  });

  const days = info.days_left ?? 0;
  const tone = !info.active ? '#DC2626' : days <= 30 ? '#D97706' : '#059669';
  const label = !info.active
    ? 'Vencida'
    : `Activa · vence ${info.ends_at ? new Date(info.ends_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} (${days} días)`;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2">Membresía</p>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[13px] font-semibold" style={{ color: tone }}>● {label}</span>
        {info.pending_request && (
          <button onClick={confirm} disabled={pending}
            className="text-[12px] font-bold px-3.5 py-2 rounded-full bg-emerald-500 text-white disabled:opacity-50">
            {pending ? 'Confirmando…' : '✓ Confirmar renovación (pago recibido)'}
          </button>
        )}
      </div>
      {info.pending_request && (
        <p className="text-[11px] text-amber-700 mt-1.5">⚠ El alumno solicitó renovar desde su portal — cobrale y confirmá acá.</p>
      )}
      {err && <p className="text-[11px] text-red-600 mt-1.5">{err}</p>}
    </div>
  );
}
