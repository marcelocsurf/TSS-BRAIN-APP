import { notFound } from 'next/navigation';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { createAdminClient } from '@/lib/supabase/admin';
import { getServicePlan } from '@/lib/actions/service-planner';
import { SEQUENCE_PAGES, elementTitle } from '@/lib/sequence-pages';
import { waterSequencesOfBlocks } from '@/lib/sequence-pages/day-sequences';
import { displayDate } from '@/lib/utils/tz';
import { PrintButton } from './PrintButton';

// ═══ El plan del día, en una hoja ═══
// Marcelo (2026-09-24): "que pueda imprimir el plan de la sesión en PDF, con
// la hora, el lugar, si se reservó un área, si se pidió transporte, las
// condiciones, y lo que va a hacer cada quien. Que no abrume".
// Sin librería de PDF: es una página con estilos de impresión, y el navegador
// ofrece "Guardar como PDF" desde el mismo diálogo de imprimir.

const archivo = Archivo({ subsets: ['latin'], weight: ['400', '600', '700', '800', '900'], variable: '--font-archivo', display: 'swap' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-plex', display: 'swap' });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const dynamic = 'force-dynamic';

const INK = '#061C2B', MUTED = '#55666E', BORDER = '#DCD7C6', SAND = '#E9E2D2';
const MONO: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.14em' };
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif' };

const hhmm = (t: string | null | undefined) => {
  if (!t) return null;
  const [h, m] = String(t).split(':').map(Number);
  if (Number.isNaN(h)) return null;
  return `${((h + 11) % 12) + 1}:${String(m ?? 0).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
const seqLabel = (c: any) => (c.eyebrow ? c.title : `#${c.number} · ${c.title}`);

export default async function PrintPlanPage({ params, searchParams }: {
  params: Promise<{ token: string; campId: string }>;
  searchParams?: Promise<{ day?: string }>;
}) {
  const { token, campId } = await params;
  const sp = searchParams ? await searchParams : {};
  if (!UUID_RE.test(token)) notFound();

  const day = sp.day ? parseInt(sp.day, 10) : undefined;
  const data = await getServicePlan(token, campId, Number.isFinite(day as number) ? day : undefined);
  if (!data) notFound();

  const admin = createAdminClient();
  const { data: camp } = await admin
    .from('camp_instances')
    .select('academy_id, coach_id, head_coach_id, head:head_coach_id(display_name), lead:coach_id(display_name)')
    .eq('id', campId).maybeSingle();

  // Quién va: el encargado y los que aceptaron (asistentes, filmer, foto).
  const { data: staffRows } = await admin
    .from('service_staff')
    .select('role, status, coaches:coach_id(display_name), staff_members:staff_member_id(name)')
    .eq('camp_instance_id', campId);
  const one = (x: any) => (Array.isArray(x) ? x[0] : x);
  const staff = (staffRows ?? []).map((r: any) => ({
    role: String(r.role ?? 'assistant'),
    name: one(r.coaches)?.display_name ?? one(r.staff_members)?.name ?? null,
    pending: r.status !== 'accepted',
  })).filter((r) => r.name);
  const leadName = one((camp as any)?.head)?.display_name ?? one((camp as any)?.lead)?.display_name ?? null;
  const roleLabel = (r: string) => (/photo|film/i.test(r) ? 'Filmer' : r === 'assistant' ? 'Assistant' : r.charAt(0).toUpperCase() + r.slice(1));

  // Espacios reservados ese día en la academia del camp.
  const date = data.selectedDay.session_date;
  const { data: bookings } = (camp as any)?.academy_id
    ? await admin.from('space_bookings')
        .select('title, starts_at, ends_at, academy_spaces:space_id(name)')
        .eq('academy_id', (camp as any).academy_id).eq('status', 'booked')
        .gte('starts_at', `${date}T00:00:00-06:00`).lte('starts_at', `${date}T23:59:59-06:00`)
        .order('starts_at')
    : { data: [] as any[] };

  const p: any = data.plan;
  // Solo lo que el coach escribió: una línea por dato, nada inventado.
  const conditions = ([
    ['Waves', p.venue_wave_size], ['Wind', p.venue_wind], ['Tide', p.venue_tide],
    ['Crowd', p.venue_crowd], ['Water', p.venue_water_temp], ['Sky', p.venue_sky],
    ['Hazards', p.venue_hazards],
  ] as [string, string | null][]).filter(([, v]) => !!v);
  const goLabel = p.venue_go_no_go === 'go' ? 'Go' : p.venue_go_no_go === 'modified' ? 'Modified' : p.venue_go_no_go === 'no_go' ? 'No-Go' : null;

  // Qué llevar: el equipo que pide la plantilla para ESE día, sin repetir.
  const dayTpl = data.templatePlan.find((d: any) => d.day_number === data.selectedDay.day_number);
  const gear = Array.from(new Set(((dayTpl?.blocks ?? []) as any[]).map((b) => (b.equipment ?? '').trim()).filter(Boolean)));

  // Un foco puede ser un elemento de la secuencia ("Rotation · the rail") o
  // un paso suelto ("STP-024"). Para el segundo el título vive en la lección:
  // sin esto la misión se perdía y la hoja decía "la línea completa".
  const focusIds = Array.from(new Set(data.students.flatMap((st: any) =>
    st.blocks.flatMap((b: any) => (Array.isArray(b.focus_moments) ? b.focus_moments : b.focus_step_id ? [b.focus_step_id] : [])),
  ))) as string[];
  const { data: focusLessons } = focusIds.length
    ? await admin.from('lessons').select('id, title').in('id', focusIds)
    : { data: [] as any[] };
  const stepTitle = new Map((focusLessons ?? []).map((l: any) => [l.id as string, l.title as string]));

  const rows = data.students.map((st: any) => {
    const sorted = [...st.blocks].sort((a: any, b: any) => a.order_index - b.order_index);
    const first = sorted[0] ?? null;
    const boardRow = first?.board_id ? data.availableBoards.find((b: any) => b.id === first.board_id) : null;
    const size = first?.board_size_feet ? `${first.board_size_feet}'${first.board_size_inches ?? 0}"` : null;
    const board = boardRow
      ? [boardRow.code, size].filter(Boolean).join(' · ')
      : first?.board_type
        ? [first.board_type === 'own' ? 'their own board' : first.board_type, size].filter(Boolean).join(' · ')
        : null;

    const water = waterSequencesOfBlocks(st.blocks as any, st.belt_level ?? null);
    const lines = water.map((w: any) => {
      const cfg = w.cfg;
      const blk = st.blocks.find((b: any) => b.order_index === w.order);
      const ids: string[] = Array.isArray(blk?.focus_moments) ? blk.focus_moments : blk?.focus_step_id ? [blk.focus_step_id] : [];
      const missions = ids.map((id) => elementTitle(cfg, id, stepTitle.get(id) ?? null)).filter(Boolean) as string[];
      return { seq: seqLabel(cfg), missions };
    });
    return { name: st.display_name, photo: st.photo_url as string | null, board, lines };
  });

  return (
    <div className={`${archivo.variable} ${plexMono.variable}`} style={{ background: '#FFFFFF', color: INK, minHeight: '100vh' }}>
      <style>{`
        @page { size: A4 portrait; margin: 14mm; }
        @media print { .no-print { display: none !important; } body { background: #fff; } .sheet { padding: 0 !important; max-width: none !important; } .row { break-inside: avoid; } }
      `}</style>

      <div className="sheet" style={{ maxWidth: 820, margin: '0 auto', padding: '20px 18px 40px' }}>
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <a href={`/coach-portal/${token}?tab=plan`} style={{ ...MONO, fontSize: 12, color: MUTED, textDecoration: 'none' }}>← Back to the plan</a>
          <PrintButton />
        </div>

        {/* Cabecera */}
        <p style={{ ...MONO, fontSize: 11, color: MUTED, margin: 0 }}>
          Session plan · day {data.selectedDay.day_number} of {data.daySummaries.length}
          {data.camp.is_test ? ' · TEST' : ''}
        </p>
        <h1 style={{ ...DISPLAY, fontWeight: 900, fontSize: 26, lineHeight: 1.05, margin: '4px 0 0' }}>{data.camp.camp_name}</h1>
        <p style={{ fontSize: 14, color: MUTED, margin: '4px 0 0' }}>
          {displayDate(date)}
          {hhmm(p.class_start_time ?? data.camp.scheduled_time) ? ` · ${hhmm(p.class_start_time ?? data.camp.scheduled_time)}` : ''}
          {p.surf_venue ? ` · ${p.surf_venue}` : ''}
        </p>

        {/* Los hechos del día */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10, margin: '16px 0 14px' }}>
          <Fact k="Where you surf" v={p.surf_venue || 'Not set'} />
          <Fact k="Who is going" v={[leadName ? `${leadName} · in charge` : null, ...staff.map((r) => `${r.name} · ${roleLabel(r.role)}${r.pending ? ' (not confirmed)' : ''}`)].filter(Boolean).join('\n') || 'Only you'} />
          <Fact k="Transport" v={p.transport_needed ? `Leaves ${hhmm(p.transport_depart) ?? '—'} · back ${hhmm(p.transport_return) ?? '—'}${p.transport_status === 'cancelled' ? ' (cancelled)' : ''}` : p.transport_needed === false ? 'Not needed' : 'Not decided'} />
          <Fact k="Spaces booked" v={(bookings ?? []).length
            ? (bookings ?? []).map((b: any) => `${(Array.isArray(b.academy_spaces) ? b.academy_spaces[0] : b.academy_spaces)?.name ?? 'Space'} ${hhmm(String(b.starts_at).slice(11, 16)) ?? ''}`.trim()).join('\n')
            : 'None'} />
          <Fact k="Safety call" v={goLabel ?? 'Not called yet'} />
          <Fact k="Students" v={`${data.students.length}`} />
        </div>

        {conditions.length > 0 && (
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '9px 11px', marginBottom: 12 }}>
            <p style={{ ...MONO, fontSize: 10, color: MUTED, margin: '0 0 4px' }}>Conditions you wrote down</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
              {conditions.map(([k, v]) => (
                <span key={k} style={{ fontSize: 13.5 }}>
                  <span style={{ ...MONO, fontSize: 10, color: MUTED, marginRight: 5 }}>{k}</span>{v}
                </span>
              ))}
            </div>
          </div>
        )}

        {gear.length > 0 && (
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '9px 11px', marginBottom: 16 }}>
            <p style={{ ...MONO, fontSize: 10, color: MUTED, margin: '0 0 4px' }}>Take this with you</p>
            <p style={{ fontSize: 13.5, lineHeight: 1.45, margin: 0 }}>{gear.join(' · ')}</p>
          </div>
        )}

        {p.venue_analysis && (
          <p style={{ fontSize: 13.5, lineHeight: 1.45, background: SAND, borderRadius: 5, padding: '10px 12px', margin: '0 0 16px' }}>
            <span style={{ ...MONO, fontSize: 10, color: MUTED, marginRight: 8 }}>What changes today</span>{p.venue_analysis}
          </p>
        )}

        {/* Cada alumno */}
        <p style={{ ...MONO, fontSize: 11, color: MUTED, margin: '0 0 8px' }}>What each one works on</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rows.map((r, i) => (
            <div key={i} className="row" style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {r.photo
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={r.photo} alt="" width={34} height={34} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <span style={{ width: 34, height: 34, borderRadius: '50%', background: SAND, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{r.name.slice(0, 1)}</span>}
                <span style={{ ...DISPLAY, fontWeight: 800, fontSize: 17, flexGrow: 1 }}>{r.name}</span>
                <span style={{ fontSize: 12.5, color: MUTED }}>{r.board ?? 'no board'}</span>
              </div>
              {r.lines.length > 0 ? (
                <div style={{ margin: '8px 0 0' }}>
                  {r.lines.map((l, j) => (
                    <div key={j} style={{ padding: '5px 0', borderTop: j > 0 ? `1px solid #EDF0F2` : undefined }}>
                      <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{l.seq}</p>
                      {l.missions.length ? (
                        <ul style={{ margin: '3px 0 0', padding: 0, listStyle: 'none' }}>
                          {l.missions.map((m, k) => (
                            <li key={k} style={{ fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>
                              <span style={{ ...MONO, fontSize: 10, color: MUTED, marginRight: 6 }}>Mission {k + 1}</span>{m}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ fontSize: 13.5, color: MUTED, margin: '3px 0 0' }}>The whole line, start to finish</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13.5, color: MUTED, margin: '6px 0 0' }}>Nothing set for today yet.</p>
              )}
            </div>
          ))}
        </div>

        {p.notes_general && (
          <p style={{ fontSize: 13.5, lineHeight: 1.45, borderTop: `1px solid ${BORDER}`, paddingTop: 12, margin: '18px 0 0' }}>
            <span style={{ ...MONO, fontSize: 10, color: MUTED, marginRight: 8 }}>Note for the day · private</span>{p.notes_general}
          </p>
        )}

        <p style={{ ...MONO, fontSize: 10, color: MUTED, marginTop: 22 }}>The Surf Sequence · {data.camp.template_name ?? ''}</p>
      </div>
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '9px 11px' }}>
      <p style={{ ...MONO, fontSize: 10, color: MUTED, margin: 0 }}>{k}</p>
      <p style={{ fontSize: 14, lineHeight: 1.35, margin: '3px 0 0', whiteSpace: 'pre-line' }}>{v}</p>
    </div>
  );
}
