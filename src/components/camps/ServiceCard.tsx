// Visual card for a single camp_instance inside the calendar panorama.
//
// Colour rules (locked in with Marcelo — full card colour, no cyan base):
//   service_kind='surf_camp'    + Beginner   → WHITE   (white-belt camp)
//   service_kind='surf_camp'    + Novice     → YELLOW  #FFFC00
//   service_kind='surf_camp'    + Foundation → BLUE    #1E6FBF
//   service_kind='surf_lesson'                → FUCSIA  #EC4899  (90-min lesson)
//   service_kind='custom'                     → neutral gray
//
// One glance → coordinator knows the belt + the modality.

import Link from 'next/link';
import { CampStatusBadge } from './CampStatusBadge';

// Pure helper exported so the Month view density dots can stay in sync.
export function paletteFor(
  service_kind: 'surf_camp' | 'surf_lesson' | 'custom' | null | undefined,
  level_name: string | null | undefined,
): { bg: string; onDark: boolean; ring?: string } {
  if (service_kind === 'surf_lesson') {
    return { bg: 'bg-[#EC4899]', onDark: true };
  }
  if (service_kind === 'surf_camp') {
    if (level_name === 'Foundation') return { bg: 'bg-[#1E6FBF]', onDark: true };
    if (level_name === 'Novice') return { bg: 'bg-[#FFFC00]', onDark: false };
    // Beginner (default for surf_camp) — white needs an outline ring so it
    // separates from the surrounding panel background.
    return { bg: 'bg-white', onDark: false, ring: 'ring-1 ring-gray-200' };
  }
  return { bg: 'bg-gray-100', onDark: false };
}

type ServiceCardProps = {
  camp: {
    id: string;
    camp_name: string;
    start_date: string;
    end_date: string;
    status: string;
    modality: string;
    scheduled_time: string | null;
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

  const { bg, onDark, ring } = paletteFor(kind, level);

  return (
    <Link
      href={`/camps/${camp.id}`}
      className={`group relative block ${bg} ${ring ?? ''} rounded-xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md transition-all`}
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
            {camp.scheduled_time && (
              <p
                className={`text-[10px] mt-0.5 ${
                  onDark ? 'text-white/90' : 'text-black/65'
                }`}
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {camp.scheduled_time}
              </p>
            )}
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
