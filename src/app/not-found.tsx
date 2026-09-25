import Link from 'next/link';

// ═══ 404 con marca (auditoría de lanzamiento 2026-09-25) ═══
// Antes: un link mal escrito o reemplazado (portal, intake, encuesta) mostraba
// la página cruda de Next, sin marca ni salida. Student-facing → inglés.
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: '#061C2B' }}>
      <div className="w-full max-w-md rounded-lg overflow-hidden" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
        <div className="flex items-center justify-center px-5 py-5" style={{ background: '#061C2B' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tss-logo-white.png?v=2" alt="The Surf Sequence" className="h-12 w-auto object-contain" />
        </div>
        <div className="px-6 py-6">
          <p className="m-0 text-[11px]" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#55666E' }}>Link not found</p>
          <h1 className="m-0 mt-1 text-[26px] leading-[1.06] uppercase" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 900, letterSpacing: '-0.02em', color: '#10263B' }}>
            This link is not valid anymore
          </h1>
          <p className="m-0 mt-3 text-[16px] leading-snug" style={{ color: '#10263B' }}>
            It may have been typed wrong, cut short in a message, or replaced. Your portal is still there.
          </p>
          <Link href="/my-portal"
            className="mt-5 inline-flex w-full items-center justify-center h-12 rounded-[5px] text-[15px] font-extrabold uppercase tracking-wide no-underline"
            style={{ background: '#00D2FF', color: '#061C2B', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>
            Email me my portal link →
          </Link>
          <p className="m-0 mt-4 text-[14px] leading-snug" style={{ color: '#55666E' }}>
            Or ask the front desk at your academy — they can send it by WhatsApp.
          </p>
          <p className="m-0 mt-4 text-[13px]" style={{ color: '#55666E' }}>
            Coaches and staff: <Link href="/login" style={{ color: '#00A8CC' }}>sign in here</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
