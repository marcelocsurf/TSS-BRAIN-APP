import { getCurrentCoach } from '@/lib/actions/auth';
import { listMyScouts } from '@/lib/actions/venue-scout';
import { ScoutList } from '@/components/venue-scout/ScoutList';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function VenueScoutPage() {
  const me = await getCurrentCoach();
  if (!me) redirect('/dashboard');
  const scouts = await listMyScouts();

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[var(--tss-navy)] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Venue Scout
        </h2>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
          Análisis táctico de spots · competencia y sesión libre
        </p>
      </div>
      <ScoutList scouts={scouts} />
    </div>
  );
}
