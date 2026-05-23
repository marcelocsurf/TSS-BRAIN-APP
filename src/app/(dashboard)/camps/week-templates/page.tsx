import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { listWeekTemplates } from '@/lib/actions/week-templates';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default async function WeekTemplatesPage() {
  const me = await getCurrentCoach();
  if (!me || !(await isCoordinatorOrAbove(me.role))) redirect('/dashboard');

  const list = await listWeekTemplates();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Week Templates
          </h2>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
            {list.length} template{list.length !== 1 ? 's' : ''} · stamp a full week of services with one click
          </p>
        </div>
        <Link
          href="/camps/week-templates/new"
          className="inline-flex items-center gap-1 px-3 py-2 bg-[var(--tss-navy)] text-white text-sm font-medium rounded-xl hover:opacity-90"
        >
          <Plus size={14} strokeWidth={2} />
          New
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-500 mb-2">No week templates yet.</p>
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            A week template lets you stamp a full weekly rhythm — e.g. "3 camps + 5 lessons + 2 surfskate" — onto any week of the calendar in one click.
          </p>
          <Link
            href="/camps/week-templates/new"
            className="inline-flex items-center gap-1 px-4 py-2 bg-[var(--tss-navy)] text-white text-sm rounded-xl"
          >
            Create the first one
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((wt) => (
            <Link
              key={wt.id}
              href={`/camps/week-templates/${wt.id}/edit`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-[var(--tss-cyan,#5AC3E7)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[var(--tss-navy)]">{wt.name}</h3>
                  {wt.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{wt.description}</p>
                  )}
                </div>
                <span className="text-[10px] font-mono text-gray-400 shrink-0">
                  {wt.slots.length} slot{wt.slots.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {wt.slots.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border border-gray-200 text-gray-700"
                    style={{ fontFamily: 'DM Mono, monospace', backgroundColor: s.camp_templates?.card_color ?? '#F3F4F6' }}
                  >
                    {WEEKDAYS[s.weekday]} · {s.camp_templates?.template_name?.split(' ').slice(0, 3).join(' ') ?? '—'}
                    {s.scheduled_time ? ` · ${s.scheduled_time}` : ''}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
