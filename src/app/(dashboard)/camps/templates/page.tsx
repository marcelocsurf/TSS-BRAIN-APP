import { listCampTemplates, getTemplateDetail } from '@/lib/actions/camps';
import { PILAR_LABELS, type Pilar } from '@/lib/constants/brand';
import Link from 'next/link';

export default async function CampTemplatesPage() {
  const templates = await listCampTemplates();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--tss-navy)]">Camp Templates</h2>
        <Link href="/camps" className="text-sm text-gray-500 hover:text-gray-700">← Camps</Link>
      </div>

      <div className="space-y-4">
        {templates.map(async (t: any) => {
          const detail = await getTemplateDetail(t.id);
          return (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-[var(--tss-navy)]">{t.template_name}</p>
                  <p className="text-xs text-gray-500">{t.level_name} · {t.duration_days} days · {t.delivery_model}</p>
                </div>
                <Link href={`/camps/new?template=${t.id}`}
                  className="px-3 py-1.5 bg-[var(--tss-navy)] text-white text-xs rounded-lg hover:opacity-90">
                  Use Template
                </Link>
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
    </div>
  );
}
