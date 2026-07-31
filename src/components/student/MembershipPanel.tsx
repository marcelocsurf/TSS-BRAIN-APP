'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { confirmMembershipRenewal, grantMembership, type MembershipInfo } from '@/lib/actions/memberships';

// M156 — Estado de membresía en el perfil del alumno + confirmación de
// renovación (el alumno solicita desde su portal; acá se confirma el cobro).
export function MembershipPanel({ studentId, info }: { studentId: string; info: MembershipInfo }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [gift, setGift] = useState(false);

  // Otorgar acceso = darle membresía. Con el link del portal listo para enviar.
  const grant = (months: number) => start(async () => {
    setErr(null); setMsg(null);
    const res = await grantMembership(studentId, months, gift);
    if (!res.ok) { setErr(res.error || 'No se pudo otorgar.'); return; }
    if (res.portal_url) {
      try { await navigator.clipboard.writeText(res.portal_url); setMsg(`✓ Membresía de ${months} ${months === 1 ? 'mes' : 'meses'} otorgada — link del portal COPIADO, mandáselo por WhatsApp/email.`); }
      catch { setMsg(`✓ Otorgada. Link del portal: ${res.portal_url}`); }
    } else setMsg('✓ Membresía otorgada.');
    router.refresh();
  });

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

      {/* Otorgar acceso al portal: membresía manual + link listo para enviar */}
      <div className="mt-3 pt-3 border-t border-gray-50">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
          {info.active ? 'Extender membresía' : '🔑 Otorgar acceso al portal'}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[1, 6, 12].map((m) => (
            <button key={m} onClick={() => grant(m)} disabled={pending}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-400 disabled:opacity-50 text-gray-700">
              +{m} {m === 1 ? 'mes' : 'meses'}
            </button>
          ))}
          <label className="inline-flex items-center gap-1 text-[10.5px] text-gray-500 ml-1 cursor-pointer">
            <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} className="h-3 w-3" />
            🎁 regalo (sin cobro)
          </label>
        </div>
        {msg && <p className="text-[11px] font-semibold text-emerald-700 mt-1.5">{msg}</p>}
        <p className="text-[10px] text-gray-400 mt-1">Al otorgar, el link del portal queda copiado para enviárselo. Sin membresía activa, el portal le muestra la pantalla de renovación.</p>
      </div>
    </div>
  );
}
