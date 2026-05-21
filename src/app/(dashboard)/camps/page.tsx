import { createClient } from '@/lib/supabase/server';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CampsPage() {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach || !(await isCoordinatorOrAbove(currentCoach.role))) redirect('/dashboard');

  const supabase = await createClient();

  // M6 — scope camp listing by academy unless platform admin.
  let query = supabase
    .from('camp_instances')
    .select('*, camp_templates(template_name, duration_days), coaches:coach_id(display_name)')
    .order('created_at', { ascending: false });

  if (!currentCoach.is_platform_admin && currentCoach.academy_id) {
    query = query.eq('academy_id', currentCoach.academy_id);
  }

  const { data: camps } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Camps
          </h2>
          <p
            className="text-[10px] uppercase tracking-wider text-gray-400 mt-1"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {camps?.length ?? 0} camp{(camps?.length ?? 0) !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/camps/templates"
            className="px-3 py-2.5 border border-gray-200 text-sm rounded-xl hover:bg-gray-50 text-gray-700 transition-all"
          >
            Templates
          </Link>
          <Link
            href="/camps/new"
            className="px-4 py-2.5 bg-[var(--tss-navy)] text-white text-sm font-medium rounded-xl hover:brightness-110 transition-all shadow-sm"
          >
            + New Camp
          </Link>
        </div>
      </div>

      {!camps || camps.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
          <p className="text-lg">No camps yet</p>
          <Link href="/camps/new" className="text-sm text-[var(--tss-cyan,#5AC3E7)] hover:underline mt-2 inline-block">
            Create your first camp
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {camps.map((c: any) => (
            <Link
              key={c.id}
              href={`/camps/${c.id}`}
              className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-gray-300 hover:shadow transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-[var(--tss-navy)]">{c.camp_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.camp_templates?.template_name} · {c.coaches?.display_name}
                  </p>
                </div>
                <CampStatusBadge status={c.status} />
              </div>
              <div
                className="flex gap-4 mt-2 text-[10px] text-gray-400 uppercase tracking-wider"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                <span>{c.start_date} → {c.end_date}</span>
                <span>{c.modality}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CampStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    planned: 'bg-[var(--tss-cyan,#5AC3E7)]/15 text-[var(--tss-navy)]',
    active: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-gray-100 text-gray-700',
    draft: 'bg-gray-50 text-gray-500',
    cancelled: 'bg-red-50 text-red-600',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold shrink-0 ${styles[status] || 'bg-gray-50'}`}>
      {status}
    </span>
  );
}
