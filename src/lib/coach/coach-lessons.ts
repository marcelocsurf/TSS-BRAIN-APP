// ═══ Las lecciones del COACH: quién abre cuál, y qué cuenta para certificar ═══
// Puro y sin imports: lo usan el servidor (coach-portal.ts) y el cliente
// (CoachPortalTabs), y se prueba sin Supabase.

// ── QUÉ LECCIÓN DEL COACH PUEDE ABRIR ESTE COACH (fuente única, 2026-09-29) ──
// La MISMA regla arma su lista de cursos (getCoachPortalData) y protege
// abrir por link (?lesson=), rendir el quiz y marcar leída: antes solo la
// lista filtraba y un link abría un examen de otra cinta.
const COACH_SECTION_BELT: Record<string, string> = {
  coach_wb: 'white', coach_wb_master: 'white', coach_yb: 'yellow',
  coach_bb: 'blue', coach_pb: 'purple', coach_brb: 'brown', coach_blb: 'black',
};
const BELT_RANK_SHORT: Record<string, number> = { white: 1, yellow: 2, blue: 3, purple: 4, brown: 5, black: 6 };

export function coachMayOpenCoachLesson(
  coach: { course_access_scope?: string | null; max_belt_permission?: string | null },
  lesson: { id: string; course_section?: string | null },
): boolean {
  // Sin cursos (2026-09-26, Walter · Apnea): instructor de un servicio que
  // no es surf. Ve su portal (reservas, plan, espacios) pero ningún curso.
  if (coach.course_access_scope === 'none') return false;
  // Alcance restringido: instructores en formación inicial ven SOLO
  // Safety Canon + Foundations (método) hasta que se les abra el resto.
  // Tampoco los cursos de herramientas (Marcelo 2026-09-30: "no le des accesos a ellos").
  if (coach.course_access_scope === 'safety_method') {
    return lesson.id.startsWith('COACH-SAFETY-') || lesson.id.startsWith('COACH-FOUND-');
  }
  const belt = COACH_SECTION_BELT[lesson.course_section ?? ''];
  if (!belt) return true; // universal course (coach_tools incluido)
  // Sin cinta cargada = la más restrictiva (white): se gana por nivel.
  const my = BELT_RANK_SHORT[(coach.max_belt_permission || '').replace('_belt', '')] ?? 1;
  return (BELT_RANK_SHORT[belt] ?? 1) <= my;
}

export const isCoachSection = (s: string | null | undefined) => String(s ?? '').startsWith('coach');

// ── CURSOS DE HERRAMIENTAS DEL COACH (Marcelo 2026-09-30) ──
// "Son cursos para que los coaches estudien y entiendan esas herramientas y
// las puedan utilizar": Visualización primero; después Respiración, Focus…
// Van APARTE de la certificación: su propio avance, sin examen, y no cuentan
// en el "X of N", en Continue ni en el avance del Home.
export const COACH_TOOLS_SECTION = 'coach_tools';

export const isCoachToolLesson = (l: { course_section?: string | null }) => l.course_section === COACH_TOOLS_SECTION;

/** COACH-TOOL-VIS-01 → 'VIS': las lecciones de un mismo curso comparten la clave. */
export function toolCourseKey(id: string): string {
  return /^COACH-TOOL-([A-Z0-9]+)-/.exec(id)?.[1] ?? 'OTHER';
}

/** Nombre y una línea de cada curso de herramienta (del deck de Marcelo). */
export const COACH_TOOL_COURSES: Record<string, { title: string; sub: string }> = {
  VIS: { title: 'Visualization', sub: 'How your brain rehearses surfing without touching water.' },
};

/** Separa la certificación de los cursos de herramientas (en el cliente: el
 *  link ?lesson= necesita ver TODAS las lecciones del coach). */
export function splitCoachCourses<T extends { course_section?: string | null }>(courses: T[]): { cert: T[]; tools: T[] } {
  const cert: T[] = [];
  const tools: T[] = [];
  for (const c of courses) (isCoachToolLesson(c) ? tools : cert).push(c);
  return { cert, tools };
}

/** Los cursos de herramientas, cada uno con sus lecciones en orden. */
export function groupToolCourses<T extends { id: string }>(tools: T[]): { key: string; title: string; sub: string; lessons: T[] }[] {
  const out: { key: string; title: string; sub: string; lessons: T[] }[] = [];
  for (const l of tools) {
    const key = toolCourseKey(l.id);
    let g = out.find((x) => x.key === key);
    if (!g) {
      g = { key, title: COACH_TOOL_COURSES[key]?.title ?? key, sub: COACH_TOOL_COURSES[key]?.sub ?? '', lessons: [] };
      out.push(g);
    }
    g.lessons.push(l);
  }
  return out;
}
