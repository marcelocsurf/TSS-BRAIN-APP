'use client';

// ═══ QUÉ TRABAJAR DESPUÉS · elegible (Marcelo 2026-09-16) ═══
//
// "Debería poder elegir una secuencia y, si quiere y es necesario, un detalle
// de esa secuencia, y si quiere además escribir algo — pero que conecte con
// el app." Antes era texto libre: el alumno lo leía pero el Home no podía
// abrirlo en Let's Play. Ahora el foco es SECUENCIA (+ paso opcional + nota
// opcional) y el Home lo abre directo.

import { sequenceLabel } from '@/lib/constants/learning-blocks';

export type NextFocusValue = { sequenceId: string; stepId: string; note: string };
export type NextFocusGroup = { id: string; name: string; order: number | null; steps: { id: string; title: string }[] };

export const EMPTY_FOCUS: NextFocusValue = { sequenceId: '', stepId: '', note: '' };

/** Etiqueta legible que se guarda como texto (fichas viejas la muestran tal cual). */
export function focusLabel(groups: NextFocusGroup[], v: NextFocusValue): string {
  const g = groups.find((x) => x.id === v.sequenceId);
  if (!g) return v.note.trim();
  const seq = sequenceLabel(g.id, g.order, g.name);
  const st = v.stepId ? g.steps.find((s) => s.id === v.stepId) : null;
  const head = st ? `${seq} · ${st.title}` : seq;
  return v.note.trim() ? `${head} — ${v.note.trim()}` : head;
}

export function NextFocusPicker({ groups, value, onChange, label = '🎯 Next focus · required', hint }: {
  groups: NextFocusGroup[];
  value: NextFocusValue;
  onChange: (v: NextFocusValue) => void;
  label?: string;
  hint?: string;
}) {
  const g = groups.find((x) => x.id === value.sequenceId) ?? null;
  const sel = 'w-full px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm bg-[#F7F9FA] focus:outline-none focus:ring-1 focus:ring-[#00D2FF]';
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-mono uppercase tracking-wider" style={{ color: '#00A8CC' }}>{label}</label>
      {hint && <p className="text-[11px] text-[#55666E]">{hint}</p>}
      <select value={value.sequenceId} onChange={(e) => onChange({ sequenceId: e.target.value, stepId: '', note: value.note })} className={sel}>
        <option value="">— Pick the sequence to work on —</option>
        {groups.map((x) => <option key={x.id} value={x.id}>{sequenceLabel(x.id, x.order, x.name)}</option>)}
      </select>
      {g && (
        <select value={value.stepId} onChange={(e) => onChange({ ...value, stepId: e.target.value })} className={sel}>
          <option value="">Whole sequence (no specific step)</option>
          {g.steps.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.title}</option>)}
        </select>
      )}
      <textarea
        value={value.note}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
        rows={2}
        placeholder="Optional — one line in your words (e.g. hold the bottom turn before projecting)"
        className="w-full px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm bg-[#F7F9FA] resize-none focus:outline-none focus:ring-1 focus:ring-[#00D2FF]"
      />
    </div>
  );
}
