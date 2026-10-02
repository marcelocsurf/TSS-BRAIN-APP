// ═══ De dónde viene el usuario · una sola regla de navegación ═══
// Marcelo (2026-10-01): "quiero que los botones para fluir en el app tengan
// lógica, que den continuidad, que pueda regresar a la pantalla que es lógico".
//
// El origen viaja en el parámetro `from` como un CÓDIGO corto, nunca como una
// dirección ("seq:WB-SEQ-3:do", "plan:<camp>:2:read"). Cada "Back" lo convierte
// en una pantalla del MISMO portal con patrones fijos + el token del portal:
// no se puede usar para mandar a nadie a otro sitio. Sin código (o con uno
// inválido: un link de email o WhatsApp) el botón va adonde iba siempre.
//
// Puro TypeScript: sirve en páginas del servidor y en componentes del cliente.

import { SEQUENCE_PAGES } from '@/lib/sequence-pages';

export type SeqTab = 'think' | 'feel' | 'do' | 'review';
export type Circle = 'body' | 'board' | 'wave';
export type CoachBelt = 'white' | 'yellow' | 'blue' | 'purple' | 'brown' | 'black';

/** Un nivel más arriba: de dónde había llegado la página a la que se vuelve
 *  (así "Back" desde Let's Play cae en la página Y esa página sigue sabiendo
 *  volver al Home). Nunca más de un nivel. */
export type Parent = 'home' | 'play' | 'course';
export type StudentFrom =
  | { k: 'home' } | { k: 'play' } | { k: 'course' }
  | { k: 'seq'; id: string; tab?: SeqTab; parent?: Parent }
  | { k: 'circles'; circle?: Circle; parent?: Parent }
  | { k: 'loop'; side?: 'fs' | 'bs'; parent?: Parent }
  | { k: 'lesson'; id: string }
  | { k: 'plan'; seq: string; mode: 'sequence_run' | 'step_focus'; focus?: string };

export type CoachFrom =
  | { k: 'home' }
  /** La lista de clases de la pestaña Plan (sin una clase abierta). */
  | { k: 'plans' }
  /** `home` = la clase se abrió desde el Home ("Run today"): su Back vuelve al Home. */
  | { k: 'plan'; camp: string; day?: number; view: 'read' | 'run'; why?: 'plan' | 'today' | 'close'; home?: true }
  | { k: 'course'; belt: CoachBelt | 'pre'; view?: 'course' | 'plates' | 'videos' }
  | { k: 'circles'; belt?: 'yellow' | 'blue' }
  | { k: 'loop'; side?: 'fs' | 'bs' }
  /** La página de la secuencia con TODO lo suyo: la voz (course), el detalle
   *  abierto (focus) y de dónde había llegado (up: el plan, el índice…). */
  | { k: 'seq'; id: string; tab?: SeqTab; course?: string; focus?: string; up?: Exclude<CoachFrom, { k: 'seq' }> };

export type AnyFrom = StudentFrom | CoachFrom;
export type Back = { href: string; label: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE_RE = /^[A-Za-z0-9:._-]{1,160}$/;
const SEQ_RE = /^[A-Z0-9.-]{3,40}$/;
const LESSON_RE = /^[A-Za-z0-9._-]{2,64}$/;
// Paso ("STP-016") o elemento de página ("CIRCLE-BOARD:P1", "BB-SEQ-08:rotation").
// Sin "_": es el escape de ":" dentro del código de la página del coach.
const STEP_RE = /^[A-Z0-9-]{3,40}(:[A-Za-z0-9-]{1,16})?$/;
const SEQ_TABS: SeqTab[] = ['think', 'feel', 'do', 'review'];
const CIRCLES: Circle[] = ['body', 'board', 'wave'];
const BELTS: CoachBelt[] = ['white', 'yellow', 'blue', 'purple', 'brown', 'black'];
const PARENTS: Parent[] = ['home', 'play', 'course'];
const COURSE_KEY_RE = /^(white|yellow|blue|purple|brown|black)_belt$/;
// El foco puede llevar ":" (un elemento: "CIRCLE-BOARD:P1"); dentro del código
// de la página del coach va con "_" para no partir el código.
const escFocus = (f: string) => f.replace(/:/g, '_');
const unescFocus = (f: string) => f.replace(/_/g, ':');

const isSeq = (id: string | undefined): id is string => !!id && SEQ_RE.test(id) && !!SEQUENCE_PAGES[id];
const pick = <T extends string>(v: string | undefined, list: readonly T[]): T | undefined => (v && (list as readonly string[]).includes(v) ? (v as T) : undefined);

/** El código que viaja en `from`. Las partes vacías se omiten desde el final. */
export function encodeFrom(o: AnyFrom): string {
  const parts: (string | number | undefined)[] = (() => {
    switch (o.k) {
      case 'seq': {
        const c = o as any;
        // Coach: seq:ID:TAB:COURSE:FOCUS:<código de up>. Alumno: seq:ID:TAB:PARENT.
        if (c.course || c.focus || c.up) return ['seq', o.id, o.tab, c.course, c.focus ? escFocus(c.focus) : undefined, ...(c.up ? [encodeFrom(c.up)] : [])];
        return ['seq', o.id, o.tab, c.parent];
      }
      case 'circles': return 'belt' in o ? ['circles', o.belt] : ['circles', (o as any).circle, (o as any).parent];
      case 'loop': return ['loop', (o as any).side, (o as any).parent];
      case 'lesson': return ['lesson', o.id];
      case 'plan': return 'camp' in o ? ['plan', o.camp, o.day, o.view, o.why, o.home ? 'home' : undefined] : ['plan', o.seq, o.mode, o.focus];
      case 'course': return 'belt' in o ? ['course', o.belt, o.view] : ['course'];
      default: return [o.k];
    }
  })();
  while (parts.length > 1 && (parts[parts.length - 1] === undefined || parts[parts.length - 1] === '')) parts.pop();
  return parts.map((p) => (p === undefined ? '' : String(p))).join(':');
}

/** Lee `from`. Cualquier cosa que no sea un código conocido y válido → null. */
export function parseFrom(raw: unknown, portal: 'student'): StudentFrom | null;
export function parseFrom(raw: unknown, portal: 'coach'): CoachFrom | null;
export function parseFrom(raw: unknown, portal: 'student' | 'coach'): AnyFrom | null {
  if (typeof raw !== 'string' || !CODE_RE.test(raw)) return null;
  const [k, a, b, c, d] = raw.split(':');
  if (portal === 'student') {
    switch (k) {
      case 'home': case 'play': case 'course': return a === undefined ? ({ k } as StudentFrom) : null;
      case 'loop': {
        // loop:SIDE:PARENT (antes loop:PARENT): el lado es opcional.
        const side = pick(a, ['fs', 'bs'] as const);
        const parent = pick(side || a === '' ? b : a, PARENTS);
        return { k, ...(side ? { side } : {}), ...(parent ? { parent } : {}) };
      }
      case 'seq': return isSeq(a) ? { k, id: a, ...(pick(b, SEQ_TABS) ? { tab: pick(b, SEQ_TABS) } : {}), ...(pick(c, PARENTS) ? { parent: pick(c, PARENTS) } : {}) } : null;
      case 'circles': return { k, ...(pick(a, CIRCLES) ? { circle: pick(a, CIRCLES) } : {}), ...(pick(b, PARENTS) ? { parent: pick(b, PARENTS) } : {}) };
      case 'lesson': return a && LESSON_RE.test(a) ? { k, id: a } : null;
      case 'plan': {
        // El paso/foco puede llevar ":" (un elemento de página: "CIRCLE-BOARD:P1").
        const focus = [c, d].filter(Boolean).join(':') || undefined;
        if (!isSeq(a) && a !== 'THREE-CIRCLES') return null;
        if (b !== 'sequence_run' && b !== 'step_focus') return null;
        if (focus && !STEP_RE.test(focus)) return null;
        return { k, seq: a, mode: b, ...(focus ? { focus } : {}) };
      }
      default: return null;
    }
  }
  switch (k) {
    case 'home': case 'plans': return a === undefined ? ({ k } as CoachFrom) : null;
    case 'loop': { const side = pick(a, ['fs', 'bs'] as const); return { k, ...(side ? { side } : {}) }; }
    case 'plan': {
      if (!a || !UUID_RE.test(a)) return null;
      const day = b && /^\d{1,2}$/.test(b) && Number(b) >= 1 && Number(b) <= 90 ? Number(b) : undefined;
      const view = c === 'run' ? 'run' : 'read';
      const why = pick(d, ['plan', 'today', 'close'] as const);
      const home = raw.split(':')[5] === 'home';
      return { k, camp: a.toLowerCase(), ...(day ? { day } : {}), view, ...(why ? { why } : {}), ...(home ? { home: true as const } : {}) };
    }
    case 'course': {
      const belt = a === 'pre' ? 'pre' as const : pick(a, BELTS);
      const view = pick(b, ['course', 'plates', 'videos'] as const);
      return belt ? { k, belt, ...(view ? { view } : {}) } : null;
    }
    case 'circles': { const belt = pick(a, ['yellow', 'blue'] as const); return { k, ...(belt ? { belt } : {}) }; }
    case 'seq': {
      if (!isSeq(a)) return null;
      const parts = raw.split(':');
      const course = parts[3] && COURSE_KEY_RE.test(parts[3]) ? parts[3] : undefined;
      const focus = parts[4] ? unescFocus(parts[4]) : undefined;
      const upRaw = parts.slice(5).join(':');
      const up = upRaw ? parseFrom(upRaw, 'coach') : null;
      return {
        k, id: a,
        ...(pick(b, SEQ_TABS) ? { tab: pick(b, SEQ_TABS) } : {}),
        ...(course ? { course } : {}),
        ...(focus && STEP_RE.test(focus) ? { focus } : {}),
        ...(up && up.k !== 'seq' ? { up } : {}),
      };
    }
    default: return null;
  }
}

/** Agrega `from=` a un link interno (antes del #). Sin origen, el link queda igual. */
export function withFrom(href: string, o: AnyFrom | null | undefined): string {
  if (!o) return href;
  const hashAt = href.indexOf('#');
  const base = hashAt >= 0 ? href.slice(0, hashAt) : href;
  const hash = hashAt >= 0 ? href.slice(hashAt) : '';
  const clean = base.replace(/([?&])from=[^&]*(&|$)/, (_m, p1, p2) => (p2 ? p1 : '')).replace(/[?&]$/, '');
  return `${clean}${clean.includes('?') ? '&' : '?'}from=${encodeURIComponent(encodeFrom(o))}${hash}`;
}

function withQuery(path: string, q: Record<string, string | undefined>): string {
  const parts = Object.entries(q).filter(([, v]) => !!v).map(([k, v]) => `${k}=${encodeURIComponent(v!)}`);
  return parts.length ? `${path}?${parts.join('&')}` : path;
}

/** El nombre corto de una secuencia para un botón ("#3 · Pop-Up"). */
function seqName(id: string): string {
  const cfg = SEQUENCE_PAGES[id];
  if (!cfg) return 'The sequence';
  if (cfg.kind === 'circle' || cfg.kind === 'tool' || cfg.eyebrow) return cfg.title;
  return `#${cfg.number} · ${cfg.title}`;
}

/** Adónde vuelve un "Back" del portal del alumno. `fallback` = adónde iba antes. */
export function studentBack(o: StudentFrom | null, token: string, fallback: StudentFrom): Back {
  const at = o ?? fallback;
  if (!UUID_RE.test(token)) return { href: '/', label: 'Back' };
  const root = `/portal/${token}`;
  switch (at.k) {
    case 'home': return { href: `${root}?tab=home`, label: 'Home' };
    case 'play': return { href: `${root}?tab=sequence`, label: "Let's Play" };
    case 'course': return { href: `${root}?tab=course`, label: 'Course' };
    case 'seq': return { href: withQuery(`${root}/seq/${encodeURIComponent(at.id)}`, { tab: at.tab, from: at.parent }), label: seqName(at.id) };
    case 'circles': return { href: withQuery(`${root}/circles`, { circle: at.circle, from: at.parent }), label: 'The Three Circles' };
    case 'loop': return { href: withQuery(`${root}/loop`, { side: at.side, from: at.parent }), label: 'The Infinite Circle' };
    case 'lesson': return { href: `${root}?tab=course&lesson=${encodeURIComponent(at.id)}`, label: 'The lesson' };
    case 'plan': return {
      href: `${root}?tab=sequence&seq=${encodeURIComponent(at.seq)}&mode=${at.mode}${at.focus ? `&focus=${encodeURIComponent(at.focus)}` : ''}`,
      label: 'Your plan',
    };
  }
}

/** Adónde vuelve un "Back" del portal del coach. `fallback` = adónde iba antes.
 *  row: la fila del índice de la que salió (#row-<id>, 2026-10-01), solo si se
 *  vuelve al índice en la vista Course. */
export function coachBack(o: CoachFrom | null, token: string, fallback: CoachFrom, row?: string): Back {
  const at = o ?? fallback;
  if (!UUID_RE.test(token)) return { href: '/', label: 'Back' };
  const root = `/coach-portal/${token}`;
  switch (at.k) {
    case 'home': return { href: `${root}?tab=home`, label: 'Home' };
    case 'plans': return { href: `${root}?tab=plan`, label: 'Your classes' };
    case 'plan': return {
      href: `${root}?tab=plan&camp=${at.camp}${at.day ? `&day=${at.day}` : ''}&view=${at.view}${at.home ? '&from=home' : ''}`,
      label: at.why === 'close' ? 'The close' : at.why === 'today' || at.view === 'run' ? "Today's plan" : 'The camp plan',
    };
    case 'course': return {
      href: `${withQuery(`${root}/course`, { belt: at.belt, view: at.view })}${row && LESSON_RE.test(row) && (at.view ?? 'course') === 'course' ? `#row-${row}` : ''}`,
      label: 'Courses',
    };
    case 'circles': return { href: `${root}/circles${at.belt ? `?belt=${at.belt}` : ''}`, label: 'The Three Circles' };
    case 'loop': return { href: withQuery(`${root}/loop`, { side: at.side }), label: 'The Infinite Circle' };
    case 'seq': return {
      href: withQuery(`${root}/seq/${encodeURIComponent(at.id)}`, { tab: at.tab, course: at.course, focus: at.focus, from: at.up ? encodeFrom(at.up) : undefined }),
      label: seqName(at.id),
    };
  }
}
