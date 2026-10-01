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
  | { k: 'loop'; parent?: Parent }
  | { k: 'lesson'; id: string }
  | { k: 'plan'; seq: string; mode: 'sequence_run' | 'step_focus'; focus?: string };

export type CoachFrom =
  | { k: 'home' }
  | { k: 'plan'; camp: string; day?: number; view: 'read' | 'run'; why?: 'plan' | 'today' | 'close' }
  | { k: 'course'; belt: CoachBelt }
  | { k: 'circles'; belt?: 'yellow' | 'blue' }
  | { k: 'loop' }
  | { k: 'seq'; id: string; tab?: SeqTab };

export type AnyFrom = StudentFrom | CoachFrom;
export type Back = { href: string; label: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE_RE = /^[A-Za-z0-9:._-]{1,160}$/;
const SEQ_RE = /^[A-Z0-9.-]{3,40}$/;
const LESSON_RE = /^[A-Za-z0-9._-]{2,64}$/;
const STEP_RE = /^[A-Z0-9-]{3,40}(:[A-Z0-9]{1,12})?$/;
const SEQ_TABS: SeqTab[] = ['think', 'feel', 'do', 'review'];
const CIRCLES: Circle[] = ['body', 'board', 'wave'];
const BELTS: CoachBelt[] = ['white', 'yellow', 'blue', 'purple', 'brown', 'black'];
const PARENTS: Parent[] = ['home', 'play', 'course'];

const isSeq = (id: string | undefined): id is string => !!id && SEQ_RE.test(id) && !!SEQUENCE_PAGES[id];
const pick = <T extends string>(v: string | undefined, list: readonly T[]): T | undefined => (v && (list as readonly string[]).includes(v) ? (v as T) : undefined);

/** El código que viaja en `from`. Las partes vacías se omiten desde el final. */
export function encodeFrom(o: AnyFrom): string {
  const parts: (string | number | undefined)[] = (() => {
    switch (o.k) {
      case 'seq': return ['seq', o.id, o.tab, (o as any).parent];
      case 'circles': return 'belt' in o ? ['circles', o.belt] : ['circles', (o as any).circle, (o as any).parent];
      case 'loop': return ['loop', (o as any).parent];
      case 'lesson': return ['lesson', o.id];
      case 'plan': return 'camp' in o ? ['plan', o.camp, o.day, o.view, o.why] : ['plan', o.seq, o.mode, o.focus];
      case 'course': return 'belt' in o ? ['course', o.belt] : ['course'];
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
      case 'loop': return { k, ...(pick(a, PARENTS) ? { parent: pick(a, PARENTS) } : {}) };
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
    case 'home': case 'loop': return a === undefined ? ({ k } as CoachFrom) : null;
    case 'plan': {
      if (!a || !UUID_RE.test(a)) return null;
      const day = b && /^\d{1,2}$/.test(b) && Number(b) >= 1 && Number(b) <= 90 ? Number(b) : undefined;
      const view = c === 'run' ? 'run' : 'read';
      const why = pick(d, ['plan', 'today', 'close'] as const);
      return { k, camp: a.toLowerCase(), ...(day ? { day } : {}), view, ...(why ? { why } : {}) };
    }
    case 'course': { const belt = pick(a, BELTS); return belt ? { k, belt } : null; }
    case 'circles': { const belt = pick(a, ['yellow', 'blue'] as const); return { k, ...(belt ? { belt } : {}) }; }
    case 'seq': return isSeq(a) ? { k, id: a, ...(pick(b, SEQ_TABS) ? { tab: pick(b, SEQ_TABS) } : {}) } : null;
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
    case 'loop': return { href: withQuery(`${root}/loop`, { from: at.parent }), label: 'The Infinite Circle' };
    case 'lesson': return { href: `${root}?tab=course&lesson=${encodeURIComponent(at.id)}`, label: 'The lesson' };
    case 'plan': return {
      href: `${root}?tab=sequence&seq=${encodeURIComponent(at.seq)}&mode=${at.mode}${at.focus ? `&focus=${encodeURIComponent(at.focus)}` : ''}`,
      label: 'Your plan',
    };
  }
}

/** Adónde vuelve un "Back" del portal del coach. `fallback` = adónde iba antes. */
export function coachBack(o: CoachFrom | null, token: string, fallback: CoachFrom): Back {
  const at = o ?? fallback;
  if (!UUID_RE.test(token)) return { href: '/', label: 'Back' };
  const root = `/coach-portal/${token}`;
  switch (at.k) {
    case 'home': return { href: `${root}?tab=home`, label: 'Home' };
    case 'plan': return {
      href: `${root}?tab=plan&camp=${at.camp}${at.day ? `&day=${at.day}` : ''}&view=${at.view}`,
      label: at.why === 'close' ? 'The close' : at.why === 'today' || at.view === 'run' ? "Today's plan" : 'The camp plan',
    };
    case 'course': return { href: `${root}/course?belt=${at.belt}`, label: 'Courses' };
    case 'circles': return { href: `${root}/circles${at.belt ? `?belt=${at.belt}` : ''}`, label: 'The Three Circles' };
    case 'loop': return { href: `${root}/loop`, label: 'The Infinite Circle' };
    case 'seq': return { href: `${root}/seq/${encodeURIComponent(at.id)}${at.tab ? `?tab=${at.tab}` : ''}`, label: seqName(at.id) };
  }
}
