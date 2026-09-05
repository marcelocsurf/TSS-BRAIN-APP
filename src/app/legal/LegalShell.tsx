// Marco compartido de /legal/* — página pública, liviana, sin fuentes extra.
// Inglés primero (regla de marca), español debajo con ancla.
import Link from 'next/link';

const INK = '#061C2B', CYAN = '#00D2FF';

export type LegalSection = { h: string; p: string[] };

export function LegalShell({
  title, updated, version, intro, en, es, other,
}: {
  title: { en: string; es: string };
  updated: string;
  version: string;
  intro?: { en: string; es: string };
  en: LegalSection[];
  es: LegalSection[];
  other: { href: string; label: string };
}) {
  return (
    <main style={{ background: '#F7F9FA', minHeight: '100vh', color: INK }}>
      <div style={{ background: INK, padding: '28px 20px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tss-logo-white.png?v=2" alt="The Surf Sequence" style={{ height: 30 }} />
          <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '18px 0 4px', letterSpacing: '-0.01em' }}>{title.en}</h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, margin: 0 }}>
            {title.es} · Last updated / Última actualización: {updated} · v{version}
          </p>
          <nav style={{ marginTop: 14, fontSize: 12 }}>
            <a href="#en" style={{ color: CYAN, marginRight: 16 }}>English</a>
            <a href="#es" style={{ color: CYAN, marginRight: 16 }}>Español</a>
            <Link href={other.href} style={{ color: 'rgba(255,255,255,.7)' }}>{other.label} →</Link>
          </nav>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px 60px', fontSize: 15, lineHeight: 1.65 }}>
        {intro && <p style={{ background: '#E5FAFF', border: '1px solid #99E9FF', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}>{intro.en}</p>}
        <Block id="en" sections={en} />
        <hr style={{ border: 0, borderTop: '1px solid #D9E1E6', margin: '40px 0' }} />
        {intro && <p style={{ background: '#E5FAFF', border: '1px solid #99E9FF', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}>{intro.es}</p>}
        <Block id="es" sections={es} />
        <p style={{ marginTop: 40, fontSize: 12, color: '#6B7280' }}>
          © 2026 Enkrateia, S.A. de C.V. · The Surf Sequence® · <Link href="/legal/privacy" style={{ color: '#0090B0' }}>Privacy</Link> · <Link href="/legal/terms" style={{ color: '#0090B0' }}>Terms</Link>
        </p>
      </div>
    </main>
  );
}

function Block({ id, sections }: { id: string; sections: LegalSection[] }) {
  return (
    <section id={id}>
      {sections.map((s, i) => (
        <div key={i} style={{ marginTop: i === 0 ? 0 : 26 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px' }}>{s.h}</h2>
          {s.p.map((t, j) => (
            t.startsWith('- ')
              ? <li key={j} style={{ marginLeft: 20, marginBottom: 4 }}>{t.slice(2)}</li>
              : <p key={j} style={{ margin: '0 0 8px' }}>{t}</p>
          ))}
        </div>
      ))}
    </section>
  );
}
