// ═══ HASTA QUÉ CINTA VE EL COACH EL CURSO DEL ALUMNO (Marcelo 2026-09-29) ═══
// "Cada coach ve hasta su cinta": lecciones del alumno, páginas de secuencia
// y Teach it se abren hasta su max_belt_permission — MÁS la cinta de los camps
// que tiene asignados (si le dieron un Foundation, necesita el material Blue
// aunque su cinta sea menor; la nota de habilitación ya avisa eso aparte).
// Puro: se usa en el servidor y en el cliente.

import { SEQUENCE_PAGES } from '@/lib/sequence-pages';

export const BELT_RANK: Record<string, number> = { white: 1, yellow: 2, blue: 3, purple: 4, brown: 5, black: 6 };

/** 'yellow_belt' | 'yellow' → 2. Sin cinta = la más restrictiva (white). */
export function beltRankOf(belt: string | null | undefined): number {
  return BELT_RANK[String(belt ?? '').replace(/_belt$/, '')] ?? 1;
}

// La cinta de cada sección del curso del ALUMNO. Una sección que no está acá
// no se abre (más seguro que abrirla por omisión).
const STUDENT_SECTION_BELT: Record<string, string> = {
  pre_course_fundamentals: 'white', pre_course_values: 'white', wb_onboarding: 'white', white_belt: 'white',
  yb_onboarding: 'yellow', yellow_belt: 'yellow',
  bb_onboarding: 'blue', blue_belt: 'blue',
  purple_belt: 'purple', brown_belt: 'brown', black_belt: 'black',
};

export function studentSectionRank(section: string | null | undefined): number | null {
  const b = STUDENT_SECTION_BELT[section ?? ''];
  return b ? BELT_RANK[b] : null;
}

/** Una página de secuencia se abre desde la cinta MÁS BAJA de los cursos que
 *  la muestran (BB-NAV/BB-LINE también están en Yellow). */
export function sequencePageRank(cfg: { courseKey: string; alsoCourseKeys?: string[] }): number {
  return Math.min(...[cfg.courseKey, ...(cfg.alsoCourseKeys ?? [])].map((k) => BELT_RANK[String(k).replace(/_belt$/, '')] ?? 6));
}

// Todas las lecciones que nombra una página (pasos, prep, "Go deeper"…): se
// leen del config entero, así un link nuevo en la página no queda afuera.
const pageLessonIds = new Map<string, Set<string>>();
function lessonIdsOf(cfg: { id: string; stepIds: string[] }): Set<string> {
  let ids = pageLessonIds.get(cfg.id);
  if (!ids) {
    ids = new Set(cfg.stepIds);
    for (const m of JSON.stringify(cfg).match(/"lessonId":"[^"]+"/g) ?? []) ids.add(m.slice(12, -1));
    pageLessonIds.set(cfg.id, ids);
  }
  return ids;
}

/** ¿Esta lección del alumno sale en alguna página que el coach ve? (el link
 *  "Read the full lesson" / "Go deeper" de una página abierta nunca termina cerrado) */
export function lessonInVisiblePage(lessonId: string, rank: number): boolean {
  return Object.values(SEQUENCE_PAGES).some((c) => sequencePageRank(c) <= rank && lessonIdsOf(c).has(lessonId));
}
