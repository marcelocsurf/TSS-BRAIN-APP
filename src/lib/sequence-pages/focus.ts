// ═══ El puente del plan al material: ¿qué detalle abrir? (2026-09-30) ═══
// "How to teach it →" (plan del día) y "How to teach this →" (cierre) mandan
// ?focus=<id>: un paso (STP-029), o un elemento de círculo o de la #8/#9
// ('CIRCLE-BOARD:P1', 'BB-SEQ-08:rotation'). Antes se traducía con
// elementTitle, que en una secuencia normal devuelve null → la página llegaba
// sin la banda "You came here for" en 14 de las 19. Esto busca el detalle por
// id, sin inventar mapas: 1) el detalle cuyo "Go deeper" es ese paso;
// 2) el elemento con ese id (su título, y el detalle de su paso); 3) por
// palabras del título, como hacía TeachKit.
import type { SequencePageConfig } from './types';

export interface FocusMatch { key: string | null; title: string | null }

const norm = (t: string) => new Set(String(t).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3));

/** El detalle que más palabras comparte con un título (≥ 2), o null. */
export function detailByTitle(cfg: SequencePageConfig, title: string | null | undefined): string | null {
  if (!title) return null;
  const want = norm(title);
  let best: { key: string; score: number } | null = null;
  for (const d of cfg.details ?? []) {
    const score = [...norm(d.title)].filter((w) => want.has(w)).length;
    if (score >= 2 && (!best || score > best.score)) best = { key: d.key, score };
  }
  return best?.key ?? null;
}

export function detailForFocus(cfg: SequencePageConfig, focusId: string | null | undefined, stepTitle?: string | null): FocusMatch | null {
  if (!focusId) return null;
  const byStep = (id: string) => (cfg.details ?? []).find((d) => d.deeper?.lessonId === id) ?? null;
  // 1) Un paso: el detalle que lleva a su lección.
  const d1 = byStep(focusId);
  if (d1) return { key: d1.key, title: d1.title };
  // 2) Un elemento (círculo, #8/#9): su título; el detalle, por su paso o por palabras.
  const el = cfg.elements?.find((e) => e.id === focusId);
  if (el) {
    const d2 = byStep(el.stepId);
    return { key: detailByTitle(cfg, el.title) ?? d2?.key ?? null, title: el.title };
  }
  // 3) Un paso de la secuencia sin detalle propio: su título, y por palabras.
  if (cfg.stepIds.includes(focusId) || stepTitle) {
    return { key: detailByTitle(cfg, stepTitle ?? null), title: stepTitle ?? null };
  }
  return null;
}
