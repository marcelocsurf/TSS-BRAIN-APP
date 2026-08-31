import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, AlertTriangle, ShieldCheck, Heart, Phone, User, Waves,
  Target, Activity, Clock,
  type LucideIcon,
} from 'lucide-react';
import { getCoachStudentDetail } from '@/lib/actions/coach-students';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import { BeltConfirm } from '@/components/coach-portal/BeltConfirm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string; studentId: string }>;
}

export default async function CoachStudentDetailPage({ params }: Props) {
  const { token, studentId } = await params;
  const s = await getCoachStudentDetail(token, studentId);
  if (!s) notFound();

  const belt = BELT_DISPLAY[s.belt_level as BeltLevel];
  const fullName = `${s.first_name} ${s.last_name ?? ''}`.trim();
  const hasSafetyFlag = !!(s.allergies || s.injuries || s.medical_notes || s.risk_notes);

  return (
    <div className="min-h-screen bg-[var(--tss-gray-50)] pb-12">
      {/* Header */}
      <div className="bg-[var(--tss-navy)] text-white px-4 py-5">
        <Link
          href={`/coach-portal/${token}/students`}
          className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white mb-2"
        >
          <ArrowLeft size={12} /> Back to students
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <div
            className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ backgroundColor: belt?.color || '#999' }}
          >
            {s.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              `${s.first_name[0] ?? ''}${s.last_name?.[0] ?? ''}`.toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1
              className="text-2xl font-bold truncate leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {fullName}
            </h1>
            <p
              className="text-[10px] text-white/60 mt-1 tracking-[0.2em] uppercase"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              {belt?.en}
              {s.belt_provisional ? ' · PROVISIONAL' : ''}
              {s.ocean_level ? ` · ${s.ocean_level} ocean` : ''}
              {s.current_sequence_number != null && s.current_step_order != null
                ? ` · Seq ${s.current_sequence_number} / Step ${s.current_step_order}`
                : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Cinta PROVISIONAL del quiz: el coach la confirma o la ajusta acá
            — el circuito que faltaba (diagnóstico del quiz, 2026-08-31). */}
        {s.belt_provisional && (
          <BeltConfirm
            token={token}
            studentId={s.id}
            currentBelt={s.belt_level}
            quizScore={s.level_quiz_score}
          />
        )}

        {/* SAFETY-FIRST: emergency + medical at the top */}
        <Section
          title="Safety"
          Icon={ShieldCheck}
          accent={hasSafetyFlag ? 'amber' : 'cyan'}
        >
          {hasSafetyFlag && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 leading-relaxed">
                This student has medical or risk notes. Read them before any session.
              </p>
            </div>
          )}
          <KV label="Swim level" value={s.swim_level} />
          <KV label="Waiver" value={s.waiver_signed ? 'Signed' : 'NOT signed'} danger={!s.waiver_signed} />
          <KV label="Allergies" value={s.allergies} />
          <KV label="Injuries / chronic conditions" value={s.injuries} />
          <KV label="Medical notes" value={s.medical_notes} />
          <KV label="Risk notes" value={s.risk_notes} />
        </Section>

        {/* Emergency contact */}
        <Section title="Emergency contact" Icon={Phone}>
          <KV label="Name" value={s.emergency_contact_name} />
          <KV label="Phone" value={s.emergency_contact_phone} />
        </Section>

        {/* Identity */}
        <Section title="Identity" Icon={User}>
          <KV label="Age" value={s.age != null ? String(s.age) : null} />
          <KV label="Date of birth" value={s.date_of_birth} />
          <KV label="Gender" value={s.gender} />
          <KV label="Nationality" value={s.nationality} />
          <KV label="Languages" value={s.languages} />
          <KV label="Instagram" value={s.instagram} />
          <KV label="Height" value={s.height} />
          <KV label="Weight" value={s.weight} />
        </Section>

        {/* Surf profile */}
        <Section title="Surf profile" Icon={Waves}>
          <KV label="Stance" value={s.stance} />
          <KV label="Surf experience (years)" value={s.surf_experience_years} />
          <KV label="Frequency" value={s.surf_frequency} />
          <KV label="Board type" value={s.board_type} />
          <KV label="Other sports" value={s.other_sports} />
          <KV label="Learning style" value={s.learning_style} />
        </Section>

        {/* Level quiz — lo que el alumno declaró, habilidad por habilidad.
            Acá se ven las contradicciones (Flow alto con Riding bajo = el
            clic optimista) antes de entrar al agua. */}
        {s.level_quiz_score != null && Array.isArray(s.level_quiz_skillmap) && s.level_quiz_skillmap.length > 0 && (
          <Section title={`Level quiz · ${s.level_quiz_score}/70`} Icon={Activity}>
            <div className="space-y-1.5">
              {s.level_quiz_skillmap.map((sk) => (
                <div key={sk.name} className="flex items-center gap-2">
                  <span className="w-24 text-right text-[10px] text-gray-500 shrink-0">{sk.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${sk.pct}%`, background: sk.pct >= 70 ? '#0090B0' : '#C8D0DC' }} />
                  </div>
                  <span className="w-8 text-[10px] text-gray-400 font-mono text-right">{sk.pct}%</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-2 leading-snug">
              Self-reported before arriving — compare it with what you see in the water.
            </p>
          </Section>
        )}

        {/* Goals + barriers */}
        <Section title="Goals & barriers" Icon={Target}>
          <KV label="Primary goal" value={s.primary_goal} />
          <KV label="Short-term goal" value={s.goal_short_term} />
          <KV label="Mid-term goal" value={s.goal_mid_term} />
          <KV label="Long-term goal" value={s.goal_long_term} />
          <KV label="Biggest barrier" value={s.biggest_barrier} />
          <KV label="Fears / phobias" value={s.fears_phobias} />
        </Section>

        {/* Last session */}
        <Section title="Last session" Icon={Clock}>
          <KV
            label="Date"
            value={s.last_session_date ? new Date(s.last_session_date).toLocaleDateString() : null}
          />
          <KV label="Mission" value={s.last_session_mission} />
          <KV label="Pillar" value={s.last_session_pilar} />
          <KV label="Drill" value={s.last_session_drill} />
          <KV label="Status" value={s.last_session_status} />
          <KV label="Homework left" value={s.last_homework} />
          <KV label="Next recommended focus" value={s.next_recommended_focus} />
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  Icon,
  accent = 'cyan',
  children,
}: {
  title: string;
  Icon: LucideIcon;
  accent?: 'cyan' | 'amber';
  children: React.ReactNode;
}) {
  const color = accent === 'amber' ? 'text-amber-700' : 'text-[var(--tss-cyan)]';
  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">
      <header className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <Icon size={16} strokeWidth={1.75} className={color} />
        <h2 className="text-sm font-semibold text-[var(--tss-navy)]">{title}</h2>
      </header>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </section>
  );
}

function KV({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string | null | undefined;
  danger?: boolean;
}) {
  const empty = value == null || value === '' || value === '—';
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <span
        className="text-[10px] font-mono uppercase tracking-wider text-gray-400 w-32 flex-shrink-0"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
      <span
        className={`flex-1 leading-relaxed whitespace-pre-line ${
          empty ? 'text-gray-300 italic' : danger ? 'text-red-700 font-semibold' : 'text-[var(--tss-navy)]'
        }`}
      >
        {empty ? '—' : value}
      </span>
    </div>
  );
}
