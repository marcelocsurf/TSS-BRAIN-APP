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

const seqTag = (c: SequencePageConfig) => (c.eyebrow ? c.title : `#${c.number} ${c.title}`);

/** Todas las opciones de UNA secuencia: cada momento de cada paso, la
 *  secuencia completa y "empezar la siguiente". `trainedIds` va primero. */
export function focusOptionsForSequence(c: SequencePageConfig, stepTitles: Record<string, string> = {}, trainedIds: Set<string> = new Set()): FocusGroup {
  const all = Object.values(SEQUENCE_PAGES);
  const steps = c.stepIds.map((id) => ({ id, title: stepTitles[id] ?? id }));
  const ms = momentsByStep(c.id, steps);
  const opts: FocusOption[] = [];
  const ordered = [...steps.filter((st) => trainedIds.has(st.id)), ...steps.filter((st) => !trainedIds.has(st.id))];
  for (const st of ordered) {
    for (const m of ms[st.id] ?? []) opts.push({ label: `${st.title} · ${m.short}`, text: `${seqTag(c)} · ${st.title} · ${m.short}` });
    if (!(ms[st.id] ?? []).length) opts.push({ label: st.title, text: `${seqTag(c)} · ${st.title}` });
  }
  opts.push({ label: `Whole sequence · ${seqTag(c)}`, text: `${seqTag(c)} · run the whole sequence` });
  const next = all.filter((n) => n.belt === c.belt && !n.eyebrow && n.number > c.number).sort((a, b) => a.number - b.number)[0];
  if (next) opts.push({ label: `Start ${seqTag(next)}`, text: `Start ${seqTag(next)} · ${seqTag(c)} is yours` });
  return { title: seqTag(c), options: opts };
}

/** Las opciones de lo que se entrenó hoy: las secuencias que contienen esos
 *  pasos (máximo dos), con TODOS sus momentos (los entrenados primero).
 *  Incluye las secuencias numeradas de White (kind 'entry' con número). */
export function coachFocusOptions(stepIds: string[], stepTitles: Record<string, string> = {}, workedSequenceIds: string[] = []): FocusGroup[] {
  const ids = new Set(stepIds.filter(Boolean));
  // Primero las secuencias que el alumno trabajó de verdad (sequence_id del
  // bloque, plantilla o plan simple), incluidas las entradas Blue con eyebrow.
  const worked = workedSequenceIds.map((id) => SEQUENCE_PAGES[id]).filter(Boolean);
  if (worked.length) return worked.slice(0, 3).map((c) => focusOptionsForSequence(c, stepTitles, ids));
  const all = Object.values(SEQUENCE_PAGES).filter((c) => !c.eyebrow);
  const hit = all.filter((c) => c.stepIds.some((id) => ids.has(id))).sort((a, b) => a.number - b.number).slice(0, 2);
  return hit.map((c) => focusOptionsForSequence(c, stepTitles, ids));
}
