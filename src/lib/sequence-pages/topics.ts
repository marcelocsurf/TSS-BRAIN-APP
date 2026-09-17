/**
 * Temas de teoría que el coach puede poner en el plan del día, al lado de la
 * secuencia (Marcelo 2026-09-17): los Tres Círculos de Poder, el Infinite
 * Circle y los temas del curso de Blue Belt. Se guardan en
 * service_plans.topics como ids; el alumno los ve en "Next class" con Study it.
 */
export interface PlanTopic {
  id: string;
  title: string;
  /** Cintas para las que se ofrece (sin sufijo _belt). Vacío = todas. */
  belts: string[];
  /** Ruta dentro del portal del alumno, relativa a /portal/{token}. */
  href: string;
}

export const PLAN_TOPICS: PlanTopic[] = [
  { id: 'circles', title: 'The Three Circles of Power', belts: [], href: '/circles' },
  { id: 'loop', title: 'The Infinite Circle', belts: [], href: '/loop' },
  { id: 'lesson:BB-VALUES-01', title: 'Your Belt Values So Far', belts: ['blue'], href: '?tab=course' },
  { id: 'lesson:BB-ONB-01', title: 'Conscious Commitment', belts: ['blue'], href: '?tab=course' },
  { id: 'lesson:BB-FOUND-01', title: 'Blue Belt Foundation Sequence (17 elements)', belts: ['blue'], href: '?tab=course' },
  { id: 'lesson:BB-CONCEPTS-01', title: 'The Four Blue Belt Concepts', belts: ['blue'], href: '?tab=course' },
  { id: 'lesson:BB-MOD-INT', title: 'The Complete Blue Belt Ride', belts: ['blue'], href: '?tab=course' },
  { id: 'lesson:BB-EXIT-01', title: 'Path to Purple · Self-Evaluation', belts: ['blue'], href: '?tab=course' },
];

export function topicsForBelt(belt: string | null | undefined): PlanTopic[] {
  const b = String(belt ?? '').replace(/_belt$/, '');
  return PLAN_TOPICS.filter((t) => t.belts.length === 0 || t.belts.includes(b));
}

export function topicById(id: string): PlanTopic | null {
  return PLAN_TOPICS.find((t) => t.id === id) ?? null;
}
