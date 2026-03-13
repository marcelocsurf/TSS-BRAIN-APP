import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function CampsPage() {
  const supabase = await createClient();

  const { data: camps } = await supabase
    .from('camp_instances')
    .select('*, camp_templates(template_name, duration_days), coaches(display_name)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--tss-navy)]">Camps</h2>
        <div className="flex gap-2">
          <Link href="/camps/templates" className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">
            Templates
          </Link>
          <Link href="/camps/new" className="px-4 py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg hover:opacity-90">
            + New Camp
          </Link>
        </div>
      </div>

      {!camps || camps.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No camps yet</p>
          <Link href="/camps/new" className="text-sm text-[var(--tss-gold)] hover:underline mt-2 inline-block">
            Create your first camp
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {camps.map((c: any) => (
            <Link key={c.id} href={`/camps/${c.id}`}
              className="block bg-white rounded-xl p-4 border border-gray-100 hover:border-[var(--tss-gold)] transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-[var(--tss-navy)]">{c.camp_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {c.camp_templates?.template_name} · {c.coaches?.display_name}
                  </p>
                </div>
                <CampStatusBadge status={c.status} />
              </div>
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
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
    planned: 'bg-blue-50 text-blue-700',
    active: 'bg-green-50 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    draft: 'bg-gray-50 text-gray-500',
    cancelled: 'bg-red-50 text-red-600',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${styles[status] || 'bg-gray-50'}`}>
      {status}
    </span>
  );
}
