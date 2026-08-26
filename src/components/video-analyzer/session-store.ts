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
const KEY = "current";
const VERSION = 1;

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

export async function saveSession(s: StoredSession): Promise<void> {
  const db = await open();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(s, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();   // quedarse sin cuota nunca rompe la sesión viva
      tx.onabort = () => resolve();
    });
  } finally {
    db.close();
  }
}

export async function loadSession(): Promise<StoredSession | null> {
  const db = await open();
  if (!db) return null;
  try {
    return await new Promise<StoredSession | null>((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as StoredSession) ?? null);
      req.onerror = () => resolve(null);
    });
  } finally {
    db.close();
  }
}

export async function clearSession(): Promise<void> {
  const db = await open();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(KEY);
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
  const shapes = Object.values(s.shapesByClip ?? {}).reduce((n, a) => n + a.length, 0);
  return clips > 0 || shapes > 0;
}
