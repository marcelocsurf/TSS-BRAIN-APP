// Visual card for a single camp_instance inside the calendar panorama.
//
// Colours are 100 % template-driven (M72). The platform admin picks
// card + accent at template authoring time; paletteFor() just reads
// the two hex strings and decides if dark text or light text reads
// better on top. Templates without colours fall back to neutral gray.

import Link from 'next/link';
import { Check, AlertTriangle } from 'lucide-react';
import { CampStatusBadge } from './CampStatusBadge';

const NEUTRAL_BG = '#F3F4F6';
const NEUTRAL_ACCENT = '#9CA3AF';

// Standard relative luminance. Returns true if the colour is dark
// enough that white text reads better than black.
function isDark(hex: string): boolean {
  const m = hex.match(/^#?([0-9a-f]{6})$/i);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  // sRGB luminance approximation.
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.6;
}

export type Palette = {
  backgroundColor: string;
  accentColor: string;
  onDark: boolean;
};

// Template-driven palette. If either colour is missing, fall back to
// the neutral gray default seeded by M72 on canonical templates.
export function paletteFor(
  card_color: string | null | undefined,
  accent_color: string | null | undefined,
): Palette {
  const backgroundColor = card_color || NEUTRAL_BG;
  const accentColor = accent_color || NEUTRAL_ACCENT;
  return {
    backgroundColor,
    accentColor,
    onDark: isDark(backgroundColor),
  };
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
    template_id: string | null;
    camp_templates: {
      template_name: string;
      level_name: string;
      service_kind: 'surf_lesson' | 'surf_camp' | 'custom' | null;
      capacity_max: number;
      duration_days: number | null;
      session_duration_minutes: number | null;
      card_color: string | null;
      accent_color: string | null;
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

  const { backgroundColor, accentColor, onDark } = paletteFor(
    tpl?.card_color,
    tpl?.accent_color,
  );

  return (
    <Link
      href={`/camps/${camp.id}`}
      className="group relative block rounded-xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md transition-all"
      style={{ backgroundColor, borderLeft: `4px solid ${accentColor}` }}
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
            {(() => {
              // Compose a small DM-mono meta line: "09:00–10:30 · 1h 30m" /
              // "6 days · 3h/day" / etc. Falls back gracefully when fields
              // are missing.
              const parts: string[] = [];
              if (camp.scheduled_time) parts.push(camp.scheduled_time);
              const mins = tpl?.session_duration_minutes ?? null;
              if (mins != null && mins > 0) {
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                const label = h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
                const days = tpl?.duration_days ?? 1;
                parts.push(days > 1 ? `${days} days · ${label}/day` : label);
              } else if ((tpl?.duration_days ?? 1) > 1) {
                parts.push(`${tpl?.duration_days} days`);
              }
              return parts.length > 0 ? (
                <p
                  className={`text-[10px] mt-0.5 ${
                    onDark ? 'text-white/90' : 'text-black/65'
                  }`}
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {parts.join(' · ')}
                </p>
              ) : null;
            })()}
          </div>
          <CampStatusBadge status={camp.status} />
        </div>

        {/* Capacity bar — filled dots turn green so the coordinator
            can scan how full each service is at a glance. Empty dots
            stay in the card's text colour (translucent). */}
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: capacity }).map((_, i) => (
            <span
              key={i}
              className={`block w-2.5 h-2.5 rounded-full ${
                i < enrolled
                  ? 'bg-emerald-500 ring-1 ring-emerald-700/30'
                  : onDark
                  ? 'bg-white/25 ring-1 ring-white/40'
                  : 'bg-black/10 ring-1 ring-black/20'
              }`}
            />
          ))}
          <span
            className={`text-[10px] ml-1 font-semibold ${
              enrolled === capacity
                ? 'text-emerald-700'
                : onDark
                ? 'text-white/85'
                : 'text-black/55'
            }`}
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {enrolled}/{capacity}
          </span>
        </div>

        {/* Coach signalling — green check + name when assigned,
            amber alert + "No coach" when missing so a coordinator who
            scans the calendar instantly spots services without a coach. */}
        <div className="mt-1.5 flex items-center gap-1 truncate">
          {coachName ? (
            <>
              <Check
                size={11}
                strokeWidth={2.5}
                className="text-emerald-600 shrink-0"
              />
              <p
                className={`text-[10px] truncate ${
                  onDark ? 'text-white/90' : 'text-black/70'
                }`}
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {coachName}
              </p>
            </>
          ) : (
            <>
              <AlertTriangle
                size={11}
                strokeWidth={2.5}
                className="text-amber-600 shrink-0"
              />
              <p
                className="text-[10px] font-semibold truncate text-amber-700"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                No coach assigned
              </p>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
