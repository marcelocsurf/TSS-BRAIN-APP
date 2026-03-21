import { getTemplateDetail } from '@/lib/actions/camps';
import { TemplateBuilderForm } from '@/components/camp/TemplateBuilderForm';
import type { CreateTemplateInput, TemplateDayInput } from '@/lib/actions/camps';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCampTemplatePage({ params }: Props) {
  const { id } = await params;

  let detail;
  try {
    detail = await getTemplateDetail(id);
  } catch {
    notFound();
  }

  const { template, days, blocks } = detail;
  if (!template) notFound();

  // Convert to initialData shape
  const initialData: CreateTemplateInput = {
    template_name: template.template_name || '',
    level_name: template.level_name || 'Beginner',
    duration_days: template.duration_days || 1,
    modality: template.modality || 'individual',
    delivery_model: template.delivery_model || 'in-person',
    description: template.description || '',
    days: days.map((day: any): TemplateDayInput => {
      const dayBlocks = blocks
        .filter((b: any) => b.template_day_id === day.id)
        .sort((a: any, b: any) => a.block_order - b.block_order);

      return {
        day_number: day.day_number,
        venue_default: day.venue_default,
        ocean_condition_target: day.ocean_condition_target,
        day_goal: day.day_goal,
        day_notes: day.day_notes,
        evaluation_focus: day.evaluation_focus,
        has_evaluation: day.has_evaluation || false,
        evaluation_type: day.evaluation_type || null,
        blocks: dayBlocks.length > 0
          ? dayBlocks.map((b: any) => ({
              block_order: b.block_order,
              pilar: b.pilar,
              is_safety_layer: b.is_safety_layer || false,
              pilar_part: b.pilar_part,
              mission: b.mission,
              drill_name: b.drill_name,
              mission_time: b.mission_time,
              repetitions_default: b.repetitions_default,
              warm_up: b.warm_up,
              simulation: b.simulation,
              mental_hack: b.mental_hack,
              evaluation_focus: b.evaluation_focus,
              block_type: b.block_type || 'mission',
            }))
          : [
              {
                block_order: 1,
                pilar: null,
                is_safety_layer: false,
                pilar_part: null,
                mission: null,
                drill_name: null,
                mission_time: '15',
                repetitions_default: null,
                warm_up: null,
                simulation: null,
                mental_hack: null,
                evaluation_focus: null,
                block_type: 'mission',
              },
            ],
      };
    }),
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--tss-navy)]">Edit Template</h2>
          <p className="text-xs text-gray-500 mt-0.5">{template.template_name}</p>
        </div>
        <Link href="/camps/templates" className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </Link>
      </div>

      <TemplateBuilderForm mode="edit" templateId={id} initialData={initialData} />
    </div>
  );
}
