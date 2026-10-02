// ═══ Estado efímero del portal (pestaña, lección abierta) ═══
//
// Bug reproducido el 2026-09-09 (Marcelo: "cada vez que le doy clic a un
// tema o un curso me traba y me manda a home"): cualquier acción del servidor
// con revalidatePath (marcar leída una lección, cambiar de curso, guardar
// una sesión) refresca la ruta, y con loading.tsx en /portal/[token] el
// segmento se vuelve a montar desde cero: PortalTabs arranca en Home, con la
// guía rápida abierta y la lección cerrada. La URL ya no trae ?tab= porque
// se limpia al entrar.
//
// Solución: guardar en sessionStorage la pestaña y la lección abiertas con
// una marca de tiempo, y restaurarlas al montar SOLO si son recientes (un
// remount por refresh tarda segundos). Una recarga minutos después arranca
// en Home como siempre: nada queda pegado.

// 10 minutos: cubre cualquier refresh por acción y la marca se renueva con
// cada toque (touchPortalState), así una sesión larga en Course no caduca.
const TTL_MS = 10 * 60_000;

export interface PortalEphemeralState {
  tab?: string | null;
  lesson?: string | null;
  /** De dónde vino la lección abierta (código de src/lib/nav/origin.ts)… */
  lessonFrom?: string | null;
  /** …y para qué lección vale ese origen. */
  lessonFromFor?: string | null;
  /** Lecciones abiertas desde un banner (STP-002 → Warm Up): la de arriba y las de abajo. */
  lessonStack?: { top: string; stack: string[] } | null;
  /** Grupos abiertos de la lista del Course (2026-10-01). */
  courseGroups?: string[] | null;
  t: number;
}

function key(token: string) {
  return `tss_portal_state_${token}`;
}

export function loadPortalState(token: string): PortalEphemeralState | null {
  try {
    const raw = sessionStorage.getItem(key(token));
    if (!raw) return null;
    const s = JSON.parse(raw) as PortalEphemeralState;
    if (!s || typeof s.t !== 'number' || Date.now() - s.t > TTL_MS) return null;
    return s;
  } catch {
    return null;
  }
}

export function savePortalState(token: string, patch: Partial<Omit<PortalEphemeralState, 't'>>) {
  try {
    const prev = loadPortalState(token) ?? { t: 0 };
    const next: PortalEphemeralState = { ...prev, ...patch, t: Date.now() };
    sessionStorage.setItem(key(token), JSON.stringify(next));
  } catch {
    /* sin sessionStorage no hay restauración; nunca rompe el portal */
  }
}

/** Renueva la marca de tiempo sin cambiar nada (se llama al tocar la pantalla). */
export function touchPortalState(token: string) {
  try {
    const raw = sessionStorage.getItem(key(token));
    if (!raw) return;
    const s = JSON.parse(raw) as PortalEphemeralState;
    sessionStorage.setItem(key(token), JSON.stringify({ ...s, t: Date.now() }));
  } catch { /* nada */ }
}

// ═══ Última lección abierta (continuidad, 2026-09-25) ═══
// Aparte del estado efímero de arriba: vive en localStorage SIN caducidad,
// por token. Sirve para la tarjeta "Continue where you left off" del Course,
// nunca para abrir una lección sola.
function lastKey(token: string) {
  return `tss_last_lesson_${token}`;
}

export function saveLastLesson(token: string, lessonId: string) {
  try { localStorage.setItem(lastKey(token), lessonId); } catch { /* nada */ }
}

export function loadLastLesson(token: string): string | null {
  try { return localStorage.getItem(lastKey(token)); } catch { return null; }
}

export function clearLastLesson(token: string) {
  try { localStorage.removeItem(lastKey(token)); } catch { /* nada */ }
}

// ═══ Lección en curso de completarse (2026-09-25, revisión) ═══
// "Mark as done" revalida el layout y el portal se vuelve a montar; la URL
// puede volver a la canónica de Next (la del deep link original) y el curso
// reabría OTRA lección. Se marca la que se está completando justo antes de
// guardar y, al montar, esa manda durante 60 s.
export function markLessonCompleting(token: string, lessonId: string) {
  try { sessionStorage.setItem(`tss_completing_${token}`, JSON.stringify({ id: lessonId, t: Date.now() })); } catch { /* nada */ }
}
export function takeLessonCompleting(token: string): string | null {
  try {
    const k = `tss_completing_${token}`;
    const raw = sessionStorage.getItem(k);
    if (!raw) return null;
    sessionStorage.removeItem(k);
    const v = JSON.parse(raw) as { id?: string; t?: number };
    if (!v?.id || typeof v.t !== 'number' || Date.now() - v.t > 60_000) return null;
    return v.id;
  } catch { return null; }
}

// ═══ Plan de Let's Play a medio llenar (Marcelo 2026-10-01) ═══
// "Rehearse it on land first" sale a la página de la secuencia; al volver
// ("‹ Your plan" o el atrás del teléfono) el plan reabre con lo que ya había
// llenado. Por pestaña, 30 min; se borra al guardar o cancelar el plan.
const PLAN_DRAFT_TTL = 30 * 60_000;
/** Clave = cómo se abrió el plan, normalizada igual que page.tsx rearma ?seq=&mode=&focus=
 *  (step_focus sin un foco válido vuelve como la línea completa). */
export function planDraftKey(token: string, seq: string, mode: string, focus: string | null | undefined): string {
  const f = mode === 'step_focus' && focus && /^[A-Z0-9-]{3,20}$/.test(focus) ? focus : 'run';
  return `tss_plan_draft_${token}:${seq}:${f}`;
}
export function savePlanDraft(key: string, value: object) {
  try { sessionStorage.setItem(key, JSON.stringify({ ...value, t: Date.now() })); } catch { /* sin storage, sin borrador */ }
}
export function loadPlanDraft<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || typeof d.t !== 'number' || Date.now() - d.t > PLAN_DRAFT_TTL) { sessionStorage.removeItem(key); return null; }
    return d as T;
  } catch { return null; }
}
export function clearPlanDraft(key: string) { try { sessionStorage.removeItem(key); } catch { /* nada */ } }

// ═══ Custom Session en curso (Marcelo 2026-10-01) ═══
// "Start Session" crea la fila ANTES del agua; cerrar el app o cambiar de
// pestaña perdía el "Finish & review". En el teléfono (localStorage), 24 h, por token.
export type CustomInProgress = { id: string; focus: string; duration: number; t: number };
const CUSTOM_TTL = 24 * 3600_000;
const customKey = (token: string) => `tss_custom_in_progress_${token}`;
export function saveCustomInProgress(token: string, v: Omit<CustomInProgress, 't'>) {
  try { localStorage.setItem(customKey(token), JSON.stringify({ ...v, t: Date.now() })); } catch { /* nada */ }
}
export function loadCustomInProgress(token: string): CustomInProgress | null {
  try {
    const raw = localStorage.getItem(customKey(token));
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (!v || typeof v.id !== 'string' || !v.id || typeof v.t !== 'number' || Date.now() - v.t > CUSTOM_TTL) {
      localStorage.removeItem(customKey(token));
      return null;
    }
    return {
      id: v.id,
      focus: typeof v.focus === 'string' ? v.focus : '',
      duration: typeof v.duration === 'number' && v.duration > 0 ? v.duration : 30,
      t: v.t,
    };
  } catch { return null; }
}
export function clearCustomInProgress(token: string) {
  try { localStorage.removeItem(customKey(token)); } catch { /* nada */ }
}
