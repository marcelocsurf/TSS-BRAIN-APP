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
