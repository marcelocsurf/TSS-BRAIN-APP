'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, X, Phone, Cross, LifeBuoy, MapPin, ListChecks } from 'lucide-react';

export interface EmergencyPlan {
  emergency_numbers: string | null;
  nearest_hospital: string | null;
  lifeguard_contact: string | null;
  emergency_address: string | null;
  emergency_protocol: string | null;
}

// Quick-access emergency plan: a red button that opens the academy's plan in a
// modal, so in a real emergency nobody has to navigate. Read-only; editing
// still lives in My Academy.
export function EmergencyPlanButton({ plan }: { plan: EmergencyPlan | null }) {
  const [open, setOpen] = useState(false);

  const hasData = !!plan && (
    plan.emergency_numbers || plan.nearest_hospital || plan.lifeguard_contact ||
    plan.emergency_address || plan.emergency_protocol
  );

  const rows: { icon: React.ReactNode; label: string; value: string | null }[] = [
    { icon: <Phone size={16} strokeWidth={1.75} />, label: 'Números de emergencia', value: plan?.emergency_numbers ?? null },
    { icon: <Cross size={16} strokeWidth={1.75} />, label: 'Hospital más cercano', value: plan?.nearest_hospital ?? null },
    { icon: <LifeBuoy size={16} strokeWidth={1.75} />, label: 'Salvavidas', value: plan?.lifeguard_contact ?? null },
    { icon: <MapPin size={16} strokeWidth={1.75} />, label: 'Punto de encuentro', value: plan?.emergency_address ?? null },
    { icon: <ListChecks size={16} strokeWidth={1.75} />, label: 'Protocolo', value: plan?.emergency_protocol ?? null },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mb-6 flex w-full items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-left transition-colors hover:bg-red-100"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
          <ShieldAlert size={20} strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-red-800">Plan de emergencia</span>
          <span className="block text-xs text-red-600/80">
            {hasData ? 'Abrir — números, hospital, protocolo' : 'Sin configurar — completar en Mi Academia'}
          </span>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="inline-flex items-center gap-2 text-base font-bold text-red-700">
                <ShieldAlert size={18} strokeWidth={2} /> Plan de emergencia
              </h3>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100" aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            {hasData ? (
              <div className="space-y-3">
                {rows.filter((r) => r.value).map((r) => (
                  <div key={r.label} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 text-red-500">{r.icon}</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{r.label}</p>
                      <p className="whitespace-pre-line text-sm font-medium text-gray-800">{r.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                El plan de emergencia aún no está configurado.{' '}
                <Link href="/my-academy" className="font-semibold text-red-600 hover:underline">Completarlo en Mi Academia →</Link>
              </p>
            )}

            <Link
              href="/my-academy"
              className="mt-5 block rounded-xl border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Editar en Mi Academia
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
