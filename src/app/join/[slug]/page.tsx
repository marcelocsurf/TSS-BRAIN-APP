import { getPublicClasses } from '@/lib/actions/public-classes';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { JoinFlow } from './JoinFlow';

// PUBLIC class signup landing (M147) — reached by scanning a printed QR.
// The academy's own logo leads (this is THEIR front door); The Surf Sequence
// appears as the small platform credit.

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function JoinPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tpl?: string }>;
}) {
  const { slug } = await params;
  const { tpl } = await searchParams;
  const data = await getPublicClasses(slug, tpl ?? null);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center px-4">
        <p className="text-sm text-gray-500">This link is not active.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-16 ${archivo.variable} ${plexMono.variable}`} style={{ background: '#F7F9FA' }}>
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex flex-col items-center text-center mb-4">
          {data.academy.logo_light_url ? (
            // Full-color (dark-on-transparent) logo sits directly on the paper
            // background — no card needed.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.academy.logo_light_url} alt={data.academy.name} className="h-24 w-auto max-w-[290px] object-contain" />
          ) : data.academy.logo_url ? (
            // White-on-transparent fallback needs an ink card to stay visible.
            <div className="rounded-2xl px-6 py-4 shadow-sm" style={{ background: '#061C2B' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.academy.logo_url} alt={data.academy.name} className="h-14 w-auto max-w-[240px] object-contain" />
            </div>
          ) : null}
          <p className="mt-2 text-[13px] text-gray-500">Book your spot in seconds</p>
          <p className="text-[9px] mt-1 text-gray-400" style={{ fontFamily: 'var(--font-plex), monospace', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
            Powered by The Surf Sequence
          </p>
        </div>
        {/* Qué va a pasar: quita la fricción del "¿me van a pedir tarjeta?" */}
        <div className="rounded-2xl grid grid-cols-3 gap-1 px-2 py-3 mb-4" style={{ background: '#061C2B' }}>
          {[
            { t: 'Pick', d: 'an activity' },
            { t: 'Book', d: 'your time' },
            { t: 'Pay', d: 'at front desk' },
          ].map((s2) => (
            <div key={s2.t} className="text-center">
              <p className="text-[10px]" style={{ fontFamily: 'var(--font-plex), monospace', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#00D2FF' }}>{s2.t}</p>
              <p className="text-[9px] mt-0.5" style={{ color: 'rgba(247,249,250,.45)' }}>{s2.d}</p>
            </div>
          ))}
        </div>
        <JoinFlow slug={slug} classes={data.classes} />
      </div>
    </div>
  );
}
