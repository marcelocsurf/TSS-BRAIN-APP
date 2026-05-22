// Visual card for a single camp_instance inside the calendar panorama.
//
// Colour rules (locked in with Marcelo):
//   service_kind='surf_camp'   → cyan base (#00F0FF)
//   service_kind='surf_lesson' → fucsia base (#EC4899)
//   service_kind='custom'      → neutral gray
//
// Left stripe (4px) shows the belt level (level_name on the template):
//   Beginner   → white      (with ring for visibility on cyan)
//   Novice     → yellow     (#F5C518)
//   Foundation → blue       (#1E6FBF)
//   Custom     → none

import Link from 'next/link';
import { CampStatusBadge } from './CampStatusBadge';

type ServiceCardProps = {
  camp: {
    id: string;
    camp_name: string;
    start_date: string;
    end_date: string;
    status: string;
    modality: string;
    capacity_override: number | null;
    camp_templates: {
      template_name: string;
      level_name: string;
      service_kind: 'surf_lesson' | 'surf_camp' | 'custom' | null;
      capacity_max: number;
    } | null;
    head_coach: { display_name: string } | null;
    coaches: { display_name: string } | null;
    camp_participants: { id: string; enrollment_status: string }[];
  };
  compact?: boolean;
};

const STRIPE: Record<string, string> = {
  Beginner: '#FFFFFF',
  Novice: '#F5C518',
  Foundation: '#1E6FBF',
};

export function ServiceCard({ camp, compact = false }: ServiceCardProps) {
  const tpl = camp.camp_templates;
  const kind = tpl?.service_kind ?? 'custom';
  const level = tpl?.level_name ?? 'Custom';
  const capacity = camp.capacity_override ?? tpl?.capacity_max ?? 4;
  const enrolled = camp.camp_participants.filter(
    (p) => p.enrollment_status === 'active',
  ).length;
  const coachName =
    camp.head_coach?.display_name ?? camp.coaches?.display_name ?? null;

  const bg =
    kind === 'surf_camp'
      ? 'bg-[#00F0FF]'
      : kind === 'surf_lesson'
      ? 'bg-[#EC4899]'
      : 'bg-gray-100';
  const onDark = kind === 'surf_lesson'; // fucsia is dark → use white text accents
  const stripe = STRIPE[level] ?? 'transparent';

  return (
    <Link
      href={`/camps/${camp.id}`}
      className={`group relative block ${bg} rounded-xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md transition-all`}
      style={{ borderLeft: `4px solid ${stripe}` }}
    >
      <div className={compact ? 'p-2.5' : 'p-3'}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={`text-[9px] uppercase tracking-wider truncate ${
                onDark ? 'text-white/85' : 'text-black/55'
              }`}
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              {level} · {kind === 'surf_camp' ? 'CAMP' : kind === 'surf_lesson' ? 'LESSON' : 'CUSTOM'}
            </p>
            <p
              className={`text-sm font-semibold leading-snug mt-0.5 truncate ${
                onDark ? 'text-white' : 'text-black/85'
              }`}
            >
              {camp.camp_name}
            </p>
          </div>
          <CampStatusBadge status={camp.status} />
        </div>

        {/* Capacity bar — 1 dot per spot in capacity_max */}
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: capacity }).map((_, i) => (
            <span
              key={i}
              className={`block w-2 h-2 rounded-full ${
                i < enrolled
                  ? onDark
                    ? 'bg-white'
                    : 'bg-black/80'
                  : onDark
                  ? 'bg-white/30 ring-1 ring-white/50'
                  : 'bg-black/10 ring-1 ring-black/20'
              }`}
            />
          ))}
          <span
            className={`text-[10px] ml-1 ${onDark ? 'text-white/85' : 'text-black/55'}`}
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {enrolled}/{capacity}
          </span>
        </div>

        {coachName && (
          <p
            className={`text-[10px] mt-1.5 truncate ${
              onDark ? 'text-white/85' : 'text-black/60'
            }`}
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {coachName}
          </p>
        )}
      </div>
    </Link>
  );
}
