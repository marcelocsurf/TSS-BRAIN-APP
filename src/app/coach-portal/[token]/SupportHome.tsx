'use client';

// ═══ HOME del staff de apoyo (Front Desk · Operaciones) ═══
// Daren (asistente L1, Puro Surf) — Marcelo 2026-09-15: "necesita que en el
// calendario de la academia le salga toda la información de los alumnos:
// horarios, tallas, etc., porque arma los kits antes de que el alumno venga;
// ve día a día las áreas ocupadas y por quién porque las prepara (bebidas en
// video análisis, toallas); y que pueda escribir el paso a paso de las tareas
// que se le delegan para levantar data de los procesos."
//
// Modo documento del manual v10.1: fondo paper, tarjetas sand, superficies
// internas paper, cyan solo para acción, títulos Archivo, etiquetas mono.
// Teléfono y iPad: en md: los días del calendario van a dos columnas.
import { CalendarDays, MapPin, Users, Shirt, Ruler, Languages, ChevronDown, DoorOpen } from 'lucide-react';
import { CoachTasks } from '@/components/coach-portal/CoachTasks';

const INK = '#10263B', SAND = '#E9E2D2', PAPER = '#F7F9FA', BORDER = '#DCD7C6', GREY = '#55666E', CYAN = '#00D2FF', DEEP = '#00A8CC';
const F_DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.08 };
const F_LABEL: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 11 };

export interface StudentDetail {
  name: string;
  shirt_size: string | null;
  height: string | null;
  weight: string | null;
  languages: string | null;
  stance: string | null;
  age: number | null;
  nationality: string | null;
  board: string | null;
  allergies: string | null;
}
export interface SpaceBookingRow {
  id: string;
  date: string;   // YYYY-MM-DD (El Salvador)
  start: string;  // HH:MM
  end: string;    // HH:MM
  space: string;
  space_type: string | null;
  title: string | null;
  who: string | null;
  camp_name: string | null;
}

function Card({ children, className = '', title, right }: { children: React.ReactNode; className?: string; title?: string; right?: React.ReactNode }) {
  return (
    <div className={`rounded-lg p-4 ${className}`} style={{ background: SAND, border: `1px solid ${BORDER}` }}>
      {(title || right) && (
        <div className="flex items-center justify-between gap-3 mb-3">
          {title && <h2 className="text-[21px]" style={{ ...F_DISPLAY, color: INK }}>{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

function Chip({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-[5px] px-2 py-0.5 text-[12px] font-semibold" style={{ background: PAPER, border: `1px solid ${BORDER}`, color: INK }}>{icon}{children}</span>;
}

function EmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 items-start py-1.5" style={{ borderTop: `1px solid ${BORDER}` }}>
      <span className="shrink-0 w-20" style={{ ...F_LABEL, color: GREY }}>{label}</span>
      <span className="text-[13px] whitespace-pre-line" style={{ color: INK }}>{value}</span>
    </div>
  );
}

export function SupportHome({ coach, upcoming, schedule, spaceBookings = [], emergencyPlan, onGoTo }: {
  coach: any;
  upcoming: any[];
  schedule: any[];
  spaceBookings?: SpaceBookingRow[];
  emergencyPlan?: {
    emergency_numbers: string | null;
    nearest_hospital: string | null;
    lifeguard_contact: string | null;
    emergency_address: string | null;
    emergency_protocol: string | null;
  } | null;
  onGoTo?: (tab: string) => void;
}) {
  const initials = `${coach.first_name?.[0] || ''}${coach.last_name?.[0] || ''}`.toUpperCase();
  const title = coach.job_title || 'Team member';
  const hasEmergency = !!emergencyPlan && (
    emergencyPlan.emergency_numbers || emergencyPlan.nearest_hospital ||
    emergencyPlan.lifeguard_contact || emergencyPlan.emergency_address || emergencyPlan.emergency_protocol
  );

  // Un día = todo lo que pasa en la academia ese día: los grupos que corren
  // (con sus alumnos y tallas) y los espacios reservados (y por quién).
  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days: Array<{ key: string; label: string; items: any[]; spaces: SpaceBookingRow[] }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getTime() + i * 86400000);
    const key = dayKey(d);
    const items = schedule.filter((s) => s.start_date <= key && key <= (s.end_date || s.start_date));
    const spaces = spaceBookings.filter((b) => b.date === key);
    if (items.length === 0 && spaces.length === 0) continue;
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    items.sort((a, b) => (a.scheduled_time || '99').localeCompare(b.scheduled_time || '99'));
    days.push({ key, label, items, spaces });
  }

  return (
    <div className="space-y-4">
      {/* Identidad */}
      <Card>
        <div className="flex items-center gap-3">
          {coach.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coach.photo_url} alt={coach.display_name} className="w-14 h-14 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black shrink-0" style={{ background: '#061C2B', color: CYAN }}>{initials}</div>
          )}
          <div className="min-w-0">
            <p className="text-[22px] leading-tight truncate" style={{ ...F_DISPLAY, color: INK }}>{coach.display_name}</p>
            <p style={{ ...F_LABEL, color: DEEP }}>{title}</p>
          </div>
        </div>
      </Card>

      {/* Mis tareas (con el paso a paso que escribe quien la ejecuta) */}
      <CoachTasks token={coach.portal_token} onOpenInventory={onGoTo ? () => onGoTo('inventory') : undefined} />

      {/* Calendario de la academia: la foto operativa de los próximos 7 días */}
      <div>
        <div className="flex items-end justify-between gap-3 px-1 mb-2">
          <h2 className="text-[23px]" style={{ ...F_DISPLAY, color: INK }}>Academy schedule</h2>
          <span style={{ ...F_LABEL, color: GREY }}>Next 7 days</span>
        </div>
        {days.length === 0 ? (
          <Card><p className="text-[13px]" style={{ color: GREY }}>Nothing scheduled this week.</p></Card>
        ) : (
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4 md:items-start">
            {days.map((d) => (
              <Card key={d.key} className={d.label === 'Today' ? 'md:col-span-2' : ''}
                title={d.label}
                right={<span style={{ ...F_LABEL, color: d.label === 'Today' ? DEEP : GREY }}>{d.items.length} group{d.items.length === 1 ? '' : 's'}{d.spaces.length ? ` · ${d.spaces.length} space${d.spaces.length === 1 ? '' : 's'}` : ''}</span>}>
                <div className="space-y-2">
                  {d.items.map((s: any) => {
                    const dl = (s.day_logistics ?? []).find((x: any) => x.session_date === d.key);
                    const details: StudentDetail[] = Array.isArray(s.student_details) ? s.student_details : [];
                    const time = dl?.class_start_time ? dl.class_start_time.slice(0, 5) : s.scheduled_time ? s.scheduled_time.slice(0, 5) : '—';
                    return (
                      <details key={`${d.key}-${s.id}`} className="rounded-[5px] overflow-hidden" style={{ background: PAPER, border: `1px solid ${BORDER}` }} open={d.label === 'Today'}>
                        <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center gap-3">
                          <span className="shrink-0 w-12 text-[15px] font-bold tabular-nums" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', color: DEEP }}>{time}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[15px] font-bold leading-tight" style={{ color: INK }}>{s.camp_name}</span>
                            <span className="block text-[12px]" style={{ color: GREY }}>
                              {s.coach_name ? `Coach ${s.coach_name}` : 'No coach assigned'}{s.template_name ? ` · ${s.template_name}` : ''}
                            </span>
                            {/* Quién va además del coach: asistentes, filmers, etc. */}
                            {Array.isArray(s.staff) && s.staff.filter((m: any) => m.role !== 'head_coach' && m.role !== 'coach').length > 0 && (
                              <span className="block text-[12px] font-semibold" style={{ color: INK }}>
                                {s.staff.filter((m: any) => m.role !== 'head_coach' && m.role !== 'coach').map((m: any) => `${m.role.replace(/_/g, ' ')} ${m.name}${m.pending ? ' (pending)' : ''}`).join(' · ')}
                              </span>
                            )}
                            {dl && (dl.surf_venue || dl.transport_needed) && (
                              <span className="block text-[12px] font-semibold" style={{ color: DEEP }}>
                                {dl.surf_venue ? `🏖 ${dl.surf_venue}` : ''}
                                {dl.transport_needed ? `${dl.surf_venue ? ' · ' : ''}🚐 out ${dl.transport_depart?.slice(0, 5) ?? '—'} / back ${dl.transport_return?.slice(0, 5) ?? '—'}${dl.transport_status === 'cancelled' ? ' (cancelled)' : ''}` : ''}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 inline-flex items-center gap-1 text-[12px] font-bold rounded-full px-2 py-0.5" style={{ background: 'rgba(0,210,255,.14)', color: DEEP }}>
                            <Users size={12} /> {s.students}
                          </span>
                          <ChevronDown size={16} className="shrink-0" style={{ color: GREY }} />
                        </summary>
                        {/* Los alumnos con lo que hace falta para el kit: talla, altura/peso, idioma, stance, tabla. */}
                        <div className="px-3 pb-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                          <p className="mt-2.5 mb-1.5" style={{ ...F_LABEL, color: GREY }}>Students · kit prep</p>
                          {details.length === 0 ? (
                            <p className="text-[13px]" style={{ color: GREY }}>No students enrolled yet.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {details.map((st) => (
                                <li key={st.name} className="rounded-[5px] px-2.5 py-2" style={{ background: SAND }}>
                                  <p className="text-[14px] font-bold leading-tight" style={{ color: INK }}>
                                    {st.name}
                                    {(st.age || st.nationality) && <span className="font-normal text-[12px] ml-1.5" style={{ color: GREY }}>{[st.age ? `${st.age} y` : null, st.nationality].filter(Boolean).join(' · ')}</span>}
                                  </p>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    <Chip icon={<Shirt size={11} />}>{st.shirt_size ? `Shirt ${st.shirt_size}` : 'Shirt —'}</Chip>
                                    {(st.height || st.weight) && <Chip icon={<Ruler size={11} />}>{[st.height, st.weight].filter(Boolean).join(' · ')}</Chip>}
                                    {st.languages && <Chip icon={<Languages size={11} />}>{st.languages}</Chip>}
                                    {st.stance && <Chip>{st.stance}</Chip>}
                                    {st.board && <Chip>🏄 {st.board}</Chip>}
                                    {st.allergies && <Chip>⚠ {st.allergies}</Chip>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </details>
                    );
                  })}

                  {/* Espacios reservados ese día: qué área, a qué hora, para qué y quién. */}
                  {d.spaces.length > 0 && (
                    <div className="rounded-[5px] px-3 py-2.5" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
                      <p className="mb-1.5 inline-flex items-center gap-1.5" style={{ ...F_LABEL, color: GREY }}><DoorOpen size={12} /> Spaces in use</p>
                      <ul className="space-y-1">
                        {d.spaces.map((b) => (
                          <li key={b.id} className="flex items-start gap-3 text-[13px]" style={{ color: INK }}>
                            <span className="shrink-0 w-[92px] tabular-nums font-bold" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', color: DEEP }}>{b.start}–{b.end}</span>
                            <span className="min-w-0">
                              <span className="font-bold">{b.space}</span>
                              {(b.title || b.camp_name) && <span> · {b.title || b.camp_name}</span>}
                              {b.who && <span className="block text-[12px]" style={{ color: GREY }}>{b.who}</span>}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Espacios: preparar y limpiar las áreas */}
      {onGoTo && (
        <button type="button" onClick={() => onGoTo('spaces')}
          className="w-full text-left rounded-lg p-4 flex items-center justify-between gap-3"
          style={{ background: SAND, border: `1px solid ${BORDER}` }}>
          <span className="min-w-0">
            <span className="block text-[16px] font-bold" style={{ color: INK }}>Espacios — room bookings</span>
            <span className="block text-[12px]" style={{ color: GREY }}>See which spaces are reserved today, to prepare and clean them.</span>
          </span>
          <span className="text-lg shrink-0" style={{ color: DEEP }}>→</span>
        </button>
      )}

      {/* Mis servicios */}
      <Card title="My services" right={upcoming.length > 0 ? <span style={{ ...F_LABEL, color: GREY }}>{upcoming.length}</span> : undefined}>
        {upcoming.length === 0 ? (
          <p className="text-[13px]" style={{ color: GREY }}>No upcoming services assigned.</p>
        ) : (
          <div className="space-y-1.5">
            {upcoming.map((s: any) => (
              <div key={s.id} className="rounded-[5px] px-3 py-2.5" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
                <p className="text-[14px] font-bold" style={{ color: INK }}>{s.camp_name}</p>
                <p className="text-[12px]" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', color: GREY }}>
                  {new Date(s.start_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  {s.scheduled_time ? ` · ${s.scheduled_time.slice(0, 5)}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Plan de emergencia */}
      {hasEmergency && emergencyPlan && (
        <details className="rounded-lg p-4" style={{ background: SAND, border: `1px solid ${BORDER}` }}>
          <summary className="cursor-pointer list-none flex items-center justify-between">
            <span className="text-[21px]" style={{ ...F_DISPLAY, color: '#B03A2E' }}>Emergency plan</span>
            <ChevronDown size={16} style={{ color: GREY }} />
          </summary>
          <div className="mt-3">
            {emergencyPlan.emergency_numbers && <EmRow label="Numbers" value={emergencyPlan.emergency_numbers} />}
            {emergencyPlan.nearest_hospital && <EmRow label="Hospital" value={emergencyPlan.nearest_hospital} />}
            {emergencyPlan.lifeguard_contact && <EmRow label="Lifeguard" value={emergencyPlan.lifeguard_contact} />}
            {emergencyPlan.emergency_address && <EmRow label="Meeting pt" value={emergencyPlan.emergency_address} />}
            {emergencyPlan.emergency_protocol && <EmRow label="Protocol" value={emergencyPlan.emergency_protocol} />}
          </div>
        </details>
      )}
      <span className="hidden"><CalendarDays size={1} /><MapPin size={1} /></span>
    </div>
  );
}
