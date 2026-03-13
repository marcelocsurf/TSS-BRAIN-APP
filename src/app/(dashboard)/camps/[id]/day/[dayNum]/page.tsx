import { getCampSession } from '@/lib/actions/camps';
import { PILAR_LABELS, type Pilar } from '@/lib/constants/brand';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string; dayNum: string }>;
}

export default async function CampDayPage({ params }: Props) {
  const { id, dayNum } = await params;
  let data;
  try {
    data = await getCampSession(id, parseInt(dayNum));
  } catch { notFound(); }

  const { session, participants, existingResults, blocks } = data;
  if (!session) notFound();

  const dayInfo = session.camp_template_days;
  const evaluatedIds = new Set(existingResults.map((r: any) => r.student_id));
  const allEvaluated = participants.every((p: any) => evaluatedIds.has(p.students?.id));

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <Link href={`/camps/${id}`} className="text-xs text-gray-400 hover:text-gray-600">← Back to camp</Link>
        <h2 className="text-xl font-bold text-[var(--tss-navy)] mt-1">Day {dayNum}</h2>
        {dayInfo?.day_goal && (
          <p className="text-sm text-gray-600 mt-1">{dayInfo.day_goal}</p>
        )}
        {dayInfo?.evaluation_focus && (
          <p className="text-xs text-[var(--tss-gold)] mt-0.5">Focus: {dayInfo.evaluation_focus}</p>
        )}
      </div>

      {/* Blocks (the shared plan) */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Session Plan</h3>
        </div>
        {blocks.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-400 text-center">No blocks configured for this day.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {blocks.sort((a: any, b: any) => a.block_order - b.block_order).map((block: any) => (
              <div key={block.id} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 flex items-center justify-center">
                    {block.block_order}
                  </span>
                  {block.pilar && (
                    <span className="text-[10px] text-gray-400">
                      {PILAR_LABELS[block.pilar as Pilar]?.split(' ')[0] || block.pilar}
                    </span>
                  )}
                  {block.is_safety_layer && (
                    <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">Safety</span>
                  )}
                  {block.mission_time && (
                    <span className="text-[10px] text-gray-400">{block.mission_time}</span>
                  )}
                </div>
                <p className="text-sm text-gray-800">{block.mission}</p>
                {block.pilar_part && (
                  <p className="text-xs text-gray-500 mt-0.5">{block.pilar_part}</p>
                )}
                {block.drill_name && (
                  <p className="text-xs text-[var(--tss-gold)] mt-0.5">{block.drill_name}</p>
                )}
                <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                  {block.warm_up && <span>WU: {block.warm_up}</span>}
                  {block.mental_hack && <span>Mental: {block.mental_hack}</span>}
                  {block.simulation && <span>Sim: {block.simulation}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Participants evaluation status */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">
            Evaluation ({existingResults.length}/{participants.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {participants.map((p: any) => {
            const isEvaluated = evaluatedIds.has(p.students?.id);
            const result = existingResults.find((r: any) => r.student_id === p.students?.id);
            return (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: BELT_DISPLAY[p.students?.belt_level as BeltLevel]?.color || '#999' }}>
                    {p.students?.first_name?.[0]}{p.students?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{p.students?.first_name} {p.students?.last_name}</p>
                    {isEvaluated && result && (
                      <p className="text-[10px] text-gray-400 capitalize">{result.status?.replace('_',' ')} · Focus {result.focus_rating}/5</p>
                    )}
                  </div>
                </div>
                {isEvaluated ? (
                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Done</span>
                ) : (
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Pending</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Evaluate button */}
      {!allEvaluated && (
        <Link href={`/camps/${id}/day/${dayNum}/results`}
          className="block w-full text-center py-3 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          Evaluate Students
        </Link>
      )}

      {allEvaluated && (
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-sm text-green-700 font-medium">All students evaluated for Day {dayNum}.</p>
        </div>
      )}
    </div>
  );
}
