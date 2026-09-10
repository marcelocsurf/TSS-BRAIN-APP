// ═══ Stance del alumno → hacia dónde va la ola en el tablero ═══
// Marcelo (2026-09-10): "si es goofy y muestra frontside que muestre una ola
// izquierda; si es regular, derecha — solo invertir la dirección".
// El tablero se dibuja como REGULAR FRONTSIDE (la ola va hacia la derecha),
// que es lo mismo que goofy backside. Se espeja en los otros dos casos.
import type { SequenceSide } from '@/lib/constants/learning-blocks';

export function isGoofy(student: { stance?: string | null; goofy_or_regular?: string | null } | null | undefined): boolean {
  const v = `${student?.stance ?? ''} ${student?.goofy_or_regular ?? ''}`;
  return /goofy/i.test(v);
}

/** true = espejar el tablero (la ola va hacia la izquierda). */
export function boardFlip(side: SequenceSide | null | undefined, goofy: boolean): boolean {
  if (!side) return false;
  const fs = side === 'fs' || side === 'both';
  return fs ? goofy : !goofy;
}
