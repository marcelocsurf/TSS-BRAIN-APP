'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BRAND } from '@/lib/constants/brand';
import { logFreeSurf } from '@/lib/actions/portal';
import { OutcomePicker } from '@/components/portal/close-pickers';
import { Clock, ThumbsUp } from 'lucide-react';

// Surfboard glyph — compass geometry (two symmetric arcs + stringer), matching
// the TSS icon language.
function SurfboardIcon({ size = 22, color = '#061C2B' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2 A14 14 0 0 1 12 22 A14 14 0 0 1 12 2 Z" />
      <path d="M12 5 V19" />
    </svg>
  );
}

// Free Surf quick-logger — for days the student surfed without a mission.
// All logged time counts toward "Free Surfing" in the bitácora.

const MINUTE_CHIPS = [30, 60, 120, 240, 480];

// Free surf es expresión, no entrenamiento: no se le pide foco ni flow
// (Marcelo 2026-09-22). Solo una intención — de un toque — y, al cerrarla,
// una sola pregunta. Si le pedimos más, deja de ser free surf.
const INTENTIONS = [
  'Just have fun',
  'Catch as many waves as I can',
  'Feel the water',
  'Long sessions, build my paddle',
  'Surf with friends',
  'Reset my head',
];

export function FreeSurfLogger({ token }: { token: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState(60);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  // Dos estados separados: el chip elegido y lo que escribió a mano. Con uno
  // solo, tocar un chip le borraba el texto y escribir un texto igual a un
  // chip lo hacía desaparecer del campo.
  const [chip, setChip] = useState('');
  const [ownText, setOwnText] = useState('');
  const [outcome, setOutcome] = useState<'yes' | 'partial' | 'no' | null>(null);
  const intention = (chip || ownText).trim();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  // Cerrada es una FILA, no una tarjeta blanca: registrar una surfeada son dos
  // segundos y no puede pesar lo mismo que lo que hay que trabajar hoy
  // (reporte de Marcelo 2026-08-28: el Home "se ve cargado").
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full min-h-[48px] rounded-[5px] flex items-center justify-center gap-2 text-[17px] font-black uppercase"
        style={{ background: '#00D2FF', color: '#061C2B', letterSpacing: '0.035em', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}
      >
        <SurfboardIcon size={18} color="#061C2B" />
        Log free surf <span aria-hidden="true">+</span>
      </button>
    );
  }

  if (done) {
    return (
      <div className="rounded-lg p-5 text-center" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
        <ThumbsUp size={24} strokeWidth={1.75} className="mx-auto mb-1 text-[var(--tss-cyan)]" />
        <p className="text-sm font-semibold text-[var(--tss-navy)]">Free surf logged!</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-4 space-y-3" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
      <div className="flex items-center justify-between">
        <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tss-navy)]">
          <SurfboardIcon size={15} />
          Log Free Surf
        </h3>
        <button
          type="button"
          onClick={() => { setOpen(false); setChip(''); setOwnText(''); setOutcome(null); setNotes(''); setError(''); }}
          className="text-xs text-gray-400 hover:text-[var(--tss-navy)]"
        >
          Cancel
        </button>
      </div>

      {/* Éste es el instante exacto en que el alumno clasifica su propia
          sesión, así que la doctrina del cap. 2 pega acá más que en cualquier
          lección leída tres semanas antes. */}
      <p className="text-[11.5px] leading-relaxed rounded-xl px-3 py-2" style={{ background: 'rgba(0,210,255,.07)', border: '1px solid rgba(0,210,255,.2)', color: '#4a6072' }}>
        <strong style={{ color: 'var(--tss-navy)' }}>Free surf is expression</strong> — using what you already have.
        Training is intervention — building something that is not there yet.
        Both count. The only mistake is confusing one for the other.
      </p>

      {/* La intención: un toque, o escribila. Sin intención no se pregunta
          nada más — registrar una surfeada tiene que seguir siendo de dos
          segundos. */}
      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
          What were you there for? (optional)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {INTENTIONS.map((i) => {
            const on = intention === i;
            return (
              <button key={i} type="button" aria-pressed={on}
                onClick={() => { const next = on ? '' : i; setChip(next); if (!next && !ownText.trim()) setOutcome(null); }}
                className="px-2.5 py-1.5 rounded-full text-[12px] font-semibold border"
                style={on ? { background: '#061C2B', borderColor: '#061C2B', color: '#F7F9FA' } : { background: '#fff', borderColor: '#DCD7C6', color: '#10263B' }}>
                {i}
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={ownText}
          onChange={(e) => { setOwnText(e.target.value); if (e.target.value.trim()) setChip(''); else if (!chip) setOutcome(null); }}
          placeholder="Or write your own"
          className="mt-2 w-full px-3 py-2 border border-[#DCD7C6] bg-[#F7F9FA] rounded-[5px] text-sm"
        />
      </div>

      {!!intention && (
        <OutcomePicker value={outcome} onChange={setOutcome} question="Did you meet it?" />
      )}

      <div>
        <label className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
          <Clock size={13} strokeWidth={1.75} />
          Time in the water
        </label>
        <div className="grid grid-cols-5 gap-2">
          {MINUTE_CHIPS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(m)}
              className={`py-2 rounded-lg text-xs font-medium border ${
                minutes === m ? 'border-transparent font-bold' : 'border-gray-200 text-gray-600'
              }`}
              style={minutes === m ? { background: '#00D2FF', color: '#061C2B' } : {}}
            >
              {m >= 60 ? `${m / 60}h` : `${m}m`}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          value={minutes}
          onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="mt-2 w-full px-3 py-2 border border-[#DCD7C6] bg-[#F7F9FA] rounded-[5px] text-sm"
          placeholder="Minutes"
        />
        <p className="mt-1 text-[10px] text-gray-400">Type any amount in minutes — e.g. 480 for an 8-hour day.</p>
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
          Date
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border border-[#DCD7C6] bg-[#F7F9FA] rounded-[5px] text-sm"
        />
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1.5">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Conditions, who you surfed with, how it felt…"
          rows={2}
          className="w-full px-3 py-2 border border-[#DCD7C6] bg-[#F7F9FA] rounded-[5px] text-sm resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError('');
          startTransition(async () => {
            try {
              await logFreeSurf(token, minutes, date || undefined, notes || undefined, {
                intention: intention || null,
                missionCompletion: outcome,
              });
              setDone(true);
              // No router.refresh(): vuelve a pedir la página con la URL interna
              // de Next, que puede traer ?tab=course de un deep-link anterior, y
              // el alumno aterrizaba en el curso (Marcelo 2026-09-17). El logger
              // vive en el Home: recargar datos quedándose en el Home.
              router.replace(`${window.location.pathname}?tab=home`);
            } catch (e: any) {
              setError(e.message || 'Failed to save');
            }
          });
        }}
        className="w-full py-3 rounded-[5px] text-sm font-black uppercase disabled:opacity-40"
        style={{ background: '#00D2FF', color: '#061C2B', letterSpacing: '0.035em' }}
      >
        {pending ? 'Saving…' : `Log ${minutes}m Free Surf`}
      </button>
    </div>
  );
}
