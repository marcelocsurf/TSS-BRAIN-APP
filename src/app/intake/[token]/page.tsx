import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import { getStudentForIntake } from '@/lib/actions/intake';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import { BRAND } from '@/lib/constants/brand';
import { notFound } from 'next/navigation';
import { IntakeForm } from './intake-form';
import { createAdminClient } from '@/lib/supabase/admin';

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex' });

// Página token-gated con datos vivos (lo inscrito decide qué pide el
// intake): nunca se cachea. Lección de las encuestas (2026-08-21).
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function IntakePage({ params }: Props) {
  const { token } = await params;
  const student = await getStudentForIntake(token);

  if (!student) notFound();

  const belt = BELT_DISPLAY[student.belt_level as BeltLevel];
  // Dos intakes (regla de Marcelo 2026-09-11, doctrine_rules): un servicio de
  // DOS DÍAS O MÁS cuenta como camp → intake completo (ficha + waiver + quiz
  // v2 + metas). Un servicio de UN DÍA (surf lesson, Discover Surfing, surf
  // skate, ice bath…) → solo ficha + waiver. Se decide por la duración de lo
  // que tiene inscrito, nunca por el nombre del servicio.
  let extendedRequired = false;   // tiene al menos un servicio de 2+ días vigente
  let singleDayOnly = false;      // tiene servicios vigentes y TODOS son de 1 día
  try {
    const admin = createAdminClient();
    const { data: seats } = await admin
      .from('camp_participants')
      .select('enrollment_status, camp_instances:camp_instance_id(start_date, end_date, status)')
      .eq('student_id', (student as any).id);
    const today = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
    const live = (seats ?? []).map((p: any) => {
      const ci = Array.isArray(p.camp_instances) ? p.camp_instances[0] : p.camp_instances;
      return { p, ci };
    }).filter(({ p, ci }) => p.enrollment_status !== 'cancelled' && ci && ci.status !== 'cancelled' && ci.end_date >= today);
    const days = (ci: any) => {
      const a = Date.parse(`${ci.start_date}T00:00:00Z`);
      const b = Date.parse(`${ci.end_date}T00:00:00Z`);
      return Number.isFinite(a) && Number.isFinite(b) ? Math.round((b - a) / 86_400_000) + 1 : 1;
    };
    extendedRequired = live.some(({ ci }) => days(ci) >= 2);
    singleDayOnly = live.length > 0 && !extendedRequired;
  } catch { /* sin dato, el intake sigue como hasta hoy */ }

  return (
    <div className={`tss-v10 min-h-screen ${archivo.variable} ${plexMono.variable}`} style={{ background: '#F7F9FA' }}>
      {/* Header v10 — logo + etiqueta mono, regla cyan */}
      <div style={{ background: BRAND.colors.navy, borderBottom: `3px solid ${BRAND.colors.cyan}` }} className="px-4 py-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/tss-logo-white-h.png" alt="The Surf Sequence" className="h-10 mx-auto object-contain" />
        <p className="text-[10px] mt-2.5" style={{ color: BRAND.colors.cyan, fontFamily: 'var(--font-plex), monospace', textTransform: 'uppercase', letterSpacing: '0.22em' }}>
          Your Profile
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Student card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
              style={{ backgroundColor: belt?.color || '#999' }}
            >
              {student.photo_url ? (
                <img src={student.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                `${student.first_name[0]}${student.last_name?.[0] || ''}`
              )}
            </div>
            <div>
              <p className="font-semibold text-[var(--tss-navy)]">
                {student.first_name} {student.last_name}
              </p>
              <p className="text-xs text-gray-500">{belt?.en} — {belt?.levelName}</p>
            </div>
          </div>
        </div>

        {/* Intro */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Help us prepare the best experience for you.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Complete the required safety info first, then optionally add more details.
          </p>
        </div>

        {/* Form */}
        <IntakeForm token={token} student={student} extendedRequired={extendedRequired} singleDayOnly={singleDayOnly} />
      </div>

      <div className="text-center py-8">
        <p className="text-xs text-gray-400">The Surf Sequence&reg; &middot; {BRAND.tagline}</p>
      </div>
    </div>
  );
}
