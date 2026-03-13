import { getCampDetail } from '@/lib/actions/camps';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CampDetailPage({ params }: Props) {
  const { id } = await params;
  let camp;
  try {
    camp = await getCampDetail(id);
  } catch { notFound(); }

  const { instance, participants, sessions } = camp;
  if (!instance) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[var(--tss-navy)]">{instance.camp_name}</h2>
        <p className="text-sm text-gray-500">
          {(instance as any).camp_templates?.template_name} · {(instance as any).coaches?.display_name}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {instance.start_date} → {instance.end_date} · {instance.modality}
        </p>
      </div>

      {/* Participants */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-sm font-semibold text-[var(--tss-navy)] mb-3">
          Participants ({participants.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {participants.map((p: any) => (
            <Link key={p.id} href={`/students/${p.students?.id}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
              <div className="w-5 h-5 rounded-full text-white text-[8px] font-bold flex items-center justify-center"
                style={{ backgroundColor: BELT_DISPLAY[p.students?.belt_level as BeltLevel]?.color || '#999' }}>
                {p.students?.first_name?.[0]}{p.students?.last_name?.[0]}
              </div>
              <span className="text-xs text-gray-700">{p.students?.first_name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Day progress */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Sessions by Day</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {sessions.map((s: any) => {
            const isCompleted = s.session_status === 'completed';
            const isActive = s.session_status === 'active';
            return (
              <Link key={s.id} href={`/camps/${id}/day/${s.day_number}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCompleted ? 'bg-green-100 text-green-700' :
                    isActive ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {s.day_number}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Day {s.day_number}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                      {s.camp_template_days?.day_goal?.slice(0, 60)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${
                    isCompleted ? 'bg-green-50 text-green-600' :
                    isActive ? 'bg-blue-50 text-blue-600' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {s.session_status}
                  </span>
                  {s.session_date && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.session_date}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
