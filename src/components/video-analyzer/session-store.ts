// ═══ LA SESIÓN DEL ANALIZADOR SOBREVIVE AL CIERRE ═══
// Stanley perdió su sesión dos veces con clientes enfrente y tuvo que volver
// a buscar los videos uno por uno. Aunque bajemos los cierres, un coach en la
// playa NO puede depender de que la app nunca se caiga.
//
// Qué se guarda: la estructura del trabajo — grupos, nombres, orden de los
// clips, sus miniaturas (que ya se generan igual) y LAS ANOTACIONES por clip.
// Qué NO se guarda: el archivo de video. Un clip de iPhone son ~100 MB y el
// navegador del iPad no da para veinte de esos. El coach vuelve a elegir el
// archivo con un toque y recupera todo lo demás — incluidos sus dibujos.
//
// IndexedDB y no localStorage: localStorage tiene ~5 MB y es síncrono (traba
// la interfaz). Las miniaturas solas ya se pasarían de ese techo.

import type { Shape } from "./types";

const DB = "tss-video-analyzer";
const STORE = "sessions";
const VERSION = 1;

// ⚠ La clave lleva la IDENTIDAD de quien abrió el analizador.
// Antes era una sola clave global ("current") para todo el navegador: en el
// iPad compartido de la academia, el coach que entraba después recibía la
// sesión del anterior —con las miniaturas de los clientes de otro— y podía
// borrarla. Y el alumno, en su propio portal, veía la del coach.
// Sin identidad NO se persiste: preferimos perder la comodidad antes que
// mezclar el material de dos personas.
const keyFor = (scope: string) => `s:${scope}`;

export interface StoredClip {
  id: string;
  name: string;
  thumb?: string;
  /** true una vez que el coach volvió a elegir el archivo en esta sesión. */
  linked?: boolean;
}
export interface StoredGroup {
  id: string;
  name: string;
  clips: StoredClip[];
}
export interface StoredSession {
  groups: StoredGroup[];
  activeGroupId: string;
  currentClipId: string | null;
  /** Anotaciones por clip — la parte que más duele perder. */
  shapesByClip: Record<string, Shape[]>;
  modelShapes: Shape[];
  modelSrc: string | null;
  modelTitle: string;
  savedAt: number;
}

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    let req: IDBOpenDBRequest;
    try {
      req = indexedDB.open(DB, VERSION);
    } catch {
      return resolve(null);   // Safari en modo privado tira acá
    }
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    // Si otra pestaña bloquea el upgrade, no colgamos la app.
    setTimeout(() => resolve(null), 3000);
  });
}

export async function saveSession(scope: string, s: StoredSession): Promise<void> {
  if (!scope) return;
  const db = await open();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(s, keyFor(scope));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();   // quedarse sin cuota nunca rompe la sesión viva
      tx.onabort = () => resolve();
    });
  } finally {
    db.close();
  }
}

/**
 * OJO con la diferencia: `ok:false` es "no pude leer", que NO es lo mismo que
 * "no hay sesión". Confundirlos hacía que un fallo de lectura se tratara como
 * sesión vacía y el autoguardado la pisara — el coach perdía su trabajo sin
 * ver nunca el diálogo.
 */
export type LoadResult = { ok: true; session: StoredSession | null } | { ok: false };

export async function loadSession(scope: string): Promise<LoadResult> {
  if (!scope) return { ok: true, session: null };
  const db = await open();
  if (!db) return { ok: false };
  try {
    return await new Promise<LoadResult>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(keyFor(scope));
      req.onsuccess = () => resolve({ ok: true, session: (req.result as StoredSession) ?? null });
      req.onerror = () => resolve({ ok: false });
    });
  } finally {
    db.close();
  }
}

export async function clearSession(scope: string): Promise<void> {
  if (!scope) return;
  const db = await open();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(keyFor(scope));
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } finally {
    db.close();
  }
}

/** ¿Vale la pena ofrecer restaurar? Solo si hay trabajo real adentro. */
export function worthRestoring(s: StoredSession | null): boolean {
  if (!s) return false;
  const clips = s.groups.reduce((n, g) => n + g.clips.length, 0);
  const shapes = Object.entries(s.shapesByClip ?? {})
    .filter(([k]) => k !== "__file")
    .reduce((n, [, a]) => n + a.length, 0);
  return clips > 0 || shapes > 0;
}
