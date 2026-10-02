// ═══ Pasos compartidos · una secuencia vale cuando se TRABAJÓ (Marcelo 2026-10-02) ═══
//
// Power Stance / Posture (STP-018) y Foot Position 1 (STP-035) viven en las
// seis secuencias de Blue (#8–#13). Con "la secuencia vale su paso más flojo",
// un coach que puso Posture en 3★ trabajando #8 dejaba las SEIS en 3★
// ("empezar por Power Stance / Posture"), también las que nunca se vieron. Eso
// confunde al alumno.
//
// Regla: una secuencia numerada (#1–#13) muestra estrella o estado solo si se
// TRABAJÓ — tiene nota en al menos uno de SUS pasos propios (los que no
// comparte con otra secuencia), o el alumno la corrió en Let's Play. Si no,
// está "sin empezar": sin estrella y en 'unrated', aunque sus pasos
// compartidos tengan nota. Adentro, el paso compartido conserva su estrella
// con "visto en #8" / "paso compartido" (las técnicas se conectan entre
// secuencias, y eso a Marcelo le gusta).
//
// Fuera de la regla (se leen como siempre):
//   · entradas (BB-NAV, BB-CATCH, BB-LINE), Foundation y Closing
//   · los Tres Círculos (CIRCLE-*, THREE-CIRCLES) y la herramienta TOOL-MOMENTUM
//   · una secuencia sin pasos propios (todos compartidos)
//
// Las "casas" de un paso son las secuencias numeradas Y los Tres Círculos:
// una estrella puesta sobre un círculo escribe sus pasos reales (STP-047 Hold,
// STP-022 Turn, STP-033 Wave Stages), y si el círculo no contara como casa,
// esa estrella "empezaría" #12, White #4 o Yellow #6 sin haberlas visto.
//
// La regla de aprobación NO cambia (4★ en cada paso del catálogo) y nada de
// esto se escribe en la base: es solo cómo se LEE. Pura: sin base, sin React.
// Probada en src/test/pure.test.ts.

import { SEQUENCE_PAGES } from '@/lib/sequence-pages';
import type { SequencePageConfig } from '@/lib/sequence-pages/types';
import { SEQUENCE_ROLE, sequencePrefix } from '@/lib/constants/learning-blocks';

type StarsOf = (stepId: string) => number | null | undefined;

/** Las secuencias numeradas del método (#1–#13): las únicas a las que aplica la regla. */
function isNumberedPage(cfg: SequencePageConfig): boolean {
  return !SEQUENCE_ROLE[cfg.id] && cfg.kind !== 'circle' && cfg.kind !== 'tool'
    && Number.isInteger(cfg.number) && cfg.number >= 1 && cfg.number <= 13;
}

const NUMBERED: SequencePageConfig[] = Object.values(SEQUENCE_PAGES)
  .filter(isNumberedPage)
  .sort((a, b) => a.number - b.number);
const NUMBERED_IDS = new Set(NUMBERED.map((c) => c.id));

/** Paso → las secuencias donde vive (numeradas #1–#13 + los Tres Círculos). */
export const STEP_HOMES: Readonly<Record<string, readonly string[]>> = (() => {
  const out: Record<string, string[]> = {};
  for (const cfg of Object.values(SEQUENCE_PAGES)) {
    if (!isNumberedPage(cfg) && cfg.kind !== 'circle') continue;
    for (const id of cfg.stepIds) {
      const homes = (out[id] ??= []);
      if (!homes.includes(cfg.id)) homes.push(cfg.id);
    }
  }
  return out;
})();

/** true = el paso vive en dos o más secuencias (p. ej. STP-018 en #3, #8–#13 y el Círculo 1). */
export function isSharedStep(stepId: string): boolean {
  return (STEP_HOMES[stepId]?.length ?? 0) >= 2;
}

/** ¿La regla aplica a esta secuencia? Solo a las numeradas #1–#13. */
export function workedRuleApplies(seqId: string | null | undefined): boolean {
  return !!seqId && NUMBERED_IDS.has(seqId);
}

/** Los pasos PROPIOS de la secuencia: los que no viven en ninguna otra
 *  (un paso sin casa conocida cuenta como propio). */
export function ownStepIds(seqId: string, stepIds: readonly string[]): string[] {
  return stepIds.filter((id) => (STEP_HOMES[id] ?? []).every((h) => h === seqId));
}

/** ¿La fila de student_sequence_ratings es de un RUN? Un run siempre guarda
 *  la estrella de la secuencia; un foco que quedó "working" crea la fila solo
 *  con held_back_step_id (lets-play.ts) y eso no es haberla corrido. */
export function sequenceRowRan(
  row: { current_rating?: number | null; rating_fs?: number | null; rating_bs?: number | null } | null | undefined,
): boolean {
  return !!row && (row.current_rating != null || row.rating_fs != null || row.rating_bs != null);
}

/** ¿Se trabajó la secuencia? Fuera de la regla, o sin pasos propios, siempre
 *  true (se lee como hasta hoy). Si no: nota en algún paso propio, o un run
 *  del alumno (`ran`: sequenceRowRan — un run bajo la barra solo escribe los
 *  pasos que marcó). */
export function isSequenceWorked(
  seqId: string,
  stepIds: readonly string[],
  starsOf: StarsOf,
  opts: { ran?: boolean } = {},
): boolean {
  if (!workedRuleApplies(seqId)) return true;
  const own = ownStepIds(seqId, stepIds);
  if (own.length === 0) return true;
  if (opts.ran) return true;
  return own.some((id) => starsOf(id) != null);
}

/** Las numeradas que de verdad se trabajaron (para decir dónde se vio un
 *  paso compartido). Una sin pasos propios entra solo si algo suyo tiene nota. */
export function workedNumberedSequences(starsOf: StarsOf, ranIds?: ReadonlySet<string>): Set<string> {
  const out = new Set<string>();
  for (const cfg of NUMBERED) {
    if (ranIds?.has(cfg.id)) { out.add(cfg.id); continue; }
    const own = ownStepIds(cfg.id, cfg.stepIds);
    if ((own.length ? own : cfg.stepIds).some((id) => starsOf(id) != null)) out.add(cfg.id);
  }
  return out;
}

/** Dónde se vio un paso compartido, visto desde `seqId`:
 *  null = no aplica (paso propio, o secuencia fuera de la regla);
 *  [] = compartido, origen desconocido (o `seqId` también se trabajó);
 *  ['#3', '#8'] = las OTRAS numeradas trabajadas que lo contienen, solo
 *  desde una sin empezar. Se infiere: la nota del paso no guarda en qué
 *  secuencia se puso (student_step_ratings no tiene columna de secuencia). */
export function seenInLabels(stepId: string, seqId: string, worked: ReadonlySet<string>): string[] | null {
  if (!workedRuleApplies(seqId)) return null;
  const homes = STEP_HOMES[stepId] ?? [];
  if (!homes.some((h) => h !== seqId)) return null;
  // Si ESTA secuencia se trabajó, la estrella pudo ponerse acá mismo: el
  // origen es desconocido ("paso compartido"), no "visto en" otra.
  if (worked.has(seqId)) return [];
  return NUMBERED
    .filter((c) => c.id !== seqId && worked.has(c.id) && homes.includes(c.id))
    .map((c) => sequencePrefix(c.id, c.number))
    .filter((p): p is string => !!p);
}

/** El rótulo del paso compartido: "seen in #8 · #10" / "shared step" (alumno,
 *  inglés) o "visto en #8 · #10" / "paso compartido" (coach). null = no lleva.
 *  Quien lo muestra decide mostrarlo solo cuando el paso tiene estrella. */
export function sharedStepTag(
  stepId: string,
  seqId: string,
  worked: ReadonlySet<string>,
  lang: 'en' | 'es' = 'en',
): string | null {
  const labels = seenInLabels(stepId, seqId, worked);
  if (labels === null) return null;
  if (labels.length === 0) return lang === 'es' ? 'paso compartido' : 'shared step';
  return `${lang === 'es' ? 'visto en' : 'seen in'} ${labels.join(' · ')}`;
}
