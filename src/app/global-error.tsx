'use client';

// Último recurso: si falla el layout raíz. Mismo mensaje que error.tsx, con
// html/body propios porque acá el layout no existe.

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#061C2B', color: '#F7F9FA', padding: '24px 16px', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: 420, width: '100%' }}>
            <p style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#00D2FF', margin: 0, fontFamily: 'monospace' }}>Something went wrong</p>
            <h1 style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: 26, lineHeight: 1.05, margin: '6px 0 12px' }}>The page hit a wave</h1>
            <p style={{ fontSize: 14, lineHeight: 1.5, color: 'rgba(247,249,250,.8)', margin: 0 }}>Reload and you are back where you were. Nothing you saved is lost.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button type="button" onClick={() => window.location.reload()} style={{ flex: 1, height: 46, borderRadius: 6, border: 0, background: '#00D2FF', color: '#061C2B', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>Reload</button>
              <button type="button" onClick={() => reset()} style={{ height: 46, padding: '0 14px', borderRadius: 6, border: '1px solid rgba(247,249,250,.25)', background: 'transparent', color: '#F7F9FA', fontSize: 13, cursor: 'pointer' }}>Try again</button>
            </div>
            {error?.digest && <p style={{ fontSize: 10, color: 'rgba(247,249,250,.4)', marginTop: 14, fontFamily: 'monospace' }}>ref {error.digest}</p>}
          </div>
        </div>
      </body>
    </html>
  );
}
