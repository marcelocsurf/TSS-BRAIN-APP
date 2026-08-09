'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signStaffWaiver } from '@/lib/actions/coach-portal';

// #12b — Waiver de staff: banner en el home del portal hasta que firme.
// Resumen bilingüe (mismo espíritu que el waiver de alumnos) + firma tipeada.
export function StaffWaiverCard({ token }: { token: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const sign = () => start(async () => {
    setErr(null);
    const res = await signStaffWaiver(token, name);
    if (!res.ok) { setErr(res.error || 'Try again.'); return; }
    router.refresh();
  });

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
      <p className="text-[13px] font-bold text-amber-900">⚠ Waiver del staff pendiente — firmalo para quedar cubierto</p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-2 text-[12px] font-bold px-4 py-2 rounded-full bg-amber-500 text-white">
          Leer y firmar →
        </button>
      ) : (
        <div className="mt-3 space-y-2.5">
          <ul className="text-[12px] text-amber-900 space-y-1 list-disc pl-4">
            <li>El surf y el trabajo en el agua implican riesgos serios; los asumo voluntariamente y declaro estar apto/a físicamente.</li>
            <li>Libero a The Surf Sequence® y a la academia de responsabilidad por negligencia ordinaria durante mis funciones.</li>
            <li>Me comprometo a seguir los protocolos de seguridad, el plan de emergencia y a reportar todo incidente el mismo día.</li>
            <li>Autorizo el uso de imagen en material interno y de marca de la academia.</li>
          </ul>
          <p className="text-[11px] text-amber-800">Al escribir tu nombre legal completo y firmar, aceptás el documento completo.</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre legal completo"
            className="w-full text-[14px] px-3 py-2.5 rounded-lg border border-amber-300 bg-white"
          />
          {err && <p className="text-[11px] text-red-600">{err}</p>}
          <button onClick={sign} disabled={pending}
            className="w-full py-3 rounded-full bg-[#061C2B] text-white text-[12px] font-bold disabled:opacity-50">
            {pending ? 'Firmando…' : '✍️ Firmar el waiver de staff'}
          </button>
        </div>
      )}
    </div>
  );
}
