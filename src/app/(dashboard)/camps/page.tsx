import { createClient } from '@/lib/supabase/server';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CampsPage() {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach || !(await isCoordinatorOrAbove(currentCoach.role))) redirect('/');

  const supabase = await createClient();

  const { data: camps } = await supabase
    .from('camp_instances')
    .select('*, camp_templates(template_name, duration_days), coaches(display_name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--tss-navy)]">Camps</h2>
        <div className="flex gap-2">
          <Link href="/camps/templates" className="px-3 py-2.5 border border-[var(--tss-gray-200)] text-sm rounded-xl hover:bg-[var(--tss-gray-50)] text-[var(--tss-gray-700)] transition-all">
            Templates
          </Link>
          <Link href="/camps/new" className="px-4 py-2.5 bg-[var(--tss-navy)] text-white text-sm font-medium rounded-xl hover:brightness-110 transition-all shadow-sm">
            + New Camp
          </Link>
        </div>
      </div>

      {!camps || camps.length === 0 ? (
        <div className="text-center py-12 text-[var(--tss-gray-500)]">
          <p className="text-lg">No camps yet</p>
          <Link href="/camps/new" className="text-sm text-[var(--tss-cyan)] hover:underline mt-2 inline-block">
            Create your first camp
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {camps.map((c: any) => (
            <Link key={c.id} href={`/camps/${c.id}`}
              className="block bg-white rounded-xl p-4 border border-[var(--tss-gray-100)] hover:border-[var(--tss-gray-300)] hover:shadow-sm transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-[var(--tss-navy)]">{c.camp_name}</p>
                  <p className="text-xs text-[var(--tss-gray-500)] mt-0.5">
                    {c.camp_templates?.template_name} &middot; {c.coaches?.display_name}
                  </p>
                </div>
                <CampStatusBadge status={c.status} />
              </div>
              <div className="flex gap-4 mt-2 text-xs text-[var(--tss-gray-500)]" style={{ fontFamily: 'var(--font-mono)' }}>
                <span>{c.start_date} &rarr; {c.end_date}</span>
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
    planned: 'bg-blue-50 text-blue-700',
    active: 'bg-emerald-50 text-[var(--tss-success)]',
    completed: 'bg-[var(--tss-gray-50)] text-[var(--tss-gray-700)]',
    draft: 'bg-[var(--tss-gray-50)] text-[var(--tss-gray-500)]',
    cancelled: 'bg-red-50 text-[var(--tss-danger)]',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-medium ${styles[status] || 'bg-[var(--tss-gray-50)]'}`}>
      {status}
    </span>
  );
}
