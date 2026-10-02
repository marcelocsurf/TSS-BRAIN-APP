'use client';

// ═══ 404 dentro del portal del coach (Marcelo 2026-10-01) ═══
// notFound() de /seq, /teach, /circles, /loop, /course, /tools (arriba de su
// cinta, sin cursos, link viejo) caía en el 404 del ALUMNO ("Email me my
// portal link"). Este vuelve a SU plan: al día de donde salió si el link
// traía ?from= (src/lib/nav/origin.ts), si no a sus clases.
// Cliente: en Next 14 el not-found no recibe params; el token sale del path.
import { Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { coachBack, parseFrom } from '@/lib/nav/origin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BTN_CLASS = 'mt-5 inline-flex w-full items-center justify-center h-12 rounded-[5px] text-[15px] font-extrabold uppercase tracking-wide no-underline';
const BTN = { background: '#00D2FF', color: '#061C2B', fontFamily: 'var(--font-archivo), Archivo, sans-serif' } as const;

function BackToPlan() {
  const token = (usePathname() ?? '').split('/')[2] ?? '';
  const sp = useSearchParams();
  if (!UUID_RE.test(token)) return <a href="/login" className={BTN_CLASS} style={BTN}>Sign in →</a>;
  const parsed = parseFrom(sp?.get('from'), 'coach');
  // Desde otra página de secuencia: vale el origen de esa página (su `up`).
  const o = parsed?.k === 'seq' ? parsed.up ?? null : parsed;
  // Solo orígenes que no pueden volver a dar 404: el plan, la lista, el Home.
  const back = coachBack(o && (o.k === 'plan' || o.k === 'plans' || o.k === 'home') ? o : null, token, { k: 'plans' });
  // <a> y no <Link>: carga completa, así el portal lee ?tab=&camp=&day=&view= al entrar.
  return (
    <a href={back.href} className={BTN_CLASS} style={BTN}>
      ← Back to {back.label.replace(/^(Home|The|Today's|Your)\b/, (w) => w.toLowerCase())}
    </a>
  );
}

export default function CoachNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: '#061C2B' }}>
      <div className="w-full max-w-md rounded-lg overflow-hidden" style={{ background: '#E9E2D2', border: '1px solid #DCD7C6' }}>
        <div className="flex items-center justify-center px-5 py-5" style={{ background: '#061C2B' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/tss-logo-white.png?v=2" alt="The Surf Sequence" className="h-12 w-auto object-contain" />
        </div>
        <div className="px-6 py-6">
          <p className="m-0 text-[11px]" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#55666E' }}>Not open for you</p>
          <h1 className="m-0 mt-1 text-[26px] leading-[1.06] uppercase" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 900, letterSpacing: '-0.02em', color: '#10263B' }}>
            This page isn&apos;t open for you yet
          </h1>
          <p className="m-0 mt-3 text-[16px] leading-snug" style={{ color: '#10263B' }}>
            It&apos;s above the level you teach, or the link is old. Your plan is still there.
          </p>
          <Suspense fallback={null}><BackToPlan /></Suspense>
        </div>
      </div>
    </main>
  );
}
