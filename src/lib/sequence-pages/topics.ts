/**
 * Temas de teoría que el coach puede poner en el plan del día, al lado de la
 * secuencia (Marcelo 2026-09-17): los Tres Círculos de Poder, el Infinite
 * Circle y los temas del curso de Blue Belt. Se guardan en
 * service_plans.topics como ids; el alumno los ve en "Next class" con Study it.
 * Los temas-lección abren LA lección (?tab=course&lesson=ID): hasta el
 * 2026-09-26 llevaban a la pestaña Course entera (Marcelo: "no me lleva al
 * tema en específico").
 */
import { SHARED_PRE_COURSE_SECTIONS } from '@/lib/constants/courses';

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

/** ¿El alumno tiene lo que abre este tema? (2026-10-01) Mismas compuertas que
 *  /circles (Yellow o Blue), /loop (Blue) y el Course: los temas de todas las
 *  cintas (belts: []) abren con cualquier curso; los de una cinta, con ESE curso.
 *  `open` = cursos sin candado (data.ownedBelts: 'blue_belt'…), como seqPageHref. */
export function topicOpenFor(
  topicId: string,
  who: { open: readonly string[]; anyCourse: boolean; courseLocked?: boolean; lessonSection?: string | null },
): boolean {
  const t = topicById(topicId);
  if (!t) return false;
  if (t.id === 'circles') return who.open.includes('yellow_belt') || who.open.includes('blue_belt');
  if (t.id === 'loop') return who.open.includes('blue_belt');
  if (t.belts.length) return t.belts.some((b) => who.open.includes(`${b}_belt`));
  // Bajo candado de camp el Course solo abre el Pre-Course (CourseTab).
  if (who.courseLocked && who.lessonSection && !(SHARED_PRE_COURSE_SECTIONS as readonly string[]).includes(who.lessonSection)) return false;
  return who.anyCourse;
}

/** El MISMO tema, del lado del coach (pasos 2 y 3 de unificar, 2026-09-29):
 *  el plan del día abre la lección exacta en su portal, igual que el "Study it"
 *  del alumno abre la suya; los Tres Círculos y el Infinite Circle abren las
 *  mismas páginas que ve el alumno, en modo coach. */
export function coachTopicHref(topic: PlanTopic, token: string): string | null {
  if (topic.id.startsWith('lesson:')) return `/coach-portal/${token}?tab=courses&lesson=${topic.id.slice('lesson:'.length)}`;
  if (topic.id === 'circles') return `/coach-portal/${token}/circles`;
  if (topic.id === 'loop') return `/coach-portal/${token}/loop`;
  return null;
}
