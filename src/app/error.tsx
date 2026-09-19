'use client';

// ═══ Red de seguridad para excepciones del cliente (2026-09-19) ═══
// Antes cualquier error en el navegador mostraba la pantalla cruda de Next
// ("Application error: a client-side exception has occurred"). El caso más
// común es una pestaña abierta durante un deploy: los chunks viejos ya no
// existen y la próxima navegación revienta. Eso se arregla recargando una
// vez, solo. Para lo demás: un mensaje claro y dos botones.

import { useEffect } from 'react';

const RELOAD_KEY = 'tss_reload_once';

function looksLikeStaleBuild(err: Error & { digest?: string }): boolean {
  const m = `${err?.name ?? ''} ${err?.message ?? ''}`;
  return /ChunkLoadError|Loading chunk|dynamically imported module|Failed to fetch|import\(\)|text\/html/i.test(m);
}

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.error('[tss] client error', error);
      if (looksLikeStaleBuild(error) && !sessionStorage.getItem(RELOAD_KEY)) {
        sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
        window.location.reload();
        return;
      }
      // Después de una recarga limpia, el próximo error vuelve a poder recargar.
      const t = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
      if (t && Date.now() - t > 60_000) sessionStorage.removeItem(RELOAD_KEY);
    } catch { /* sin storage, sin auto-reload */ }
  }, [error]);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#061C2B', color: '#F7F9FA', padding: '24px 16px', fontFamily: 'var(--font-body, system-ui, sans-serif)' }}>
      <div style={{ maxWidth: 420, width: '100%' }}>
        <p style={{ fontFamily: 'var(--font-plex, monospace)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#00D2FF', margin: 0 }}>Something went wrong</p>
        <h1 style={{ fontFamily: 'var(--font-archivo, sans-serif)', fontWeight: 900, textTransform: 'uppercase', fontSize: 26, lineHeight: 1.05, margin: '6px 0 12px' }}>The page hit a wave</h1>
        <p style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(247,249,250,.8)', margin: 0 }}>
          Usually this is an update that landed while you had the app open. Reload and you are back where you were. Nothing you saved is lost.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button type="button" onClick={() => { try { sessionStorage.removeItem(RELOAD_KEY); } catch {} window.location.reload(); }}
            style={{ flex: 1, height: 46, borderRadius: 6, border: 0, background: '#00D2FF', color: '#061C2B', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            Reload
          </button>
          <button type="button" onClick={() => reset()}
            style={{ height: 46, padding: '0 14px', borderRadius: 6, border: '1px solid rgba(247,249,250,.25)', background: 'transparent', color: '#F7F9FA', fontSize: 13, cursor: 'pointer' }}>
            Try again
          </button>
        </div>
        {error?.digest && <p style={{ fontSize: 10, color: 'rgba(247,249,250,.4)', marginTop: 14, fontFamily: 'var(--font-plex, monospace)' }}>ref {error.digest}</p>}
      </div>
    </div>
  );
}
