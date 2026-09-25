import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, AlertTriangle, ShieldCheck, Heart, Phone, User, Waves,
  Target, Activity, Clock, BookOpen, Star,
  type LucideIcon,
} from 'lucide-react';
import { anyMedicalNote } from '@/lib/constants/medical';
import { getCoachStudentDetail } from '@/lib/actions/coach-students';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import { BeltConfirm } from '@/components/coach-portal/BeltConfirm';
import { OceanConfirm } from '@/components/coach-portal/OceanConfirm';
import { levelForScore, LEVELS, isSelfSufficient } from '@/lib/quiz/surf-level';
import { V2_BOARD_LABEL, V2_NEEDS } from '@/lib/quiz/surf-level-v2-scenes';

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
  const hasSafetyFlag = anyMedicalNote(s.allergies, s.injuries, s.medical_notes, s.risk_notes);

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
              style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace' }}
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

      <div className="max-w-lg md:max-w-4xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:items-start">
        {/* ── RETURNING (Marcelo 2026-09-17): el alumno vuelve después de 14+
            días. Arriba de todo: cuánto pasó, qué le dijiste, qué hizo en el
            medio, y el botón para arrancar desde ahí. ── */}
        {s.returning && (
          <section className="md:col-span-2 rounded-lg overflow-hidden" style={{ background: '#E9E2D2', border: '1px solid #00A8CC', borderLeft: '6px solid #00D2FF' }}>
            <div className="px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', color: '#00A8CC' }}>
                Returning · {s.returning.days_since} days since your last session{s.returning.last_by ? ` · ${s.returning.last_by}` : ''}
              </p>
              <p className="text-[20px] font-black uppercase leading-tight mt-1" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', color: '#10263B' }}>
                Start from where you left off
              </p>
              {s.returning.last_focus ? (
                <p className="text-[14px] mt-2 leading-snug" style={{ color: '#10263B' }}>
                  <span className="font-bold">Last time you said:</span> {s.returning.last_focus}
                </p>
              ) : (
                <p className="text-[14px] mt-2" style={{ color: '#55666E' }}>No next focus was written last time.</p>
              )}
              <p className="text-[13px] mt-2 leading-snug" style={{ color: '#55666E' }}>
                <span className="font-bold" style={{ color: '#10263B' }}>Since then:</span>{' '}
                {s.returning.since.visits} portal visit{s.returning.since.visits === 1 ? '' : 's'}
                {s.returning.since.last_seen ? ` · last seen ${new Date(s.returning.since.last_seen).toLocaleDateString()}${s.returning.since.last_screen ? ` (${s.returning.since.last_screen})` : ''}` : ''}
                {' · '}{s.returning.since.lets_play} Let&apos;s Play session{s.returning.since.lets_play === 1 ? '' : 's'}
                {' · '}{s.returning.since.lessons} lesson{s.returning.since.lessons === 1 ? '' : 's'} completed
              </p>
              <Link href={`/coach-portal/${token}?tab=plan`} className="inline-flex items-center justify-center mt-3 rounded-[5px] px-4 py-2.5 text-[13px] font-black uppercase tracking-wide" style={{ background: '#00D2FF', color: '#061C2B', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>
                Plan today from here →
              </Link>
            </div>
          </section>
        )}
        {/* OCÉANO sin confirmar: va PRIMERO — la regla del agua exige el
            océano confirmado antes de poder confirmar una cinta Blue+. */}
        {s.ocean_level_provisional !== false && (
          <OceanConfirm token={token} studentId={s.id} currentLevel={s.ocean_level} />
        )}
        {/* Cinta PROVISIONAL del quiz: el coach la confirma o la ajusta acá
            — el circuito que faltaba (diagnóstico del quiz, 2026-08-31). */}
        {s.belt_provisional && (() => {
          // Si el score del quiz da una banda MAYOR que la cinta guardada,
          // hubo cap — se le explica al coach cuál (agua o evidencia) para
          // que la "contradicción" no parezca error de bandas.
          let cappedNote: string | null = null;
          if (s.level_quiz_v2?.capped_by) {
            // V2: el cap viene GUARDADO con las escenas exactas — nada que
            // derivar. Es el plan del día 1 del coach.
            const gaps = (s.level_quiz_v2.capped_gaps ?? []).join(', ');
            cappedNote =
              `Score reached ${s.level_quiz_v2.uncapped_name} — capped by ${
                s.level_quiz_v2.capped_by === 'water' ? 'water self-sufficiency' : 'declared skills'
              }${gaps ? ` (held by: ${gaps})` : ''}.`;
          } else if (s.level_quiz_v2 == null && s.level_quiz_score != null) {
            const scoreBand = levelForScore(s.level_quiz_score);
            const beltIdx = LEVELS.findIndex((l) => l.belt === s.belt_level);
            if (beltIdx >= 0 && LEVELS.indexOf(scoreBand) > beltIdx) {
              cappedNote = !isSelfSufficient(s.ocean_level)
                ? `Score reached ${scoreBand.name} — capped by water autonomy (not self-sufficient catching waves alone yet).`
                : `Score reached ${scoreBand.name} — capped by declared skills (see the skill map below).`;
            }
          }
          return (
            <BeltConfirm
              token={token}
              studentId={s.id}
              currentBelt={s.belt_level}
              quizScore={s.level_quiz_score}
              cappedNote={cappedNote}
            />
          );
        })()}

        {/* SAFETY-FIRST: emergency + medical at the top */}
        <Section
          title="Safety"
          Icon={ShieldCheck}
          accent={hasSafetyFlag ? 'amber' : 'cyan'}
        >
          {hasSafetyFlag && (
            <div className="bg-amber-50 border border-amber-200 rounded-[5px] p-3 mb-3 flex items-start gap-2">
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

        {/* LISTO PARA CONFIRMAR (Marcelo 2026-09-25): el alumno se fue del camp
            y siguió solo. Lo que dejaste bajo 4★ y él ya trabaja y se pone 4★+
            es lo primero que evaluás cuando lo ves de nuevo. */}
        {s.ready_to_confirm.length > 0 && (
          <Section title="Ready for you to confirm" Icon={Star} accent="amber">
            <p className="text-[11px] text-[#55666E] pb-1">They rate these 4★+ and trained them since your star. Yours counts until you confirm it in the water.</p>
            <ul className="m-0 p-0 list-none space-y-1">
              {s.ready_to_confirm.map((r) => (
                <li key={r.step_id} className="text-[13px] text-[#10263B] leading-snug">
                  {r.sequence_label ? <span className="text-[#55666E]">{r.sequence_label} · </span> : null}
                  <span className="font-semibold">{r.step_title}</span>
                  <span className="block text-[12px] text-[#55666E]">
                    student {r.self_stars}★ · your {r.coach_stars}★{r.coach_rated_at ? ` (${new Date(r.coach_rated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/El_Salvador' })})` : ''} · trained {r.sessions_since}× since{r.last_session_at ? `, last ${new Date(r.last_session_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/El_Salvador' })}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}


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
          <KV label="Self-sufficiency" value={(s as any).self_sufficiency} />
          <KV label="Fitness" value={(s as any).fitness_level} />
          <KV label="Wave preference" value={(s as any).wave_preference} />
          <KV label="Board type" value={s.board_type} />
          <KV label="Board size" value={(s as any).board_length_feet ? `${(s as any).board_length_feet}'${(s as any).board_length_inches ?? 0}"${(s as any).board_volume_liters ? ` · ${(s as any).board_volume_liters} L` : ''}` : (s as any).board_volume_liters ? `${(s as any).board_volume_liters} L` : null} />
          <KV label="Comfortable wave size" value={(s as any).comfort_wave_size} />
          <KV label="Ocean comfort" value={(s as any).water_comfort} />
          <KV label="Other sports" value={s.other_sports} />
          <KV label="Learning style" value={s.learning_style} />
          <KV label="Surf injuries" value={(s as any).surf_injuries} />
          <KV label="Returning student" value={(s as any).returning_student ? 'Yes' : null} />
          {/* Registro (2026-09-17): cómo y cuándo entró, qué quiz hizo. */}
          <KV label="Signed up" value={(s as any).intake_completed_at ? `${new Date((s as any).intake_completed_at).toLocaleDateString()} · ${(s as any).intake_tier === 'extended' ? 'full intake' : 'basic intake'}` : 'intake not done'} />
          <KV label="Level quiz" value={(s as any).level_quiz_completed_at ? `${new Date((s as any).level_quiz_completed_at).toLocaleDateString()} · ${s.level_quiz_v2 ? 'v2 (session film)' : 'v1 (old quiz)'}` : 'not done'} />
          <KV label="Ocean level" value={(s as any).ocean_level ? `${String((s as any).ocean_level).replace(/_/g, ' ')}${(s as any).ocean_level_provisional === false ? ' · confirmed' : ' · provisional'}` : null} />
          <KV label="Shirt size" value={(s as any).shirt_size} />
        </Section>

        {/* Level quiz — lo que el alumno declaró, habilidad por habilidad.
            Acá se ven las contradicciones (Flow alto con Riding bajo = el
            clic optimista) antes de entrar al agua. */}
        {s.level_quiz_score != null && Array.isArray(s.level_quiz_skillmap) && s.level_quiz_skillmap.length > 0 && (
          <Section title={`Level quiz · ${s.level_quiz_score}/${s.level_quiz_v2 ? 100 : 70}`} Icon={Activity}>
            {s.level_quiz_v2 && (
              <div className="mb-3 space-y-1">
                <p className="text-[11px] text-[#55666E] font-mono">
                  THE OCEAN {s.level_quiz_v2.mar}/50 · THE WAVE {s.level_quiz_v2.ola}/50
                  {s.level_quiz_v2.board ? ` · ${(V2_BOARD_LABEL[s.level_quiz_v2.board] ?? s.level_quiz_v2.board).toUpperCase()}` : ''}
                </p>
                {/* Las dos cosas que eligió trabajar, en orden (Marcelo 2026-09-25). */}
                {((s.level_quiz_v2 as any).needs?.length ?? 0) > 0 && (
                  <p className="text-[12px] text-[#10263B]">
                    <span className="font-semibold">Wants to work on:</span>{' '}
                    {((s.level_quiz_v2 as any).needs as number[]).map((n, i) => `${i + 1}. ${V2_NEEDS[n] ?? n}`).join(' · ')}
                  </p>
                )}
                {s.level_quiz_v2.capped_by && (s.level_quiz_v2.capped_gaps?.length ?? 0) > 0 && (
                  <p className="text-[11px] font-semibold text-amber-700">
                    What held it: {s.level_quiz_v2.capped_gaps.join(' · ')} — start day 1 there.
                  </p>
                )}
              </div>
            )}
            <div className="space-y-1.5">
              {s.level_quiz_skillmap.map((sk) => (
                <div key={sk.name} className="flex items-center gap-2">
                  <span className="w-24 text-right text-[10px] text-[#55666E] shrink-0">{sk.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[#EDF3F5] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${sk.pct}%`, background: sk.pct >= 70 ? '#0090B0' : '#C8D0DC' }} />
                  </div>
                  <span className="w-8 text-[10px] text-[#55666E] font-mono text-right">{sk.pct}%</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#55666E] mt-2 leading-snug">
              Self-reported before arriving — compare it with what you see in the water.
            </p>
          </Section>
        )}

        {/* Goals + barriers */}
        <Section title="Goals & barriers" Icon={Target}>
          <KV label="Primary goal" value={s.primary_goal} />
          <KV label="This visit (Welcome back)" value={(s as any).personal_goal} />
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
            value={s.last_session_date ? `${new Date(s.last_session_date).toLocaleDateString()}${s.last_session_by ? ` · ${s.last_session_by}` : ''}` : null}
          />
          {/* Calculado desde las estrellas del coach (Marcelo 2026-09-17): qué
              secuencia se vio, si completa o un detalle, y el paso más flojo. */}
          {s.last_session_work.length > 0 ? (
            <div className="flex items-baseline gap-3 text-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] w-32 flex-shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>Worked on</span>
              <ul className="flex-1 m-0 p-0 list-none space-y-1">
                {s.last_session_work.map((w) => (
                  <li key={w.sequence_id} className="text-[var(--tss-navy)] leading-snug">
                    <span className="font-semibold">{w.sequence_name}</span>
                    <span className="text-[#55666E]"> · {w.complete ? 'full sequence' : `detail · ${w.rated} of ${w.total} steps`}</span>
                    {w.weakest && <span className="block text-[12px] text-[#55666E]">Weakest: {w.weakest.title} ★{w.weakest.rating}</span>}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <KV label="Worked on" value={s.last_session_mission} />
          )}
          <KV label="Status" value={s.last_session_status} />
          <KV label="Homework left" value={s.last_homework} />
          <KV label="Next focus" value={s.next_focus_label ? `${s.next_focus_label}${s.coach_focus?.note ? ` — ${s.coach_focus.note}` : ''}` : s.next_recommended_focus} />
          {/* ¿La trabajó? (2026-09-25): una sesión propia sobre ese paso o
              secuencia después de que la dejaste. Si es solo texto, no se
              puede saber — lo apaga tu próximo foco. */}
          {s.coach_focus && (
            <KV
              label="Worked it?"
              value={s.coach_focus.text_only
                ? 'Text only — pick a sequence next time and it tracks itself'
                : s.coach_focus.worked_at
                  ? `Yes · on their own, ${new Date(s.coach_focus.worked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/El_Salvador' })}${s.coach_focus.set_by_name ? ` · left by ${s.coach_focus.set_by_name}` : ''}`
                  : `Not yet${s.coach_focus.set_at ? ` · left ${new Date(s.coach_focus.set_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/El_Salvador' })}` : ''}${s.coach_focus.set_by_name ? ` by ${s.coach_focus.set_by_name}` : ''} · first in their Let's Play`}
            />
          )}
          <KV label="In the portal" value={(s as any).portal_last_seen_at ? `${new Date((s as any).portal_last_seen_at).toLocaleDateString()} · ${(s as any).portal_last_screen ?? ''} · ${(s as any).portal_visit_count ?? 0} visits` : 'never opened it'} />
        </Section>

        {/* LA BITÁCORA (2026-09-25): la misma línea de tiempo que ve el
            coordinador en la ficha — sesiones con coach y lo que dejaron,
            misiones y runs por su cuenta con qué las frenó, lecciones, nivel
            de agua, cinta, evaluación final, encuesta. Una sola fuente. */}
        {s.activity && (
          <Section title="Logbook" Icon={BookOpen}>
            <p className="text-[11px] text-[#55666E] pb-1">
              {s.activity.counts.coach_sessions} sessions with a coach · {s.activity.counts.self_missions} on their own · {s.activity.counts.free_surfs} free surf · {s.activity.counts.lessons} lessons
            </p>
            {s.activity.timeline.length === 0 ? (
              <p className="text-[12px] text-[#55666E] py-1">Nothing logged yet.</p>
            ) : (
              <ul className="m-0 p-0 list-none divide-y divide-[#DCD7C6]/60">
                {s.activity.timeline.map((t, i) => (
                  <li key={i} className="py-1.5 flex items-start gap-2 text-[13px]">
                    <span className="shrink-0 text-[11px] font-mono text-[#55666E] w-14 pt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="flex-1 min-w-0 text-[#10263B] leading-snug">
                      {LOG_KIND[t.kind] ? <span className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] mr-1.5">{LOG_KIND[t.kind]}</span> : null}
                      <span className="font-semibold">{t.title}</span>
                      {t.minutes > 0 && <span className="text-[#55666E]"> · {t.minutes} min</span>}
                      {!t.completed && t.kind !== 'coach' && <span className="text-amber-700"> · not finished</span>}
                      {t.detail && <span className="block text-[12px] text-[#55666E]">{t.detail}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {s.activity.total_events > s.activity.timeline.length && (
              <p className="text-[11px] text-[#55666E] pt-1">Showing the last {s.activity.timeline.length} of {s.activity.total_events}.</p>
            )}
          </Section>
        )}

        {/* Lo que el alumno dice de sí mismo (2026-09-10): llegás sabiendo
            qué cree que tiene y qué se propuso. La autoevaluación no es
            ejecución — vos la confirmás en el agua. */}
        {(s.self_assessed.length > 0 || s.own_tasks.length > 0 || s.open_session) && (
          <Section title="What the student says" Icon={Clock} accent="amber">
            {s.open_session && (
              <KV label="Open plan in the water" value={s.open_session.name} />
            )}
            {s.self_assessed.length > 0 && (
              <div className="py-1">
                <p className="text-[11px] text-[#55666E] mb-1">Self-assessed, not surfed yet — confirm it in the water</p>
                <ul className="space-y-0.5">
                  {s.self_assessed.map((r) => (
                    <li key={r.step_id} className="text-[13px] text-[#10263B]">{r.title} <span className="font-semibold">· {r.rating}★</span> <span className="text-[11px] text-[#55666E]">self-assessed</span></li>
                  ))}
                </ul>
              </div>
            )}
            {s.own_tasks.length > 0 && (
              <div className="py-1">
                <p className="text-[11px] text-[#55666E] mb-1">Their list — what they chose to work on</p>
                <ul className="space-y-0.5">
                  {s.own_tasks.map((t, i) => (
                    <li key={i} className="text-[13px] text-[#10263B]">{t.step_title}{t.detail ? <span className="text-[#55666E]"> · {t.detail}</span> : null}</li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

// Etiqueta solo donde el título no lo dice solo: una sesión puede ser con
// coach, por su cuenta o free surf; "Water level: …" y "Belt: …" ya se explican.
const LOG_KIND: Record<string, string> = {
  coach: 'with coach', mission: 'on their own', free_surf: 'free surf', lesson: 'course',
};

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
    <section className="bg-[#E9E2D2] border border-[#DCD7C6] rounded-lg shadow-sm overflow-hidden">
      <header className="px-4 py-3 border-b border-[#DCD7C6] flex items-center gap-2 bg-[#F7F9FA]">
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
        className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] w-32 flex-shrink-0"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
      <span
        className={`flex-1 leading-relaxed whitespace-pre-line ${
          empty ? 'text-[#B8B1A0] italic' : danger ? 'text-red-700 font-semibold' : 'text-[var(--tss-navy)]'
        }`}
      >
        {empty ? '—' : value}
      </span>
    </div>
  );
}
