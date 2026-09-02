'use client';

// Agregar un día a un servicio ya creado. Pedido real: el camp se arma con los
// días confirmados y después se confirma uno más — antes había que rehacerlo.
// Deshacer solo aparece si el último día todavía no tiene nada.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addCampDay, removeLastCampDay } from '@/lib/actions/camps';
import { CalendarPlus, Undo2 } from 'lucide-react';

interface Props {
  campId: string;
  nextDayNumber: number;
  nextDate: string | null;
  /** El último día se puede deshacer: es agregado, planificado y sin historia. */
  canUndoLast: boolean;
}

export function CampDayManager({ campId, nextDayNumber, nextDate, canUndoLast }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<'add' | 'undo' | null>(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  const run = async (kind: 'add' | 'undo') => {
    setBusy(kind);
    setError('');
    const res = kind === 'add' ? await addCampDay(campId) : await removeLastCampDay(campId);
    setBusy(null);
    setConfirming(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  };

  return (
    <div className="px-4 py-3 bg-gray-50/60">
      {confirming ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            Add <strong>Day {nextDayNumber}</strong>
            {nextDate ? <> on <strong>{nextDate}</strong></> : null}. The service end date moves with it.
            Enrollment stays closed.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => run('add')}
              disabled={busy !== null}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--tss-navy,#061C2B)] text-white disabled:opacity-50"
            >
              {busy === 'add' ? 'Adding…' : 'Add the day'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy !== null}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--tss-navy,#061C2B)] hover:underline"
          >
            <CalendarPlus size={14} strokeWidth={2} />
            Add a day
          </button>
          {canUndoLast && (
            <button
              type="button"
              onClick={() => run('undo')}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <Undo2 size={13} strokeWidth={2} />
              {busy === 'undo' ? 'Removing…' : `Remove day ${nextDayNumber - 1}`}
            </button>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
