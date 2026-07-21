import { getCurrentCoach } from '@/lib/actions/auth';
import { getCostSettings } from '@/lib/actions/costs';
import { redirect } from 'next/navigation';
import { CostsManager } from './CostsManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Cost engine settings (M145): coach pay matrix, cost catalog and per-template
// recipes. Admin + coordinator.
export default async function CostsPage() {
  const me = await getCurrentCoach();
  if (!me || !['admin', 'coordinator'].includes(me.role)) redirect('/dashboard');

  let settings;
  try {
    settings = await getCostSettings();
  } catch {
    settings = { rates: [], matrix: [], templates: [], recipes: [] };
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--tss-navy)] leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
          Costs
        </h2>
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
          Coach pay matrix · cost catalog · service recipes
        </p>
      </div>
      <CostsManager initial={settings} />
    </div>
  );
}
