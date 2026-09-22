'use client';

// ═══ Cómo se cierra CUALQUIER sesión del alumno ═══
//
// Enfoque y flow se preguntan igual en todos lados. Estaban escritos dos
// veces con escalas distintas: la sesión con secuencia usaba 0-3
// (Distracted → Locked in) y la sesión que el alumno escribe usaba tres
// caras (Off / OK / Locked in), que además nunca se guardaban. Dos reglas
// para la misma pregunta hacen que la bitácora no se pueda comparar.
// Una sola definición, acá.

import { Brain } from 'lucide-react';

const INK = '#061C2B', PAPER = '#F7F9FA', GREEN = '#06D6A0';
const F_M: React.CSSProperties = {
  fontFamily: 'var(--font-plex), IBM Plex Mono, monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
};

/** Qué tan metido estaba: 0 Distracted · 3 Locked in. */
export const FOCUS_LABELS = ['Distracted', 'Some', 'Mostly', 'Locked in'] as const;

export function FocusPicker({ value, onChange }: { value: number | null; onChange: (n: number | null) => void }) {
  return (
    <div>
      <p className="text-[12px] text-[#55666E] mb-1.5" style={F_M}>
        <Brain size={11} className="inline mr-1 -mt-0.5" />Focus during practice
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map((n) => {
          const sel = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-pressed={sel}
              onClick={() => onChange(sel ? null : n)}
              className="py-2.5 rounded-[5px] border-[1.5px] flex flex-col items-center gap-0.5"
              style={sel ? { background: INK, borderColor: INK, color: PAPER } : { background: PAPER, borderColor: '#DCD7C6', color: '#55666E' }}
            >
              <span className="text-base font-bold leading-none">{n}</span>
              <span className="text-[12px] leading-tight opacity-80">{FOCUS_LABELS[n]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** El canal de flow: 1 aburrido · 3 flow · 5 demasiado. */
export function FlowPicker({ flow, onChange }: { flow: number | null; onChange: (n: number | null) => void }) {
  return (
    <div>
      <p className="text-[12px] text-[#55666E] mb-1" style={F_M}>
        How did the challenge feel? Flow lives between boredom and frustration.
      </p>
      <div className="grid grid-cols-5 gap-1">
        {(['Bored', 'Easy', 'Flow', 'Hard', 'Too much'] as const).map((l, i) => {
          const n = i + 1;
          const sel = flow === n;
          return (
            <button
              key={l}
              type="button"
              aria-pressed={sel}
              onClick={() => onChange(sel ? null : n)}
              className="py-2 rounded-lg text-[12px] font-bold border"
              style={sel
                ? { background: n === 3 ? GREEN : INK, borderColor: n === 3 ? GREEN : INK, color: n === 3 ? INK : PAPER }
                : { background: PAPER, borderColor: '#DCD7C6', color: '#55666E' }}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** ¿Cumpliste lo que te propusiste? Mismo vocabulario que guarda la base. */
export const OUTCOMES = [
  { value: 'yes' as const, label: 'I met it' },
  { value: 'partial' as const, label: 'Partly' },
  { value: 'no' as const, label: 'Not today' },
];

export function OutcomePicker({
  value,
  onChange,
  question = 'Did you meet what you set out to do?',
}: {
  value: 'yes' | 'partial' | 'no' | null;
  onChange: (v: 'yes' | 'partial' | 'no' | null) => void;
  question?: string;
}) {
  return (
    <div>
      <p className="text-[12px] text-[#55666E] mb-1.5" style={F_M}>{question}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {OUTCOMES.map((o) => {
          const sel = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={sel}
              onClick={() => onChange(sel ? null : o.value)}
              className="py-2.5 rounded-[5px] border-[1.5px] text-[13px] font-bold"
              style={sel
                ? { background: o.value === 'yes' ? GREEN : INK, borderColor: o.value === 'yes' ? GREEN : INK, color: o.value === 'yes' ? INK : PAPER }
                : { background: PAPER, borderColor: '#DCD7C6', color: '#55666E' }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
