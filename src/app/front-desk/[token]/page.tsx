import { getFrontDeskData } from '@/lib/actions/front-desk';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { Lock } from 'lucide-react';
import { DeskBoard } from './DeskBoard';

// FRONT DESK (M147) — token-gated screen for reception: today's classes,
// who owes what, and one-tap settle (cash / card / transfer / room charge).

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FrontDeskPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await getFrontDeskData(token);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-sm w-full text-center shadow-sm">
          <Lock size={36} strokeWidth={1.75} className="mx-auto mb-4 text-gray-400" />
          <h1 className="text-lg font-bold text-[#061C2B]">Access not enabled</h1>
          <p className="text-sm text-gray-500 mt-2">This front-desk link is not active. Ask your academy administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-16 ${archivo.variable} ${plexMono.variable}`} style={{ background: '#F7F9FA' }}>
      <div className="max-w-md lg:max-w-3xl mx-auto px-4 pt-4">
        <div className="rounded-3xl px-5 py-5 mb-4" style={{ background: '#061C2B' }}>
          <p className="text-[9px]" style={{ fontFamily: 'var(--font-plex), monospace', textTransform: 'uppercase', letterSpacing: '0.16em', color: '#00D2FF' }}>Front desk · classes</p>
          <h1 className="text-[22px] mt-2" style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.08, color: '#F7F9FA' }}>
            Check-in &amp; charge
          </h1>
          <p className="text-[11px] mt-1" style={{ color: 'rgba(247,249,250,.55)' }}>{data.desk.name} · next 7 days · hand a ticket only when the row is green</p>
        </div>
        <DeskBoard token={token} classes={data.classes as any} />
      </div>
    </div>
  );
}
