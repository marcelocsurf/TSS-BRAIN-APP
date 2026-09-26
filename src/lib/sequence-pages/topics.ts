/**
 * Temas de teoría que el coach puede poner en el plan del día, al lado de la
 * secuencia (Marcelo 2026-09-17): los Tres Círculos de Poder, el Infinite
 * Circle y los temas del curso de Blue Belt. Se guardan en
 * service_plans.topics como ids; el alumno los ve en "Next class" con Study it.
 * Los temas-lección abren LA lección (?tab=course&lesson=ID): hasta el
 * 2026-09-26 llevaban a la pestaña Course entera (Marcelo: "no me lleva al
 * tema en específico").
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
  // Pre-Course (todas las cintas): la teoría que un camp enseña en la arena.
  { id: 'lesson:PC-PRE-01', title: 'Safety Rules', belts: [], href: '?tab=course&lesson=PC-PRE-01' },
  { id: 'lesson:PC-PRE-02', title: 'Etiquette Rules', belts: [], href: '?tab=course&lesson=PC-PRE-02' },
  { id: 'lesson:ONB-06', title: 'Venue Analysis', belts: [], href: '?tab=course&lesson=ONB-06' },
  { id: 'lesson:PC-WARMUP', title: 'Warm Up', belts: [], href: '?tab=course&lesson=PC-WARMUP' },
  { id: 'lesson:PC-PRE-04', title: 'Reading the Wave', belts: [], href: '?tab=course&lesson=PC-PRE-04' },
  { id: 'lesson:PC-PRE-09', title: 'Currents, Wind & Bottom', belts: [], href: '?tab=course&lesson=PC-PRE-09' },
  { id: 'lesson:PC-PRE-05', title: 'What to Do If You Lose the Board', belts: [], href: '?tab=course&lesson=PC-PRE-05' },
  { id: 'lesson:PC-PRE-10', title: 'Ocean & Physical Readiness', belts: [], href: '?tab=course&lesson=PC-PRE-10' },
  { id: 'lesson:ONB-05', title: 'Surf Equipment — Parts & Types', belts: [], href: '?tab=course&lesson=ONB-05' },
  { id: 'lesson:ONB-01', title: 'Goofy or Regular', belts: [], href: '?tab=course&lesson=ONB-01' },
  { id: 'lesson:BB-VALUES-01', title: 'Your Belt Values So Far', belts: ['blue'], href: '?tab=course&lesson=BB-VALUES-01' },
  { id: 'lesson:BB-ONB-01', title: 'Conscious Commitment', belts: ['blue'], href: '?tab=course&lesson=BB-ONB-01' },
];

export function topicsForBelt(belt: string | null | undefined): PlanTopic[] {
  const b = String(belt ?? '').replace(/_belt$/, '');
  return PLAN_TOPICS.filter((t) => t.belts.length === 0 || t.belts.includes(b));
}

export function topicById(id: string): PlanTopic | null {
  return PLAN_TOPICS.find((t) => t.id === id) ?? null;
}
