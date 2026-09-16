import { listCampTemplates, getTemplateDetail } from '@/lib/actions/camps';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { PILAR_LABELS, type Pilar } from '@/lib/constants/brand';
import { TemplateActions } from '@/components/camp/TemplateActions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LEVEL_BELT_COLOR } from '@/lib/constants/belts';

// Render the belt colour itself behind the chip so the template
// "Beginner" reads white, "Foundation" reads blue, etc. Text colour
// flips based on luminance so it stays readable on dark belts.
function isDarkHex(hex: string): boolean {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
}

export default async function CampTemplatesPage() {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach || !(await isCoordinatorOrAbove(currentCoach.role))) redirect('/dashboard');

  const templates = await listCampTemplates();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-2xl font-bold text-[var(--tss-navy)] leading-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Camp Templates
          </h2>
          <p
            className="text-[10px] uppercase tracking-wider text-[#55666E] mt-1"
            style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
          >
            {templates.length} template{templates.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/camps"
            className="text-sm text-[#55666E] hover:text-[#10263B] px-3 py-2 inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            Schedule
          </Link>
          <Link
            href="/camps/templates/new"
            className="px-4 py-2.5 bg-[var(--tss-navy)] text-white text-sm font-medium rounded-[5px] hover:brightness-110 transition-all shadow-sm"
          >
            + Create Template
          </Link>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-12 bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] border border-[#DCD7C6] text-[#55666E]">
          <p className="text-lg">No templates yet</p>
          <Link href="/camps/templates/new" className="text-sm text-[var(--tss-cyan,#5AC3E7)] hover:underline mt-2 inline-block">
            Create your first camp template
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map(async (t: any) => {
            const detail = await getTemplateDetail(t.id);
            const totalBlocks = detail.blocks.length;
            const beltHex = LEVEL_BELT_COLOR[t.level_name] || '#E5E7EB';
            const onDark = isDarkHex(beltHex);

            return (
              <div key={t.id} className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-[#DCD7C6]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-[var(--tss-navy)]">{t.template_name}</p>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border border-black/10 ${
                            onDark ? 'text-white' : 'text-black/80'
                          }`}
                          style={{ backgroundColor: beltHex }}
                        >
                          {t.level_name}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-2 mt-1 text-[10px] text-[#55666E] uppercase tracking-wider"
                        style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
                      >
                        <span>{t.duration_days} days</span>
                        <span className="text-[#B8B1A0]">·</span>
                        <span>{totalBlocks} blocks</span>
                        <span className="text-[#B8B1A0]">·</span>
                        <span className="capitalize">{t.modality}</span>
                        <span className="text-[#B8B1A0]">·</span>
                        <span>{t.delivery_model}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/camps/new?template=${t.id}`}
                        className="px-3 py-1.5 bg-[var(--tss-navy)] text-white text-xs font-medium rounded-lg hover:opacity-90 shrink-0"
                      >
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
                  <p className="px-4 py-2 text-xs text-[#55666E]">{t.description}</p>
                )}

                {/* Days summary */}
                <div className="px-4 pb-3">
                  {detail.days.map((day: any) => {
                    const dayBlocks = detail.blocks.filter((b: any) => b.template_day_id === day.id);
                    return (
                      <div key={day.id} className="mt-2 first:mt-0">
                        <p className="text-xs font-medium text-[#10263B]">Day {day.day_number}: {day.day_goal?.slice(0, 80)}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {dayBlocks.map((b: any) => {
                            // Show what the activity actually is — its mission/
                            // drill/objective — not a repeated pilar prefix.
                            const label =
                              b.mission || b.mission_custom || b.drill_name ||
                              b.drill_custom || b.pilar_part || b.block_type || 'Activity';
                            return (
                              <span key={b.id} className="text-[10px] bg-[#F7F9FA] text-[#55666E] px-1.5 py-0.5 rounded">
                                {String(label).slice(0, 32)}
                              </span>
                            );
                          })}
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
