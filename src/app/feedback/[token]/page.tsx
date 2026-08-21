import { notFound } from 'next/navigation';
import { getFeedbackByToken } from '@/lib/actions/feedback-token';
import { getPendingExperienceForFeedbackToken } from '@/lib/actions/experience-survey';
import { BRAND } from '@/lib/constants/brand';
import { FeedbackForm } from './FeedbackForm';
import { ExperienceSurveyForm } from '@/components/survey/ExperienceSurveyForm';

// Standalone feedback page for Lead students who don't have a course.
// Token-gated, no portal nav, no other tabs. Once submitted, shows a
// thank-you. Safe to share via email — only the survey lives here.

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function FeedbackPage({ params }: Props) {
  const { token } = await params;
  const data = await getFeedbackByToken(token);
  if (!data) notFound();

  // Opción A encadenada: si el alumno tiene una encuesta de EXPERIENCIA del
  // camp pendiente, es el paso 2 del mismo link (y si la de entreno ya está
  // respondida, se muestra directo — reabrir el link cae en lo que falta).
  const experience = await getPendingExperienceForFeedbackToken(token).catch(() => null);

  // data.sessionDate ya viene como fecha real de la sesión (YYYY-MM-DD). La
  // fijamos en UTC para que no se corra un día según la zona del servidor.
  const sd = data.sessionDate?.length <= 10 ? `${data.sessionDate}T00:00:00Z` : data.sessionDate;
  const sessionDate = new Date(sd).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-[var(--tss-navy)] rounded-t-2xl px-5 py-5 text-center">
          <h1 className="text-white text-lg font-bold leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}>
            {BRAND.name}
          </h1>
          <p className="text-[var(--tss-cyan)] text-[11px] mt-1"
             style={{ fontFamily: 'DM Mono, monospace' }}>
            {BRAND.tagline}
          </p>
        </div>

        {/* Body */}
        <div className="bg-white rounded-b-2xl border border-gray-100 border-t-0 px-5 py-6 space-y-5">
          {data.alreadySubmitted ? (
            experience ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-700">
                    Hi <strong>{data.studentFirstName}</strong>, your session feedback is in — thank you!
                  </p>
                  <p className="text-sm text-gray-700 mt-2">
                    One more minute: how was the <strong>overall experience</strong>
                    {experience.campName ? <> of {experience.campName}</> : null}?
                  </p>
                </div>
                <ExperienceSurveyForm token={experience.token} />
              </div>
            ) : (
              <AlreadySubmitted firstName={data.studentFirstName} coachName={data.coachName} />
            )
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-700">
                  Hi <strong>{data.studentFirstName}</strong>,
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Thanks for your session with <strong>{data.coachName}</strong> on{' '}
                  <strong>{sessionDate}</strong>. Your feedback helps us improve.
                </p>
              </div>

              {/* Session recap card */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                {data.coachFeedback && (
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold"
                       style={{ fontFamily: 'DM Mono, monospace' }}>
                      Coach Feedback
                    </p>
                    <p className="text-[13px] text-gray-700 mt-0.5">{data.coachFeedback}</p>
                  </div>
                )}
                {data.homework && (
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-amber-700 font-semibold"
                       style={{ fontFamily: 'DM Mono, monospace' }}>
                      Your Homework
                    </p>
                    <p className="text-[13px] text-gray-700 mt-0.5">{data.homework}</p>
                  </div>
                )}
              </div>

              {/* The form — preguntas según el servicio (+ paso 2 de experiencia si hay) */}
              <FeedbackForm token={token} serviceKind={data.serviceKind} serviceName={data.serviceName} experience={experience} />
            </>
          )}

          <p className="text-[10px] text-gray-400 text-center pt-2 border-t border-gray-100"
             style={{ fontFamily: 'DM Mono, monospace' }}>
            {BRAND.name}® · {BRAND.tagline}
          </p>
        </div>
      </div>
    </div>
  );
}

function AlreadySubmitted({ firstName, coachName }: { firstName: string; coachName: string }) {
  return (
    <div className="text-center py-6">
      <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
        <span className="text-2xl text-emerald-600">{'✓'}</span>
      </div>
      <h2 className="text-base font-bold text-[var(--tss-navy)]"
          style={{ fontFamily: 'var(--font-heading)' }}>
        Thanks, {firstName}
      </h2>
      <p className="text-sm text-gray-500 mt-2 leading-snug">
        You already submitted your feedback for this session with {coachName}.
      </p>
    </div>
  );
}
