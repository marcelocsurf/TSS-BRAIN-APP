'use client';

// ═══ Confirmar / ajustar la cinta PROVISIONAL — desde la ficha del coach ═══
//
// Solo aparece mientras belt_provisional=true (la puso el quiz, nadie la
// validó). El coach la confirma o la mueve — en el agua, que es donde se ve
// el nivel real. Bajar: siempre. Subir: hasta su certificación.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Check } from 'lucide-react';
import { coachConfirmBelt } from '@/lib/actions/coach-students';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

const BELTS: BeltLevel[] = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'];

export function BeltConfirm({
  token,
  studentId,
  currentBelt,
  quizScore,
  cappedNote,
}: {
  token: string;
  studentId: string;
  currentBelt: string;
  quizScore: number | null;
  cappedNote?: string | null;
}) {
  const router = useRouter();
  const [belt, setBelt] = useState(currentBelt);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const confirm = () =>
    startTransition(async () => {
      setError('');
      const r = await coachConfirmBelt(token, studentId, belt).catch(() => ({ ok: false, error: 'No connection — try again.' }));
      if (!r.ok) { setError(r.error || 'Could not save.'); return; }
      router.refresh();
    });

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
      <p className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-amber-700 font-semibold">
        <ShieldAlert size={12} strokeWidth={2.5} /> Provisional — set by the level quiz
        {quizScore != null && <span className="ml-auto normal-case tracking-normal">quiz {quizScore}/70</span>}
      </p>
      <p className="text-xs text-amber-900 leading-relaxed mt-1.5">
        Nobody has confirmed this belt in the water yet. Watch them surf, then confirm it —
        or adjust it to what you actually see. That&apos;s what locks their level in.
      </p>
      {cappedNote && <p className="text-[11px] text-amber-800/80 leading-snug mt-1">{cappedNote}</p>}
      <div className="mt-2.5 flex items-center gap-2">
        <select
          value={belt}
          onChange={(e) => setBelt(e.target.value)}
          className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white text-[var(--tss-navy)]"
        >
          {BELTS.map((b) => (
            <option key={b} value={b}>{BELT_DISPLAY[b]?.en ?? b}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={confirm}
          disabled={pending}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
          style={{ background: '#0090B0' }}
        >
          <Check size={14} strokeWidth={2.5} /> {pending ? 'Saving…' : belt === currentBelt ? 'Confirm belt' : 'Set & confirm'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
