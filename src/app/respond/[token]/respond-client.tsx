'use client';

import { useState } from 'react';
import { respondToServiceStaffByToken } from '@/lib/actions/service-staff';

const ROLE_LABEL: Record<string, string> = {
  assistant: 'Asistente',
  photographer: 'Fotógrafo',
  filmmaker: 'Filmmaker',
  other: 'Staff',
};

export function RespondClient({
  token,
  row,
}: {
  token: string;
  row: { id: string; role: string; status: string; name: string; camp_name: string; date_range: string };
}) {
  const [done, setDone] = useState<null | 'accepted' | 'declined'>(
    row.status === 'accepted' ? 'accepted' : row.status === 'declined' ? 'declined' : null,
  );
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const respond = async (decision: 'accepted' | 'declined') => {
    setLoading(true);
    setError('');
    const res = await respondToServiceStaffByToken(token, decision, note.trim() || undefined);
    setLoading(false);
    if (res.ok) setDone(decision);
    else setError(res.error || 'No se pudo registrar tu respuesta.');
  };

  if (done) {
    return (
      <div className="text-center">
        <p className="text-2xl mb-1">{done === 'accepted' ? '✅' : '✖️'}</p>
        <p className="text-sm font-semibold text-[var(--tss-navy)]">
          {done === 'accepted' ? 'Confirmaste tu participación' : 'Rechazaste la asignación'}
        </p>
        <p className="text-xs text-gray-500 mt-1">{row.camp_name} · {row.date_range}</p>
        <p className="text-[11px] text-gray-400 mt-3">Podés cerrar esta página. El coordinador fue notificado.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)]">
        {ROLE_LABEL[row.role] ?? 'Staff'} · asignación
      </p>
      <h1 className="text-lg font-bold text-[var(--tss-navy)] mt-1 leading-tight">{row.camp_name}</h1>
      <p className="text-sm text-gray-500">{row.date_range}</p>
      <p className="text-xs text-gray-600 mt-3">
        Hola {row.name.split(' ')[0]}, fuiste asignado/a como <strong>{(ROLE_LABEL[row.role] ?? 'staff').toLowerCase()}</strong> a este servicio. ¿Confirmás tu participación?
      </p>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Nota (opcional)"
        className="w-full mt-3 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-cyan,#5AC3E7)]"
      />
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => respond('declined')}
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700 disabled:opacity-50"
        >
          Rechazar
        </button>
        <button
          onClick={() => respond('accepted')}
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
          style={{ background: 'var(--tss-navy)' }}
        >
          {loading ? '…' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
}
