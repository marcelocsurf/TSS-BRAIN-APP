import { listCampTemplates, getTemplateDetail } from '@/lib/actions/camps';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { PILAR_LABELS, type Pilar } from '@/lib/constants/brand';
import { TemplateActions } from '@/components/camp/TemplateActions';
import Link from 'next/link';

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'bg-green-50 text-green-700',
  Novice: 'bg-blue-50 text-blue-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced: 'bg-purple-50 text-purple-700',
  Elite: 'bg-red-50 text-red-700',
};

export default async function CampTemplatesPage() {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach || !(await isCoordinatorOrAbove(currentCoach.role))) redirect('/');

  const templates = await listCampTemplates();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--tss-navy)]">Camp Templates</h2>
          <p className="text-xs text-gray-500 mt-0.5">{templates.length} template{templates.length !== 1 ? 's' : ''} available</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/camps" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
            &larr; Camps
          </Link>
          <Link
            href="/camps/templates/new"
            className="px-4 py-2.5 bg-[var(--tss-navy)] text-white text-sm font-medium rounded-xl hover:brightness-110 transition-all shadow-sm"
          >
            + Create Template
          </Link>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No templates yet</p>
          <Link href="/camps/templates/new" className="text-sm text-[var(--tss-cyan)] hover:underline mt-2 inline-block">
            Create your first camp template
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map(async (t: any) => {
            const detail = await getTemplateDetail(t.id);
            const totalBlocks = detail.blocks.length;
            const levelColor = LEVEL_COLORS[t.level_name] || 'bg-gray-50 text-gray-600';

            return (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-[var(--tss-navy)]">{t.template_name}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${levelColor}`}>
                          {t.level_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-mono)' }}>
                          {t.duration_days} days
                        </span>
                        <span className="text-[10px] text-gray-300">&middot;</span>
                        <span className="text-[10px] text-gray-400" style={{ fontFamily: 'var(--font-mono)' }}>
                          {totalBlocks} blocks
                        </span>
                        <span className="text-[10px] text-gray-300">&middot;</span>
                        <span className="text-[10px] text-gray-400 capitalize">{t.modality}</span>
                        <span className="text-[10px] text-gray-300">&middot;</span>
                        <span className="text-[10px] text-gray-400">{t.delivery_model}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/camps/new?template=${t.id}`}
                        className="px-3 py-1.5 bg-[var(--tss-navy)] text-white text-xs rounded-lg hover:opacity-90 shrink-0">
                        Use
                      </Link>
                    </div>
                  </div>
                  {/* Admin actions */}
                  <div className="mt-1">
                    <TemplateActions templateId={t.id} templateName={t.template_name} />
                  </div>
                </div>

                {t.description && (
                  <p className="px-4 py-2 text-xs text-gray-600">{t.description}</p>
                )}

                {/* Days summary */}
                <div className="px-4 pb-3">
                  {detail.days.map((day: any) => {
                    const dayBlocks = detail.blocks.filter((b: any) => b.template_day_id === day.id);
                    return (
                      <div key={day.id} className="mt-2 first:mt-0">
                        <p className="text-xs font-medium text-gray-700">Day {day.day_number}: {day.day_goal?.slice(0, 80)}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {dayBlocks.map((b: any) => (
                            <span key={b.id} className="text-[10px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded">
                              {b.pilar ? (PILAR_LABELS[b.pilar as Pilar]?.split(' ')[0] || b.pilar) : 'Safety'}: {b.pilar_part?.slice(0, 30)}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
