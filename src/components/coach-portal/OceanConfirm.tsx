'use client';

// ═══ Confirmar el nivel de OCÉANO — desde la ficha del coach ═══
//
// Aparece mientras ocean_level_provisional=true (lo declaró el quiz, ningún
// coach lo vio en el agua). Es el paso PREVIO que la regla del agua exige
// antes de confirmar una cinta Blue+ — el botón tiene que vivir donde el
// coach trabaja, no solo en el dashboard staff (revisión 2026-08-31).

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Waves, Check } from 'lucide-react';
import { coachConfirmOcean } from '@/lib/actions/coach-students';
import { OCEAN_LEVELS, OCEAN_LEVEL_INFO, type OceanLevel } from '@/lib/constants/ocean-levels';

export function OceanConfirm({
  token,
  studentId,
  currentLevel,
}: {
  token: string;
  studentId: string;
  currentLevel: string | null;
}) {
  const router = useRouter();
  const [level, setLevel] = useState(currentLevel && (OCEAN_LEVELS as readonly string[]).includes(currentLevel) ? currentLevel : 'beginner');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const confirm = () =>
    startTransition(async () => {
      setError('');
      const r = await coachConfirmOcean(token, studentId, level).catch(() => ({ ok: false, error: 'No connection — try again.' }));
      if (!r.ok) { setError(r.error || 'Could not save.'); return; }
      router.refresh();
    });

  return (
    <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4">
      <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-800 font-semibold">
        <Waves size={12} strokeWidth={2.5} /> Ocean level — not confirmed yet
      </p>
      <p className="text-xs text-cyan-950 leading-relaxed mt-1.5">
        This came from their quiz. Watch how they handle the water — getting out with
        their board, positioning, getting back alone — then confirm what you see.
        Foundation and above need this confirmed first.
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="flex-1 px-3 py-2 border border-cyan-200 rounded-lg text-sm bg-white text-[var(--tss-navy)]"
        >
          {OCEAN_LEVELS.map((l) => (
            <option key={l} value={l}>{OCEAN_LEVEL_INFO[l as OceanLevel].name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          style={{ background: '#0090B0' }}
        >
          <Check size={14} strokeWidth={2.5} /> {pending ? 'Saving…' : level === currentLevel ? 'Confirm level' : 'Set & confirm'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
