import { SEQUENCE_PAGES } from './index';
import type { SequencePageConfig } from './types';

const BELT_ORDER = ['white_belt', 'yellow_belt', 'blue_belt', 'purple_belt', 'brown_belt', 'black_belt'];

/**
 * Un bloque de plan (plan simple o plantilla de camp) apunta a pasos
 * (step_ids / step_id). Esta función devuelve la PÁGINA DE SECUENCIA del
 * curso a la que pertenecen, para que coach y alumno hablen el mismo idioma:
 * "Sequence #3 · Pop-Up", no "CMS-WB-01".
 *
 * Un paso puede vivir en más de una página (STP-016 está en White #3 y en la
 * entrada Blue): gana la de la cinta del alumno, después las de abajo, y las
 * páginas de entrada al final.
 */
export function resolveSequenceForSteps(
  input: { stepIds?: string[] | null; stepId?: string | null },
  belt: string | null | undefined,
): SequencePageConfig | null {
  const myBelt = BELT_ORDER.indexOf(String(belt ?? 'white_belt'));
  const rank = (c: SequencePageConfig) => {
    const bi = BELT_ORDER.indexOf(c.belt);
    const beltScore = bi === myBelt ? 0 : bi < myBelt ? 1 + (myBelt - bi) : 10 + (bi - myBelt);
    return beltScore * 2 + (c.kind === 'entry' ? 1 : 0);
  };
  const candidates = Object.values(SEQUENCE_PAGES).slice().sort((a, b) => rank(a) - rank(b));
  const ids = Array.isArray(input.stepIds) ? input.stepIds.filter(Boolean) : [];
  if (ids.length > 0) {
    return (
      candidates.find((c) => c.stepIds.length === ids.length && c.stepIds.every((id) => ids.includes(id))) ??
      candidates.find((c) => ids.every((id) => c.stepIds.includes(id))) ??
      candidates.find((c) => ids.some((id) => c.stepIds.includes(id))) ??
      null
    );
  }
  if (input.stepId) return candidates.find((c) => c.stepIds.includes(input.stepId!)) ?? null;
  return null;
}

/** "#3 · Pop-Up" para las secuencias numeradas del curso (White 1-5,
 *  Yellow 6-7, Blue 8-13); solo el título para las entradas con rótulo
 *  propio ("Getting to the wave · 1 of 3"). Misma etiqueta para coach y
 *  alumno. */
export function sequenceDisplayName(cfg: SequencePageConfig): string {
  return cfg.eyebrow ? cfg.title : `#${cfg.number} · ${cfg.title}`;
}
