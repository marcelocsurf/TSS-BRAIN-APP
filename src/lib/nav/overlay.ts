'use client';
// ═══ El atrás del teléfono cierra la capa abierta (Marcelo 2026-10-02) ═══
// My progress, el buzón, los lectores (ONE WAVE y las presentaciones), la guía,
// What it takes y el nivel del agua tapan toda la pantalla. No dejaban nada en
// el historial: el atrás del teléfono (o el gesto de iOS) sacaba del portal o
// cerraba el app instalada. Ahora abrir una capa agrega UNA entrada (la misma
// URL, con la marca tssOverlays = las capas abiertas, de abajo hacia arriba) y
// el atrás vuelve a la de abajo: la capa se cierra sola.
//
// Las reglas:
// 1. La entrada nueva copia el estado de Next (__NA + su árbol): el parche de
//    Next 14.2 no navega al servidor ni al abrir ni al volver (sin __NA
//    remontaba el portal con loading.tsx).
// 2. Los botones de la capa (✕, ← Home, Escape) hacen history.back(): no queda
//    una pulsación muerta. Saben que hay entrada por un ref, no por la marca
//    (un router.refresh o una acción del servidor de Next la puede borrar).
// 3. Salir de una capa a otra pestaña NUNCA hace history.back() (llegaría
//    después de la URL nueva y la desharía): la capa se cierra en el estado y
//    showTab borra la marca de la entrada.
// 4. Las pestañas (PortalTabs) y el Course ignoran el atrás que es de una capa
//    (isOverlayPop). Lo decide el listener de este módulo, registrado al
//    importarlo, ANTES que los de los componentes: React puede cerrar la capa
//    entre un listener y el siguiente, así que no se puede preguntar después.
// 5. Una entrada que nombra una capa que ya no está abierta quedó vieja (salida
//    anidada: My progress → What it takes → un paso). Se salta con otro atrás.
//    Para en la primera entrada sin marca: la de llegada nunca la lleva.
// 6. Volver después a la pestaña de abajo de las capas consume la entrada
//    convertida por la regla 3 con el atrás (backToUnder, tssUnder; abajo).
// Fuera de esto (decisión 2026-10-02): los flujos de Let's Play, ZoomImage y el
// portal del coach.
import { useCallback, useEffect, useRef } from 'react';

export const OVERLAY_KEY = 'tssOverlays';

/** Las capas que nombra una entrada del historial (abajo → arriba). */
export function overlayMarks(st: unknown): string[] {
  const v = st && typeof st === 'object' ? (st as Record<string, unknown>)[OVERLAY_KEY] : null;
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

/** La entrada nombra una capa que no está abierta: quedó vieja. */
export function isStaleEntry(marks: readonly string[], open: readonly string[]): boolean {
  return marks.some((m) => !open.includes(m));
}

/** Qué es un atrás. open = las capas abiertas al llegar; landed = las marcas de
 *  la entrada a la que se llegó. close = las que se cierran; skip = la entrada
 *  quedó vieja y se salta; overlay = el atrás es de las capas (las pestañas y el
 *  Course no se mueven). */
export function overlayPop(open: readonly string[], landed: readonly string[]): { overlay: boolean; close: string[]; skip: boolean } {
  const skip = isStaleEntry(landed, open);
  return { overlay: open.length > 0 || skip, close: open.filter((n) => !landed.includes(n)), skip };
}

/** El estado de la entrada de una capa: el de ahora (Next, Course) + __NA + las
 *  capas abiertas. tssBase no se hereda: es solo de la entrada de llegada. */
export function overlayEntry(st: unknown, open: readonly string[]): Record<string, unknown> {
  const cur = st && typeof st === 'object' ? (st as Record<string, unknown>) : {};
  const { tssBase: _base, ...rest } = cur;
  return { ...rest, __NA: true, [OVERLAY_KEY]: [...open] };
}

/** Next borró las marcas de la entrada de abajo (router.refresh, una acción del
 *  servidor que revalida) mientras sus capas siguen abiertas (2026-10-02). */
export function marksWiped(marks: readonly string[], below: readonly string[]): boolean {
  return !isStaleEntry(marks, below) && marks.length < below.length;
}

// ═══ La entrada de abajo de las capas (2026-10-02) ═══
// tssUnder = la entrada a la que vuelve el atrás cuando se cierran todas las
// capas (la que estaba al abrir la primera), con el documento que la apiló.
// Salir de una capa a otra pestaña deja su entrada convertida en esa pestaña
// (regla 3); si después el alumno vuelve a la pestaña de abajo (la barra, el
// Back del paso, Cancel, el Home de una sesión guardada), backToUnder la
// consume con el atrás en vez de reescribirla. Si no, quedaban dos entradas de
// la misma pestaña y el atrás siguiente no hacía nada. Next la borra con un
// router.refresh o un router.replace: entonces no se sabe y se reescribe como antes.
export const UNDER_KEY = 'tssUnder';
type Under = { href: string; doc: string };
function underOf(st: unknown): Under | null {
  const v = st && typeof st === 'object' ? (st as Record<string, unknown>)[UNDER_KEY] : null;
  if (!v || typeof v !== 'object') return null;
  const { href, doc } = v as Record<string, unknown>;
  return typeof href === 'string' && typeof doc === 'string' ? { href, doc } : null;
}

/** La pestaña de la entrada de abajo de las capas, si es una pestaña simple del
 *  portal (?tab=X o la portada = home) de esta ruta y de este documento (una
 *  recarga la deja en otro: el atrás recargaría la página). null = no se sabe. */
export function underTab(st: unknown, pathname: string, doc: string | null | undefined): string | null {
  const u = underOf(st);
  if (!u || !doc || u.doc !== doc) return null;
  try {
    const url = new URL(u.href);
    if (url.pathname !== pathname) return null;
    let plain = true;
    url.searchParams.forEach((_v, k) => { if (k !== 'tab') plain = false; });
    if (!plain) return null;
    return url.searchParams.get('tab') || 'home';
  } catch { return null; }
}

// Estado compartido en window: un recargado en caliente (dev) no registra un
// segundo listener con otra pila vacía. doc = este documento (una recarga trae otro).
type OverlayNav = { stack: string[]; lastPop: Event | null; lastPopWasOverlay: boolean; doc?: string };
const nav: OverlayNav | null = typeof window === 'undefined' ? null : (() => {
  const w = window as unknown as { __tssOverlayNav?: OverlayNav };
  if (!w.__tssOverlayNav) {
    const s: OverlayNav = { stack: [], lastPop: null, lastPopWasOverlay: false, doc: Math.random().toString(36).slice(2) };
    w.__tssOverlayNav = s;
    window.addEventListener('popstate', (e) => {
      const r = overlayPop(s.stack, overlayMarks(e.state));
      s.lastPop = e;
      s.lastPopWasOverlay = r.overlay;
      if (r.skip) { try { window.history.back(); } catch { /* nada */ } }
    });
  }
  return w.__tssOverlayNav;
})();

/** Este popstate es de una capa (la cerró o saltó una entrada vieja): las
 *  pestañas y el Course no se mueven. */
export function isOverlayPop(e: Event): boolean {
  return !!nav && nav.lastPop === e && nav.lastPopWasOverlay;
}

/** Ir a la pestaña `tab`: si es la de abajo de una capa de la que se salió,
 *  vuelve a esa entrada con el atrás (true) y el popstate pone la pestaña. Solo
 *  en un toque que no abre otra capa en el mismo momento (su entrada se
 *  apilaría antes de que llegue el atrás). false = reescribir esta entrada. */
export function backToUnder(tab: string): boolean {
  if (!nav) return false;
  try {
    if (underTab(window.history.state, window.location.pathname, nav.doc) !== tab) return false;
    window.history.back();
    return true;
  } catch { return false; }
}

/** Engancha una capa al atrás del teléfono. Devuelve el cierre para sus
 *  propios botones (✕, ← Home): consume la entrada con history.back().
 *  Salir de la capa a otra pantalla usa el setter crudo, nunca este cierre. */
export function useBackCloses(name: string, isOpen: boolean, close: () => void): () => void {
  // true = esta capa tiene su entrada arriba en el historial.
  const pushedRef = useRef(false);
  // true = su propio botón pidió el atrás: el próximo popstate la cierra
  // aunque la entrada de abajo la nombre (dos entradas viejas seguidas).
  const leavingRef = useRef(false);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    // Cerrada (por el atrás, por su botón o por el setter crudo): la próxima
    // vez que se abra agrega su entrada de nuevo.
    if (!isOpen) { pushedRef.current = false; leavingRef.current = false; return; }
    if (!nav) return;
    const below = [...nav.stack];
    nav.stack.push(name);
    // Ya con entrada: StrictMode corre el efecto dos veces al montar.
    if (!pushedRef.current) {
      try {
        const st = window.history.state;
        const marks = overlayMarks(st);
        // La entrada actual quedó vieja (recarga o remontaje con una capa
        // abierta): se reusa en vez de apilar otra igual (con su tssUnder).
        if (isStaleEntry(marks, below)) window.history.replaceState(overlayEntry(st, nav.stack), '', window.location.href);
        else {
          // Un router.refresh (encuesta enviada en My progress) o una acción
          // del servidor borró la marca de la capa de abajo: se le devuelve
          // antes de apilar. Si no, el atrás desde esta capa cerraba también
          // la de abajo y el siguiente no hacía nada (2026-10-02).
          if (marksWiped(marks, below)) window.history.replaceState(overlayEntry(st, below), '', window.location.href);
          const cur = window.history.state;
          const entry = overlayEntry(cur, nav.stack);
          // La primera capa anota esta entrada como la de abajo; una capa
          // encima de otra hereda la de la capa de abajo (si Next no la borró).
          const under = below.length ? underOf(cur) : (nav.doc ? { href: window.location.href, doc: nav.doc } : null);
          if (under) entry[UNDER_KEY] = under; else delete entry[UNDER_KEY];
          window.history.pushState(entry, '', window.location.href);
        }
        pushedRef.current = true;
      } catch { pushedRef.current = false; }
    }
    const onPop = (e: PopStateEvent) => {
      if (!leavingRef.current && overlayMarks(e.state).includes(name)) return;
      leavingRef.current = false;
      pushedRef.current = false;
      closeRef.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      const i = nav.stack.lastIndexOf(name);
      if (i >= 0) nav.stack.splice(i, 1);
      window.removeEventListener('popstate', onPop);
    };
  }, [isOpen, name]);
  return useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false;
      leavingRef.current = true;
      // El popstate de la entrada de abajo la cierra (onPop de arriba).
      try { window.history.back(); return; } catch { leavingRef.current = false; /* sigue: cierre directo */ }
    }
    closeRef.current();
  }, []);
}
