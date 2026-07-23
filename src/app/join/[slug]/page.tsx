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
          {data.academy.logo_url ? (
            // Wide logos must not be cropped to a square; the academy logo is
            // white-on-transparent, so it sits on an ink card to stay visible.
            <div className="rounded-2xl px-6 py-4 shadow-sm" style={{ background: '#061C2B' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.academy.logo_url} alt={data.academy.name} className="h-14 w-auto max-w-[240px] object-contain" />
            </div>
          ) : null}
          <h1 className="mt-3 text-[22px]" style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.08, color: '#061C2B' }}>
            {data.academy.name}
          </h1>
          <p className="text-[9px] mt-1 text-gray-400" style={{ fontFamily: 'var(--font-plex), monospace', textTransform: 'uppercase', letterSpacing: '0.16em' }}>
            Powered by The Surf Sequence
          </p>
        </div>
        <JoinFlow slug={slug} classes={data.classes} />
      </div>
    </div>
  );
}
