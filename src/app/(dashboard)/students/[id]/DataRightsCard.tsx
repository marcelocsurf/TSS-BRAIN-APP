'use client';

// Derechos del titular (privacidad): estado de consentimientos + botón de
// anonimización a pedido del alumno. Solo lo ve admin / coordinador.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Trash2 } from 'lucide-react';
import { anonymizeStudent } from '@/lib/actions/students';

type Props = {
  studentId: string;
  canAnonymize: boolean;
  consents: {
    waiver_signed_at: string | null;
    waiver_version: string | null;
    health_data_consent_at: string | null;
    terms_accepted_at: string | null;
    terms_version: string | null;
    media_release_consent: boolean | null;
    guardian_name: string | null;
    anonymized_at: string | null;
  };
};

const d = (v: string | null) => (v ? new Date(v).toLocaleDateString('es-SV', { year: 'numeric', month: 'short', day: 'numeric' }) : null);

export function DataRightsCard({ studentId, canAnonymize, consents }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const rows: [string, string, boolean][] = [
    ['Waiver', consents.waiver_signed_at ? `firmado ${d(consents.waiver_signed_at)}${consents.waiver_version ? ` · ${consents.waiver_version}` : ''}` : 'sin firmar', !!consents.waiver_signed_at],
    ['Datos de salud', consents.health_data_consent_at ? `consentimiento ${d(consents.health_data_consent_at)}` : 'sin consentimiento expreso', !!consents.health_data_consent_at],
    ['Términos + privacidad', consents.terms_accepted_at ? `aceptados ${d(consents.terms_accepted_at)}` : 'no aceptados aún', !!consents.terms_accepted_at],
    ['Uso de imagen', consents.media_release_consent ? 'autorizado' : 'NO autorizado', !!consents.media_release_consent],
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck size={16} className="text-[var(--tss-navy)]" />
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Privacidad y consentimientos</h3>
      </div>
      {consents.anonymized_at ? (
        <p className="text-sm text-gray-600">Ficha anonimizada el {d(consents.anonymized_at)}. Los datos identificativos y de salud fueron borrados a pedido del titular.</p>
      ) : (
        <>
          <div className="divide-y divide-gray-50">
            {rows.map(([k, v, ok]) => (
              <div key={k} className="flex items-center justify-between gap-3 py-1.5 text-[12.5px]">
                <span className="text-gray-500">{k}</span>
                <span className={ok ? 'text-emerald-700' : 'text-amber-700'}>{v}</span>
              </div>
            ))}
            {consents.guardian_name && (
              <div className="flex items-center justify-between gap-3 py-1.5 text-[12.5px]">
                <span className="text-gray-500">Firmó por el menor</span>
                <span className="text-gray-700">{consents.guardian_name}</span>
              </div>
            )}
          </div>

          {canAnonymize && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              {!open ? (
                <button type="button" onClick={() => setOpen(true)} className="text-[12px] text-gray-500 hover:text-red-600 inline-flex items-center gap-1.5">
                  <Trash2 size={13} /> El alumno pidió borrar sus datos
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[12px] text-gray-600 leading-snug">
                    Se borran nombre, contacto, foto, fecha de nacimiento, datos de salud, miedos, notas y quizzes. El link del portal deja de funcionar. Se conserva la fecha del waiver, los pagos y el historial sin identificar. <b>No se puede deshacer.</b>
                  </p>
                  <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo: quién lo pidió, por qué medio y cuándo *"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm" />
                  {err && <p className="text-[12px] text-red-600">{err}</p>}
                  <div className="flex gap-2">
                    <button type="button" disabled={busy || reason.trim().length < 5}
                      onClick={async () => {
                        if (!confirm('¿Anonimizar esta ficha? No se puede deshacer.')) return;
                        setBusy(true); setErr('');
                        const r = await anonymizeStudent(studentId, reason);
                        setBusy(false);
                        if (!r.ok) { setErr(r.error || 'No se pudo.'); return; }
                        router.refresh();
                      }}
                      className="px-4 py-2 rounded-xl text-[12px] font-semibold bg-red-600 text-white disabled:opacity-40">
                      {busy ? 'Anonimizando…' : 'Anonimizar ficha'}
                    </button>
                    <button type="button" onClick={() => { setOpen(false); setReason(''); }} className="px-4 py-2 rounded-xl text-[12px] text-gray-500">Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
