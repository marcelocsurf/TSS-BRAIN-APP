// ═══ Las opciones de "next focus" del coach, sacadas del curso ═══
// Marcelo (2026-09-10): "que las misiones que deja el coach salgan de los
// detalles de las misiones del curso y de la biomecánica… o de la ejecución
// completa, o comenzar una secuencia nueva porque ya aprobó". El coach toca
// una opción y puede sumar una frase para reforzar. Mismo lenguaje que ve el
// alumno en Let's Play.
import { SEQUENCE_PAGES } from './index';
import { momentsByStep } from './moments';
import type { SequencePageConfig } from './types';

export type FocusOption = { label: string; text: string };
export type FocusGroup = { title: string; options: FocusOption[] };

const seqTag = (c: SequencePageConfig) => `#${c.number} ${c.title}`;

export function coachFocusOptions(stepIds: string[], stepTitles: Record<string, string> = {}): FocusGroup[] {
  const all = Object.values(SEQUENCE_PAGES).filter((c) => c.kind !== 'entry');
  const ids = new Set(stepIds.filter(Boolean));
  // Las secuencias que contienen lo que se entrenó hoy (máximo dos).
  const hit = all.filter((c) => c.stepIds.some((id) => ids.has(id))).sort((a, b) => a.number - b.number).slice(0, 2);
  const groups: FocusGroup[] = [];
  for (const c of hit) {
    const steps = c.stepIds.map((id) => ({ id, title: stepTitles[id] ?? id }));
    const ms = momentsByStep(c.id, steps);
    const opts: FocusOption[] = [];
    for (const st of steps) {
      if (!ids.has(st.id)) continue;
      for (const m of ms[st.id] ?? []) opts.push({ label: m.short, text: `${seqTag(c)} · ${st.title} · ${m.short}` });
      if (!(ms[st.id] ?? []).length) opts.push({ label: st.title, text: `${seqTag(c)} · ${st.title}` });
    }
    opts.push({ label: `Whole line · ${seqTag(c)}`, text: `${seqTag(c)} · run the whole line` });
    const next = all.filter((n) => n.belt === c.belt && n.number > c.number).sort((a, b) => a.number - b.number)[0];
    if (next) opts.push({ label: `Start ${seqTag(next)}`, text: `Start ${seqTag(next)} · ${seqTag(c)} is yours` });
    groups.push({ title: seqTag(c), options: opts });
  }
  return groups;
}
