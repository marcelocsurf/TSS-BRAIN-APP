import { getScout } from '@/lib/actions/venue-scout';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function VenueScoutEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scout = await getScout(id);
  if (!scout) notFound();

  return (
    <div>
      <Link href="/venue-scout" className="text-xs text-gray-500 hover:underline">← Venue Scout</Link>
      <h2 className="text-2xl font-bold text-[var(--tss-navy)] leading-tight mt-2" style={{ fontFamily: 'var(--font-heading)' }}>
        {scout.spot_name || 'Spot sin nombre'}
      </h2>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
        {scout.mode === 'free' ? 'Sesión libre' : 'Competencia'}
      </p>

      <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-sm text-gray-600 font-medium">Editor del análisis — en construcción</p>
        <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
          El scout ya está creado y guardado. La pantalla de setup, el mapa y los reportes se activan en las próximas fases.
        </p>
      </div>
    </div>
  );
}
