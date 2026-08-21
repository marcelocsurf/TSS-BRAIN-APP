import { notFound } from 'next/navigation';
import { getExperienceByToken } from '@/lib/actions/experience-survey';
import { BRAND } from '@/lib/constants/brand';
import { ExperienceSurveyForm } from '@/components/survey/ExperienceSurveyForm';

// Página standalone de la encuesta de EXPERIENCIA del camp. Token-gated,
// sin nav — segura para compartir por WhatsApp/correo. Espejo de /feedback.

export const dynamic = 'force-dynamic';
// Sin esto, el Data Cache de Next puede congelar los GET a Supabase de esta
// página pública: la primera carga (sin respuesta aún) quedaba cacheada y
// "ya respondiste" nunca aparecía al reabrir el link.
export const fetchCache = 'force-no-store';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ExperiencePage({ params }: Props) {
  const { token } = await params;
  const data = await getExperienceByToken(token);
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="bg-[var(--tss-navy)] rounded-t-2xl px-5 py-5 text-center">
          <h1 className="text-white text-lg font-bold leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
            {BRAND.name}
          </h1>
          <p className="text-[var(--tss-cyan)] text-[11px] mt-1" style={{ fontFamily: 'DM Mono, monospace' }}>
            {BRAND.tagline}
          </p>
        </div>

        <div className="bg-white rounded-b-2xl border border-gray-100 border-t-0 px-5 py-6 space-y-5">
          {data.alreadySubmitted ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-emerald-600">{'✓'}</span>
              </div>
              <h2 className="text-base font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
                Thanks, {data.studentFirstName}
              </h2>
              <p className="text-sm text-gray-500 mt-2 leading-snug">
                You already shared your experience{data.campName ? ` for ${data.campName}` : ''}. See you in the water.
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-700">
                  Hi <strong>{data.studentFirstName}</strong>,
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  How was the overall experience{data.campName ? (
                    <> of <strong>{data.campName}</strong></>
                  ) : ' with us'}? One minute, and it goes straight to the team.
                </p>
              </div>
              <ExperienceSurveyForm token={token} />
            </>
          )}

          <p className="text-[10px] text-gray-400 text-center pt-2 border-t border-gray-100" style={{ fontFamily: 'DM Mono, monospace' }}>
            {BRAND.name}® · {BRAND.tagline}
          </p>
        </div>
      </div>
    </div>
  );
}
