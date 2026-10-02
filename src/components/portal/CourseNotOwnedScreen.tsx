// Pantalla "esto viene con otro curso" (server-safe). Nació en la página de la
// secuencia (2026-09-26); desde 2026-10-01 también la usan los Tres Círculos y el
// Infinite Circle, que daban 404 a quien no tenía el curso. El botón vuelve al origen.
export function CourseNotOwnedScreen({ eyebrow, title, body, backHref, backLabel }: { eyebrow: string; title: string; body: string; backHref: string; backLabel: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: '#061C2B' }}>
      <div className="w-full max-w-md rounded-lg px-6 py-6" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
        <p className="m-0 text-[11px]" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#55666E' }}>{eyebrow}</p>
        <h1 className="m-0 mt-1 text-[26px] leading-[1.06] uppercase" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 900, letterSpacing: '-0.02em', color: '#10263B' }}>{title}</h1>
        <p className="m-0 mt-3 text-[16px] leading-snug" style={{ color: '#10263B' }}>{body}</p>
        <a href={backHref} className="mt-5 inline-flex w-full items-center justify-center h-12 rounded-[5px] text-[15px] font-extrabold uppercase tracking-wide no-underline" style={{ background: '#00D2FF', color: '#061C2B', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>{backLabel} →</a>
      </div>
    </main>
  );
}
