'use server';

import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { BRAND } from '@/lib/constants/brand';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

import { emailEnabled } from '@/lib/email-switch';
const resend = new Resend(process.env.RESEND_API_KEY);

// Resend v3 devuelve { data, error } y NO lanza en fallo — el código hacía
// `await resend.emails.send()` y reportaba success aunque el envío fallara.
// Este wrapper lanza el error para que el try/catch de cada sender lo capture
// y devuelva { success:false } de verdad.
async function sendEmail(payload: Parameters<typeof resend.emails.send>[0]) {
  const { data, error } = await resend.emails.send(payload);
  if (error) throw new Error((error as any)?.message || (typeof error === 'string' ? error : JSON.stringify(error)));
  return data;
}

// Absolute production URL for the logo — email clients can't load relative
// paths, so this must point at the live domain (white horizontal mark for the
// dark header). alt text keeps the brand name for image-blocking clients.
// Pie legal de todo correo (auditoría 2026-09-05): quién lo manda y dónde
// están la privacidad y los términos. Transaccional: no hay "unsubscribe".
import { LEGAL_FOOTER_HTML } from '@/lib/legal/email-footer';
// v10.1 (2026-09-18): logo horizontal oficial en blanco sobre transparente
// (public/brand/tss-logo-full-white.png). El -h viejo traía un gris horneado.
const EMAIL_LOGO = `<img src="https://app.thesurfsequence.com/brand/tss-logo-full-white.png" alt="${BRAND.name}" width="220" style="display:block;margin:0 auto;max-width:70%;height:auto;" />`;
// Tokens v10.1 para correo (inline: los clientes de correo no cargan CSS).
const EM = {
  paper: '#F7F9FA', ink: '#061C2B', inkText: '#10263B', tide: '#55666E', sand: '#E9E2D2', border: '#DCD7C6', cyan: '#00D2FF', cyanText: '#00A8CC',
  display: "'Archivo','Arial Black','Helvetica Neue',Helvetica,Arial,sans-serif",
  body: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  mono: "'IBM Plex Mono','SFMono-Regular',Menlo,Consolas,'Courier New',monospace",
} as const;
/** Etiqueta mono en cyan sobre claro (rótulos de sección). */
const emLabel = (t: string) => `<p style="margin:0 0 6px;font-family:${EM.mono};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${EM.cyanText};">${t}</p>`;
/** Tarjeta sand v10.1. */
const emCard = (inner: string, extra = '') => `<div style="background:${EM.sand};border:1px solid ${EM.border};border-radius:8px;padding:14px 16px;margin:0 0 14px;${extra}">${inner}</div>`;

interface SessionEmailData {
  studentName: string;
  studentEmail: string;
  portalToken: string;
  coachName: string;
  sessionDate: string;
  mission: string;
  status: string;
  coachFeedback: string;
  homework: string;
  whatsNext: string;
  beltLevel: BeltLevel;
  /** student_session_results.id — used to deep-link directly to this survey. */
  sessionResultId?: string;
  /** student_session_results.feedback_token — when set, sends Leads to the
   *  standalone /feedback/[token] page instead of the full portal. */
  feedbackToken?: string;
  /** Whether the student has ANY course access (white_belt OR yellow_belt).
   *  Leads = false → standalone feedback page. Members = true → full portal. */
  studentHasCourseAccess?: boolean;
}

export async function sendSessionEmail(data: SessionEmailData): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('session_report'))) return { success: false, error: 'disabled:session_report' } as any;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const portalUrl = `${appUrl}/portal/${data.portalToken}`;
  const belt = BELT_DISPLAY[data.beltLevel];

  // Route Leads (no course access) to the standalone /feedback/[token]
  // page so they never see the full portal. Members keep the full
  // portal experience that lands on the feedback tab.
  const useStandalone = data.feedbackToken && data.studentHasCourseAccess === false;
  const feedbackUrl = useStandalone
    ? `${appUrl}/feedback/${data.feedbackToken}`
    : data.sessionResultId
      ? `${portalUrl}?tab=feedback&survey=${data.sessionResultId}`
      : `${portalUrl}?tab=feedback`;

  try {
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.studentEmail,
      subject: `Your session report from ${data.coachName}`,
      html: buildEmailHtml({ ...data, portalUrl, feedbackUrl, beltColor: belt?.color || '#1A1A2E' }),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Email send failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ─── Coach survey email (M135) ───────────────────────────────────────
// Fase 3: the student no longer gets a report after every day. Once — after
// the official final evaluation (or the close of a one-day lesson) — they get
// this single invitation to rate their coach + experience. Coach feedback and
// "what to work on next" are INTERNAL now, so they are NOT in this email.

interface CoachSurveyEmailData {
  studentName: string;
  studentEmail: string;
  portalToken: string | null;
  coachName: string;
  /** What they attended, e.g. "Surf Camp Beginner (White Belt)" or "Discover Surfing". */
  serviceName: string;
  /** Academia del alumno (Puro Surf): nombre y logo para el co-brand. */
  academyName?: string | null;
  academyLogoUrl?: string | null;
  /** Lo que el coach dejó para trabajar: la etiqueta ("#8 Frontside Pumping · Rail
   *  Change") y su nota. Es el valor del correo; sin esto va una línea del portal. */
  nextFocusLabel?: string | null;
  nextFocusNote?: string | null;
  /** student_session_results.id — deep-links the survey. */
  sessionResultId?: string;
  feedbackToken?: string;
  studentHasCourseAccess?: boolean;
}

export async function sendCoachSurveyEmail(data: CoachSurveyEmailData): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('coach_survey'))) return { success: false, error: 'disabled:coach_survey' } as any;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const portalUrl = data.portalToken ? `${appUrl}/portal/${data.portalToken}` : appUrl;
  const useStandalone = data.feedbackToken && data.studentHasCourseAccess === false;
  const feedbackUrl = useStandalone
    ? `${appUrl}/feedback/${data.feedbackToken}`
    : data.sessionResultId
      ? `${portalUrl}?tab=feedback&survey=${data.sessionResultId}`
      : `${portalUrl}?tab=feedback`;

  const body = `
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 14px;">
      Congratulations on finishing <strong>${escapeHtmlBasic(data.serviceName)}</strong> with
      <strong>${escapeHtmlBasic(data.coachName)}</strong>! 🌊
    </p>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 10px;">
      We'd like your opinion in two areas — about a minute in total:
    </p>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 4px;"><strong>1 · Method &amp; coach</strong> — the sessions, what you learned, your coach.</p>
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 18px;"><strong>2 · Experience</strong> — facilities, equipment, transport and value${data.academyName ? ` at ${escapeHtmlBasic(data.academyName)}` : ''}.</p>
    ${data.nextFocusLabel || data.nextFocusNote
      ? emCard(`${emLabel('Your next focus · from your coach')}<p style="margin:0;font-size:16px;font-weight:700;color:${EM.inkText};line-height:1.3;">${escapeHtmlBasic(data.nextFocusLabel ?? data.nextFocusNote ?? '')}</p>${data.nextFocusLabel && data.nextFocusNote ? `<p style="margin:6px 0 0;font-size:13px;color:${EM.inkText};line-height:1.5;">${escapeHtmlBasic(data.nextFocusNote)}</p>` : ''}<p style="margin:8px 0 0;font-size:12px;color:${EM.tide};line-height:1.5;">It is waiting on your Home — train it once on your own and it clears itself.</p>`)
      : emCard(`${emLabel('Your portal')}<p style="margin:0;font-size:13px;color:${EM.inkText};line-height:1.6;">Your sessions, your stars and your next moves live in your portal — the same link as this survey.</p>`)}`;

  try {
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.studentEmail,
      subject: `How was your experience with ${data.coachName}?`,
      html: assignmentEmailShell(
        'Rate your coach & experience ★',
        body,
        { url: feedbackUrl, label: 'Rate my coach ★' },
        data.academyLogoUrl ? { name: data.academyName ?? '', logoUrl: data.academyLogoUrl } : undefined,
        { academyFirst: true },
      ),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Coach survey email failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ─── Service assignment emails ───────────────────────────────────────

// Co-branding por academia (pedido de Marcelo): si el correo pertenece a
// una academia con logo (ej. Puro Surf), va una banda blanca con su logo
// bajo el header ink de TSS. Sin logo → correo TSS puro, sin banda.
async function academyBrand(academyId?: string | null): Promise<{ name: string; logoUrl: string } | undefined> {
  if (!academyId) return undefined;
  try {
    const admin = createAdminClient();
    const { data } = await admin.from('academies').select('name, logo_url').eq('id', academyId).maybeSingle();
    if (!data?.logo_url) return undefined;
    return { name: data.name, logoUrl: data.logo_url };
  } catch { return undefined; }
}

function escapeHtmlBasic(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Brand Manual v10: header ink con el logo, etiqueta mono espaciada en cyan,
// CTA como píldora cyan con texto ink. Una sola shell viste TODOS los correos.
function assignmentEmailShell(title: string, bodyHtml: string, cta?: { url: string; label: string }, academy?: { name: string; logoUrl: string }, opts?: { academyFirst?: boolean }): string {
  // Cliente de una academia (Puro Surf): su logo manda en la cabecera oscura y
  // The Surf Sequence va debajo, chico (Marcelo 2026-09-25).
  const academyFirst = !!(academy && opts?.academyFirst);
  // v10.1 (2026-09-18): papel #F7F9FA, cabecera ink con el logo y el tagline en
  // mono cyan, cuerpo blanco con título display en mayúsculas, tarjetas sand,
  // CTA cyan con texto ink, esquinas 8px. Todo inline por los clientes de correo.
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head>
<body style="margin:0;padding:0;background:${EM.paper};font-family:${EM.body};">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:${EM.ink};border-radius:8px 8px 0 0;padding:30px 24px 24px;text-align:center;">
      ${academyFirst
        ? `<img src="${academy!.logoUrl}" alt="${escapeHtmlBasic(academy!.name)}" height="64" style="height:64px;max-width:260px;object-fit:contain;display:inline-block;" />
      <p style="margin:14px 0 0;color:${EM.cyan};font-size:10px;font-family:${EM.mono};text-transform:uppercase;letter-spacing:3px;">with ${BRAND.name} · ${BRAND.tagline}</p>`
        : `${EMAIL_LOGO}
      <p style="margin:12px 0 0;color:${EM.cyan};font-size:10px;font-family:${EM.mono};text-transform:uppercase;letter-spacing:3px;">${BRAND.tagline}</p>`}
    </div>
    <div style="height:3px;background:${EM.cyan};"></div>
    ${academy && !academyFirst ? `<div style="background:#FFFFFF;padding:12px 24px;border:1px solid ${EM.border};border-top:none;border-bottom:none;text-align:center;"><img src="${academy.logoUrl}" alt="${escapeHtmlBasic(academy.name)}" style="height:34px;max-width:60%;object-fit:contain;" /></div>` : ''}
    <div style="background:#FFFFFF;padding:26px 24px 24px;border-radius:0 0 8px 8px;border:1px solid ${EM.border};border-top:none;">
      <h1 style="margin:0 0 16px;font-family:${EM.display};font-size:24px;line-height:1.05;font-weight:900;color:${EM.inkText};text-transform:uppercase;letter-spacing:-0.02em;">${title}</h1>
      ${bodyHtml}
      ${cta ? `<a href="${cta.url}" style="display:block;background:${EM.cyan};color:${EM.ink};text-align:center;padding:16px 14px;border-radius:5px;text-decoration:none;font-family:${EM.display};font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:0.04em;margin-top:22px;">${cta.label}</a>` : ''}
    </div>
    <p style="text-align:center;font-size:9px;color:${EM.tide};margin:16px 0 0;font-family:${EM.mono};text-transform:uppercase;letter-spacing:2px;">${BRAND.name}® · ${BRAND.tagline}</p>
    ${LEGAL_FOOTER_HTML}
  </div>
</body></html>`;
}

// "Install the app" instructions — appended to student-facing emails so the
// portal lives one tap away on their phone. English, brand name in full.
const INSTALL_APP_HTML = `
<div style="margin-top:20px;padding:14px 16px;background:#E9E2D2;border:1px solid #DCD7C6;border-radius:8px;">
  <p style="margin:0 0 8px;font-family:'IBM Plex Mono','SFMono-Regular',Menlo,Consolas,'Courier New',monospace;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#00A8CC;">Add The Surf Sequence to your phone</p>
  <p style="margin:0 0 6px;font-size:13px;color:#10263B;line-height:1.6;"><strong>iPhone:</strong> open your portal link in Safari → Share → <strong>Add to Home Screen</strong>.</p>
  <p style="margin:0 0 6px;font-size:13px;color:#10263B;line-height:1.6;"><strong>Android:</strong> open it in Chrome → ⋮ menu → <strong>Add to Home screen</strong>.</p>
  <p style="margin:0;font-size:12px;color:#55666E;line-height:1.6;">Your portal, one tap away.</p>
</div>`;

// Send the intake link to a newly created student so they can complete their
// profile + waiver themselves. Fire-and-forget: never blocks student creation.
export async function sendIntakeLinkEmail(data: {
  toEmail: string;
  firstName: string;
  intakeUrl: string;
  academyId?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('intake_link'))) return { success: false, error: 'disabled:intake_link' } as any;
  try {
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: 'Complete your surf intake',
      html: assignmentEmailShell(
        `Welcome, ${data.firstName || 'surfer'}!`,
        `<p style="font-size:14px;color:#374151;line-height:1.6;margin:0;">Before your session, please complete your quick intake — it only takes a couple of minutes: your details, a short safety check, and the waiver.</p>${INSTALL_APP_HTML}`,
        { url: data.intakeUrl, label: 'Complete my intake' },
        await academyBrand(data.academyId),
      ),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Intake email failed:', err.message);
    return { success: false, error: err.message };
  }
}

// Portal-access email — the student asked for their portal link from the
// public /my-portal page (any device, no password needed). One email per
// address; when several students share the email (family, camp testing),
// each gets their own button.
export async function sendPortalLinkEmail(data: {
  toEmail: string;
  students: Array<{ firstName: string; portalUrl: string }>;
}): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('portal_link'))) return { success: false, error: 'disabled:portal_link' } as any;
  const many = data.students.length > 1;
  const buttons = data.students
    .map(
      (s) => `
    <div style="margin:14px 0;">
      ${many ? `<p style="margin:0 0 6px;font-size:13px;color:#374151;font-weight:600;">${escapeHtml(s.firstName || 'Surfer')}</p>` : ''}
      <a href="${s.portalUrl}" style="display:inline-block;background:#0d2240;color:#ffffff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open my portal →</a>
    </div>`,
    )
    .join('');
  try {
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: 'Your Surf Sequence portal link',
      html: assignmentEmailShell(
        many ? 'Your portal links' : `Here you go, ${escapeHtml(data.students[0]?.firstName || 'surfer')}!`,
        `<p style="font-size:14px;color:#374151;line-height:1.6;margin:0;">Tap the button to open your Surf Sequence student portal. Save this email — the link is yours and works on any device.</p>${buttons}${INSTALL_APP_HTML}`,
      ),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Portal link email failed:', err.message);
    return { success: false, error: err.message };
  }
}

export async function sendAssignmentEmail(data: {
  toEmail: string;
  coachFirstName: string;
  serviceName: string;
  dateRange: string;
  portalUrl: string;
  academyId?: string | null;
}): Promise<void> {
  if (!(await emailEnabled('assignment'))) return { success: false, error: 'disabled:assignment' } as any;
  try {
    const body = `
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${escapeHtmlBasic(data.coachFirstName)}</strong>,</p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">You've been assigned as head coach for:</p>
      <div style="background:#F9FAFB;border-radius:8px;padding:14px;margin-bottom:8px;border:1px solid #E5E7EB;">
        <p style="margin:0;font-size:15px;color:#111827;font-weight:700;">${escapeHtmlBasic(data.serviceName)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">${escapeHtmlBasic(data.dateRange)}</p>
      </div>
      <p style="margin:12px 0 0;font-size:13px;color:#374151;line-height:1.6;">Please open your portal to <strong>accept or decline</strong> this assignment so your coordinator knows.</p>`;
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `New service assigned — please confirm`,
      html: assignmentEmailShell('You have a new service to confirm', body, { url: data.portalUrl, label: 'Open my portal' }, await academyBrand(data.academyId)),
    });
  } catch (err: any) {
    console.error('Assignment email failed:', err.message);
  }
}

export async function sendAssignmentResponseEmail(data: {
  toEmail: string;
  coordinatorFirstName: string;
  coachName: string;
  serviceName: string;
  accepted: boolean;
  note?: string | null;
  academyId?: string | null;
}): Promise<void> {
  if (!(await emailEnabled('assignment_response'))) return { success: false, error: 'disabled:assignment_response' } as any;
  try {
    const verb = data.accepted ? 'accepted' : 'declined';
    const color = data.accepted ? '#059669' : '#DC2626';
    const body = `
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${escapeHtmlBasic(data.coordinatorFirstName)}</strong>,</p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
        <strong>${escapeHtmlBasic(data.coachName)}</strong> has
        <strong style="color:${color};">${verb}</strong> the service:</p>
      <div style="background:#F9FAFB;border-radius:8px;padding:14px;border:1px solid #E5E7EB;">
        <p style="margin:0;font-size:15px;color:#111827;font-weight:700;">${escapeHtmlBasic(data.serviceName)}</p>
      </div>
      ${data.note ? `<p style="margin:12px 0 0;font-size:13px;color:#6B7280;line-height:1.6;"><strong>Note:</strong> ${escapeHtmlBasic(data.note)}</p>` : ''}
      ${!data.accepted ? `<p style="margin:12px 0 0;font-size:13px;color:#DC2626;line-height:1.6;">You may want to assign another coach.</p>` : ''}`;
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `${data.coachName} ${verb} — ${data.serviceName}`,
      html: assignmentEmailShell(`Service ${verb}`, body, undefined, await academyBrand(data.academyId)),
    });
  } catch (err: any) {
    console.error('Assignment response email failed:', err.message);
  }
}

// ─── Daily reminder emails (tasks + services) ────────────────────────

export async function sendTaskOverdueEmail(data: {
  toEmail: string;
  firstName: string;
  taskTitle: string;
  dueLabel: string;
  isAssignee: boolean;
  portalUrl: string;
}): Promise<void> {
  if (!(await emailEnabled('task_overdue'))) return { success: false, error: 'disabled:task_overdue' } as any;
  try {
    const body = data.isAssignee
      ? `<p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${escapeHtmlBasic(data.firstName)}</strong>,</p>
         <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">This task was due <strong>${escapeHtmlBasic(data.dueLabel)}</strong> and is still open:</p>`
      : `<p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${escapeHtmlBasic(data.firstName)}</strong>,</p>
         <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">An assigned task passed its due date (<strong>${escapeHtmlBasic(data.dueLabel)}</strong>) and is still open:</p>`;
    const card = `<div style="background:#FBEBEB;border-left:3px solid #C43D3D;border-radius:0 8px 8px 0;padding:12px 14px;">
        <p style="margin:0;font-size:15px;color:#111827;font-weight:700;">${escapeHtmlBasic(data.taskTitle)}</p>
      </div>`;
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `Overdue task — ${data.taskTitle}`,
      html: assignmentEmailShell('Task overdue', body + card, { url: data.portalUrl, label: 'Open the to-do list' }),
    });
  } catch (err: any) {
    console.error('Task overdue email failed:', err.message);
  }
}

export async function sendServiceReminderEmail(data: {
  toEmail: string;
  firstName: string;
  serviceName: string;
  whenLabel: string;
  portalUrl: string;
}): Promise<void> {
  if (!(await emailEnabled('service_reminder'))) return { success: false, error: 'disabled:service_reminder' } as any;
  try {
    const body = `
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${escapeHtmlBasic(data.firstName)}</strong>,</p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">A quick reminder — you have a service tomorrow:</p>
      <div style="background:#EAF6FB;border-left:3px solid ${BRAND.colors.cyan};border-radius:0 8px 8px 0;padding:14px;">
        <p style="margin:0;font-size:15px;color:#111827;font-weight:700;">${escapeHtmlBasic(data.serviceName)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">${escapeHtmlBasic(data.whenLabel)}</p>
      </div>`;
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `Tomorrow: ${data.serviceName}`,
      html: assignmentEmailShell('Service reminder', body, { url: data.portalUrl, label: 'Open my portal' }),
    });
  } catch (err: any) {
    console.error('Service reminder email failed:', err.message);
  }
}

// ─── Coach invite email — sent on coach creation OR re-send ──────────
//
// Replaces Supabase's default invite email so we control the branding,
// language and the explicit credentials block ("your email + click to
// set password"). The magic link is generated by the caller via
// supabase.auth.admin.generateLink({ type: 'invite' }) so we can embed
// it in our own HTML.

interface CoachInviteEmailData {
  toEmail: string;
  firstName: string;
  role: 'admin' | 'coordinator' | 'coach' | 'assistant';
  academyName: string;
  /** The magic link from Supabase generateLink — clicking it sets a session and lands on /set-password. */
  inviteLink: string;
  /** Optional — when re-sending we surface that the invite was already sent before. */
  isResend?: boolean;
}

export async function sendCoachInviteEmail(
  data: CoachInviteEmailData,
): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('coach_invite'))) return { success: false, error: 'disabled:coach_invite' } as any;
  // Fail clearly (not cryptically) if the email service isn't configured.
  if (!process.env.RESEND_API_KEY) {
    console.error('sendCoachInviteEmail: RESEND_API_KEY is not set.');
    return { success: false, error: 'Email service not configured (RESEND_API_KEY missing).' };
  }
  try {
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: data.isResend
        ? `Reminder — activate your ${BRAND.name} account`
        : `Welcome to ${BRAND.name} — activate your account`,
      html: buildCoachInviteHtml(data),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Coach invite email send failed:', err.message);
    return { success: false, error: err.message };
  }
}

// Minimal HTML escape — protects against XSS / accidental tag injection
// when user-supplied strings (firstName, academyName, email) are
// embedded into the email HTML. Resend treats `html` as raw HTML.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildCoachInviteHtml(data: CoachInviteEmailData): string {
  const roleLabel =
    data.role === 'coordinator'
      ? 'Academy Coordinator'
      : data.role === 'assistant'
      ? 'Assistant Coach'
      : data.role === 'admin'
      ? 'Admin'
      : 'Coach';

  const firstName = escapeHtml(data.firstName);
  const academyName = escapeHtml(data.academyName);
  const toEmail = escapeHtml(data.toEmail);
  // inviteLink is a Supabase-generated URL — safe to embed in href but
  // escape just for &/" sanity if any query param ever contained them.
  const inviteLink = escapeHtml(data.inviteLink);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="background:${BRAND.colors.navy};border-radius:12px 12px 0 0;padding:28px 24px;text-align:center;">
      ${EMAIL_LOGO}
      <p style="margin:6px 0 0;color:${BRAND.colors.cyan};font-size:12px;letter-spacing:0.02em;">${BRAND.tagline}</p>
    </div>

    <!-- Body -->
    <div style="background:white;padding:28px 24px;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;">
      <p style="margin:0 0 16px;font-size:15px;color:#111827;">
        Hi <strong>${firstName}</strong>,
      </p>
      <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">
        ${data.isResend ? 'A reminder — you were' : 'You\'ve been'} added to
        <strong>${academyName}</strong> on ${BRAND.name} as
        <strong>${roleLabel}</strong>.
      </p>

      <!-- Credentials block -->
      <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #E5E7EB;">
        <p style="margin:0 0 6px;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Your login email</p>
        <p style="margin:0;font-size:14px;color:#111827;font-weight:600;font-family:monospace;">${toEmail}</p>
      </div>

      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        Click the button below to activate your account, set your password,
        and access your dashboard.
      </p>

      <!-- CTA: Activate account -->
      <a href="${inviteLink}" style="display:block;background:${BRAND.colors.navy};color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
        Activate my account &amp; set password
      </a>

      <p style="margin:14px 0 0;font-size:11px;color:#9CA3AF;text-align:center;line-height:1.5;">
        This link is one-time use and expires in 24 hours.<br/>
        If you didn't expect this email, you can safely ignore it.
      </p>

      <!-- Fallback recovery: the one-time link can be consumed by email
           previews or expire, so always give a self-serve path. -->
      <div style="background:#F9FAFB;border-radius:8px;padding:14px 16px;margin-top:18px;border:1px solid #E5E7EB;">
        <p style="margin:0 0 6px;font-size:12px;color:#374151;line-height:1.6;">
          <strong>Button didn't work, or the link expired?</strong>
        </p>
        <p style="margin:0;font-size:12px;color:#374151;line-height:1.6;">
          Go to <a href="${(process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com')}/forgot-password" style="color:${BRAND.colors.navy};font-weight:600;">${(process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com').replace(/^https?:\/\//, '')}</a>,
          enter <strong>${toEmail}</strong>, and we'll send a fresh link to set your password.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <p style="text-align:center;font-size:11px;color:#9CA3AF;margin:16px 0 0;">
      ${BRAND.name}® · ${BRAND.tagline}
    </p>
  </div>
</body>
</html>`;
}

// ─── Password reset email — branded recovery link ────────────────────

interface PasswordResetEmailData {
  toEmail: string;
  firstName: string;
  /** Supabase recovery link (generateLink type:'recovery') — exchanges
   * the code for a session and lands on /set-password via callback next. */
  resetLink: string;
}

export async function sendPasswordResetEmail(
  data: PasswordResetEmailData,
): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('password_reset'))) return { success: false, error: 'disabled:password_reset' } as any;
  try {
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `Reset your ${BRAND.name} password`,
      html: buildPasswordResetHtml(data),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Password reset email send failed:', err.message);
    return { success: false, error: err.message };
  }
}

function buildPasswordResetHtml(data: PasswordResetEmailData): string {
  const firstName = escapeHtml(data.firstName);
  const toEmail = escapeHtml(data.toEmail);
  const resetLink = escapeHtml(data.resetLink);

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <div style="background:${BRAND.colors.navy};border-radius:12px 12px 0 0;padding:28px 24px;text-align:center;">
      ${EMAIL_LOGO}
      <p style="margin:6px 0 0;color:${BRAND.colors.cyan};font-size:12px;letter-spacing:0.02em;">${BRAND.tagline}</p>
    </div>
    <div style="background:white;padding:28px 24px;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;">
      <p style="margin:0 0 16px;font-size:15px;color:#111827;">
        Hi <strong>${firstName}</strong>,
      </p>
      <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">
        We received a request to reset the password for your ${BRAND.name} account.
      </p>
      <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #E5E7EB;">
        <p style="margin:0 0 6px;font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Account email</p>
        <p style="margin:0;font-size:14px;color:#111827;font-weight:600;font-family:monospace;">${toEmail}</p>
      </div>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        Click the button below to set a new password.
      </p>
      <a href="${resetLink}" style="display:block;background:${BRAND.colors.navy};color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
        Reset my password
      </a>
      <p style="margin:14px 0 0;font-size:11px;color:#9CA3AF;text-align:center;line-height:1.5;">
        This link is one-time use and expires in 1 hour.<br/>
        If you didn't request a password reset, you can safely ignore this email.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#9CA3AF;margin:16px 0 0;">
      ${BRAND.name}® · ${BRAND.tagline}
    </p>
  </div>
</body>
</html>`;
}

function buildEmailHtml(data: SessionEmailData & { portalUrl: string; feedbackUrl: string; beltColor: string }): string {
  const dateLabel = new Date(/^\d{4}-\d{2}-\d{2}$/.test(data.sessionDate) ? data.sessionDate + 'T00:00:00' : data.sessionDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const statusLabel = data.status === 'achieved' ? 'Achieved' : data.status === 'not_yet' ? 'Not yet' : 'Partial';
  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:${EM.inkText};line-height:1.6;">Hi <strong>${escapeHtmlBasic(data.studentName)}</strong>, here is what <strong>${escapeHtmlBasic(data.coachName)}</strong> left you from today.</p>
    ${emCard(`
      ${emLabel('Today · ' + escapeHtmlBasic(dateLabel))}
      <p style="margin:0 0 4px;font-family:${EM.display};font-size:18px;line-height:1.1;font-weight:900;text-transform:uppercase;color:${EM.inkText};">${escapeHtmlBasic(data.mission)}</p>
      <p style="margin:0;font-size:13px;color:${EM.tide};">Objective: <strong style="color:${EM.inkText};">${statusLabel}</strong></p>
    `)}
    ${data.coachFeedback && data.coachFeedback.trim() ? emCard(`${emLabel('From your coach')}<p style="margin:0;font-size:14px;color:${EM.inkText};line-height:1.6;">${escapeHtmlBasic(data.coachFeedback)}</p>`) : ''}
    ${data.whatsNext && data.whatsNext.trim() ? `<div style="background:${EM.ink};border:1px solid rgba(0,210,255,.35);border-radius:8px;padding:14px 16px;margin:0 0 6px;"><p style="margin:0 0 6px;font-family:${EM.mono};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${EM.cyan};">Your next focus</p><p style="margin:0;font-size:15px;font-weight:700;color:${EM.paper};line-height:1.4;">${escapeHtmlBasic(data.whatsNext)}</p><p style="margin:6px 0 0;font-size:12px;color:rgba(247,249,250,.7);">It is waiting for you in Let's Play.</p></div>` : ''}
    ${data.homework && data.homework.trim() ? emCard(`${emLabel('Homework')}<p style="margin:0;font-size:14px;color:${EM.inkText};line-height:1.6;">${escapeHtmlBasic(data.homework)}</p>`) : ''}
    <p style="margin:18px 0 0;font-size:12px;color:${EM.tide};text-align:center;">Rate the session: 30 seconds, and your coach reads it.</p>
    <p style="margin:12px 0 0;text-align:center;"><a href="${data.portalUrl}" style="font-size:13px;color:${EM.cyanText};text-decoration:underline;font-weight:600;">Open your portal →</a></p>${INSTALL_APP_HTML}`;
  return assignmentEmailShell('Your session report', body, { url: data.feedbackUrl, label: 'Rate your session ★' });
}

// ─── New quiz lead notification — sent to TSS + the academy ───────────────

interface QuizLeadEmailData {
  name: string;
  email: string | null;
  phone: string | null;
  belt: string;            // e.g. 'white_belt'
  score: number;           // v1: 0–70 · v2: 0–100 (scoreMax lo dice)
  scoreMax?: number;       // 70 por defecto; el quiz V2 manda 100
  academyName: string | null;
  academyId?: string | null;
}

export async function sendQuizLeadEmail(
  data: QuizLeadEmailData,
): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('quiz_lead'))) return { success: false, error: 'disabled:quiz_lead' } as any;
  // Recipients: TSS HQ always, plus the lead's academy coordinators/admins
  // (dynamic — new academies get their leads without touching this file).
  const to = new Set<string>(['info@thesurfsequence.com']);
  if (data.academyId) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const admin = createAdminClient();
      const { data: staff } = await admin
        .from('coaches')
        .select('email, role, active_status')
        .eq('academy_id', data.academyId)
        .in('role', ['coordinator', 'admin']);
      for (const c of staff ?? []) {
        if (c.email && c.active_status !== false) to.add(c.email);
      }
    } catch { /* fall through to the base recipients */ }
  }
  // Legacy fallback so el academy PILOTO (Puro Surf) siga recibiendo sus leads
  // aunque sus coordinadores aún no tengan email registrado. IMPORTANTE: solo
  // aplica si el lead ES de Puro Surf — antes se agregaba a CUALQUIER lead sin
  // staff (u otra academia / TSS Direct), filtrando prospectos ajenos a Puro Surf.
  const PURO_SURF_ID = 'ad6dcc08-ad86-48c5-a0d0-b51fff8d9d99';
  if (to.size === 1 && data.academyId === PURO_SURF_ID) to.add('academy@purosurf.com');
  const beltName = BELT_DISPLAY[data.belt as BeltLevel]?.en || data.belt.replace(/_/g, ' ');
  const levelName = BELT_DISPLAY[data.belt as BeltLevel]?.levelName || '';
  try {
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: [...to],
      subject: `New surf-level quiz lead — ${escapeHtml(data.name)} (${beltName})`,
      html: buildQuizLeadHtml(data, beltName, levelName),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Quiz lead email send failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ═══ Entrega del libro ONE WAVE (compra web → portal) ═══
export async function sendBookDeliveryEmail(data: {
  email: string;
  firstName: string;
  portalUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('book_delivery'))) return { success: false, error: 'disabled:book_delivery' } as any;
  try {
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.email,
      subject: 'ONE WAVE — your book is ready',
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <div style="background:${BRAND.colors.navy};border-radius:12px 12px 0 0;padding:28px 24px;text-align:center;">
      ${EMAIL_LOGO}
      <p style="margin:10px 0 0;color:${BRAND.colors.cyan};font-size:13px;font-style:italic;">Evolve through play</p>
    </div>
    <div style="background:white;padding:28px 24px;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;">
      <p style="margin:0;font-size:16px;color:#111827;">Hi ${escapeHtml(data.firstName)},</p>
      <p style="margin:14px 0 0;font-size:14.5px;line-height:1.65;color:#374151;">
        Thank you for getting <strong>ONE WAVE</strong>. Your copy is waiting in your
        personal portal — it lives there, always, on any device.
      </p>
      <img src="https://app.thesurfsequence.com/web/img/one-wave-cover.jpg" alt="ONE WAVE" width="180" style="display:block;margin:22px auto 0;border-radius:4px;box-shadow:0 12px 30px rgba(7,22,36,0.25);" />
      <div style="text-align:center;margin-top:24px;">
        <a href="${data.portalUrl}" style="display:inline-block;background:${BRAND.colors.cyan};color:${BRAND.colors.navy};font-weight:700;font-size:14px;padding:14px 30px;border-radius:8px;text-decoration:none;">Read the book &rarr;</a>
      </div>
      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6B7280;">
        When you're ready for the next step: take the 60-second level test inside your
        portal, and your training will start from your real level.
      </p>
      <p style="margin:18px 0 0;font-size:12px;color:#9CA3AF;">Save this email — the button above is your personal access link.</p>
    </div>
    ${LEGAL_FOOTER_HTML}
  </div>
</body></html>`,
    });
    return { success: true };
  } catch (err: any) {
    console.error('Book delivery email send failed:', err.message);
    return { success: false, error: err.message };
  }
}

function buildQuizLeadHtml(data: QuizLeadEmailData, beltName: string, levelName: string): string {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email || '—');
  const phone = escapeHtml(data.phone || '—');
  const academy = escapeHtml(data.academyName || 'Unassigned (TSS Direct)');
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <div style="background:${BRAND.colors.navy};border-radius:12px 12px 0 0;padding:28px 24px;text-align:center;">
      ${EMAIL_LOGO}
      <p style="margin:6px 0 0;color:${BRAND.colors.cyan};font-size:12px;">New surf-level quiz lead</p>
    </div>
    <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;">
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        A new lead just completed the surf-level quiz. Their profile is in The Surf Sequence (status: lead, belt provisional).
      </p>
      <table style="width:100%;font-size:14px;color:#111827;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#6B7280;">Name</td><td style="padding:6px 0;text-align:right;font-weight:600;">${name}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;">Email</td><td style="padding:6px 0;text-align:right;">${email}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;">Phone</td><td style="padding:6px 0;text-align:right;">${phone}</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;">Result</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(beltName)}${levelName ? ` · ${escapeHtml(levelName)}` : ''} (${data.score}/${data.scoreMax ?? 70})</td></tr>
        <tr><td style="padding:6px 0;color:#6B7280;">Academy</td><td style="padding:6px 0;text-align:right;">${academy}</td></tr>
      </table>
      <p style="margin:18px 0 0;font-size:12px;color:#9CA3AF;line-height:1.6;">
        Next step: enrol them from The Surf Sequence — their quiz result is already saved, so they won't re-take it during intake.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#9CA3AF;margin:16px 0 0;">${BRAND.name}® · ${BRAND.tagline}</p>
  </div>
</body></html>`;
}

// "Nos vemos en…" según el tipo de clase (pedido de Marcelo: yoga no es
// "in the water"). Keyword sobre el nombre del servicio; surf → academy.
// NO exportada: este módulo es 'use server' y solo admite exports async.
function seeYouSpot(className: string): { line: string; emoji: string } {
  const n = (className || '').toLowerCase();
  if (/yoga/.test(n)) return { line: 'See you in the yoga studio', emoji: '🧘' };
  if (/jiu|jitsu|bjj/.test(n)) return { line: 'See you on the mat', emoji: '🥋' };
  if (/skate/.test(n)) return { line: 'See you at the skate ramp', emoji: '🛹' };
  if (/ice/.test(n)) return { line: 'See you at the ice bath', emoji: '❄️' };
  if (/breath|respir/.test(n)) return { line: 'See you at the studio', emoji: '🌬️' };
  return { line: 'See you at the academy', emoji: '🌊' };
}

// Confirmación de reserva del QR público — lleva el link de gestión para
// cancelar o mover la reserva (política de 24 h aplicada en esa página).
export async function sendBookingConfirmationEmail(data: {
  toEmail: string;
  firstName: string;
  className: string;
  dateLabel: string;
  amountLabel: string | null;
  manageUrl: string;
  academyId?: string | null;
  /** El portal del alumno (2026-09-10): quien reserva por QR también recibe su link en el mismo correo. */
  portalUrl?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('booking_confirmation'))) return { success: false, error: 'disabled:booking_confirmation' } as any;
  try {
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `You're booked: ${data.className} ${seeYouSpot(data.className).emoji}`,
      html: assignmentEmailShell(
        `${seeYouSpot(data.className).line}, ${data.firstName}!`,
        `<p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 10px;"><strong>${data.className}</strong><br/>${data.dateLabel}${data.amountLabel ? `<br/>${data.amountLabel} — pay at front desk (cash or card)` : ''}</p>
         ${data.portalUrl ? `<p style="font-size:13px;color:#374151;line-height:1.6;margin:0 0 10px;">This is your student portal — save it, the link is yours: <a href="${data.portalUrl}" style="color:#0090B0;font-weight:600;">open my portal</a>.</p>` : ''}
         <p style="font-size:12px;color:#6b7280;line-height:1.6;margin:0;">Plans changed? Use the button below to move or cancel your booking. Cancel more than 24 hours before class and it's free; within 24 hours the full class price is due.</p>`,
        { url: data.manageUrl, label: 'Manage my booking' },
        await academyBrand(data.academyId),
      ),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Booking confirmation email failed:', err.message);
    return { success: false, error: err.message };
  }
}

// Fin de día: cierres pendientes → el cierre es requisito para emitir pago.
export async function sendClosureReminderEmail(data: {
  toEmail: string;
  coachName: string;
  pending: { service: string; date: string }[];
  portalUrl: string;
  academyId?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('closure_reminder'))) return { success: false, error: 'disabled:closure_reminder' } as any;
  try {
    const rows = data.pending.map((p) => `<li style="margin:0 0 4px;">${p.service} — <strong>${p.date}</strong></li>`).join('');
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `Tenés ${data.pending.length} cierre(s) pendiente(s) 🔒`,
      html: assignmentEmailShell(
        `${data.coachName}, te falta cerrar:`,
        `<ul style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 10px;padding-left:18px;">${rows}</ul>
         <p style="font-size:12px;color:#6b7280;line-height:1.6;margin:0;">El cierre del día alimenta la bitácora de tus alumnos y es <strong>requisito para emitir tu pago</strong>. Te toma 2 minutos desde tu portal.</p>`,
        { url: data.portalUrl, label: 'Cerrar mis sesiones' },
        await academyBrand(data.academyId),
      ),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Closure reminder email failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ─── Bienvenida a instructores nuevos (staff, en español) ────────────
// Credenciales + qué hay en el portal + cómo instalar el app en el
// teléfono. La contraseña es temporal y la pueden cambiar al entrar.
export async function sendCoachWelcomeEmail(data: {
  toEmail: string;
  firstName: string;
  academyName: string;
  tempPassword: string;
  variant?: 'coach' | 'host';
  academyId?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('coach_welcome'))) return { success: false, error: 'disabled:coach_welcome' } as any;
  try {
    const isHost = data.variant === 'host';
    const tour = isHost
      ? `<p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#061C2B;">🧭 Tu portal, en 30 segundos</p>
      <p style="margin:0 0 14px;font-size:13px;color:#374151;line-height:1.8;">
        <strong>HOY</strong> — el mostrador: check-in, cobros y transferencias del día.<br/>
        <strong>AGENDA</strong> — todo el calendario: reservale a un cliente en segundos o creá una clase fuera de horario.<br/>
        <strong>TABLAS</strong> — calculadora de tablas y sistema de rentas con firma.<br/>
        <strong>ESPACIOS</strong> — qué sala está ocupada y cuándo.<br/>
        <strong>CLIENTES</strong> — fichas completas y el semáforo de waivers pendientes.
      </p>
      <p style="margin:0 0 14px;font-size:12px;color:#6B7280;line-height:1.6;">La primera vez que entres se abre sola la <strong>Guía de uso 📖</strong> con todo explicado paso a paso — y queda siempre en el botón 📖 de arriba.</p>`
      : `<p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#061C2B;">🧭 Tu portal, en 30 segundos</p>
      <p style="margin:0 0 14px;font-size:13px;color:#374151;line-height:1.8;">
        <strong>Home</strong> — tu día: clases asignadas, tareas y avisos.<br/>
        <strong>Courses</strong> — tus cursos (Safety + Método) con tu progreso.<br/>
        <strong>Tools</strong> — recursos y herramientas de coaching.<br/>
        <strong>Plan</strong> — la planeación de tus sesiones cuando tengas clases.<br/>
        <strong>Espacios</strong> — las salas y lugares de la academia.
      </p>`;
    const intro = isHost
      ? `Ya sos parte del equipo de <strong>${escapeHtmlBasic(data.academyName)}</strong> como <strong>Host — Servicio al cliente</strong> dentro de <strong>The Surf Sequence</strong>. Tu portal es el mostrador completo de la academia: con él atendés clientes, cobrás, reservás y ves todo lo que pasa en el día.`
      : null;
    const body = `
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Hola <strong>${escapeHtmlBasic(data.firstName)}</strong> 👋</p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">${intro ?? `Ya sos parte del equipo de instructores de <strong>${escapeHtmlBasic(data.academyName)}</strong> dentro de <strong>The Surf Sequence</strong>. Tu formación arranca con dos cursos que ya tenés desbloqueados en tu portal:`}</p>
      ${isHost ? '' : `<ul style="margin:0 0 14px;padding-left:18px;font-size:13px;color:#374151;line-height:1.8;">
        <li><strong>Safety Canon</strong> — 10 lecciones + examen final (requisito de tu certificación L1). Empezá por acá.</li>
        <li><strong>El Método</strong> — Foundations: la filosofía y estructura de The Surf Sequence en 6 lecciones.</li>
      </ul>`}
      <div style="margin:0 0 14px;padding:14px 16px;background:#F7F9FA;border:1px solid #E5E9EC;border-radius:12px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#061C2B;">🔑 Cómo entrar</p>
        <p style="margin:0 0 4px;font-size:13px;color:#374151;line-height:1.7;">1. Abrí <strong>app.thesurfsequence.com</strong></p>
        <p style="margin:0 0 4px;font-size:13px;color:#374151;line-height:1.7;">2. Iniciá sesión con este correo y la contraseña temporal: <strong style="font-family:'Courier New',monospace;">${escapeHtmlBasic(data.tempPassword)}</strong></p>
        <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.6;">Podés cambiarla cuando quieras desde tu perfil.</p>
      </div>
      ${tour}
      <div style="margin-top:4px;padding:14px 16px;background:#E5FAFF;border:1px solid #99E9FF;border-radius:12px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0d2240;">📲 Instalá el app en tu teléfono (recomendado)</p>
        <p style="margin:0 0 6px;font-size:12px;color:#374151;line-height:1.6;"><strong>iPhone:</strong> abrí tu portal en Safari → botón Compartir → <strong>"Agregar a pantalla de inicio"</strong>.</p>
        <p style="margin:0;font-size:12px;color:#374151;line-height:1.6;"><strong>Android:</strong> abrí tu portal en Chrome → menú ⋮ → <strong>"Instalar aplicación"</strong> (o "Agregar a pantalla principal").</p>
        <p style="margin:6px 0 0;font-size:12px;color:#6B7280;line-height:1.6;">Te queda el ícono de The Surf Sequence y entrás con un toque.</p>
      </div>`;
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `Bienvenido al equipo, ${data.firstName} 🌊 — tu acceso a The Surf Sequence`,
      html: assignmentEmailShell('¡Ya sos parte del equipo!', body, { url: 'https://app.thesurfsequence.com/login', label: 'Entrar a mi portal' }, await academyBrand(data.academyId)),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Coach welcome email failed:', err.message);
    return { success: false, error: err.message };
  }
}


// ═══ Bienvenida al inscribir (Marcelo 2026-09-10) ═══
// El hueco: del quiz al camp el alumno no recibía nada. Un solo correo al
// inscribirlo: en qué está, cuándo, y su portal — con los términos adentro,
// una sola vez. Nace APAGADO (email_settings.welcome_enrolled).
export async function sendWelcomeEnrolledEmail(data: {
  toEmail: string;
  firstName: string;
  campName: string;
  dateLabel: string;
  timeLabel: string | null;
  portalUrl: string;
  termsUrl: string;
  privacyUrl: string;
  academyId?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('welcome_enrolled'))) return { success: false, error: 'disabled:welcome_enrolled' } as any;
  try {
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `You're in: ${data.campName} 🌊`,
      html: assignmentEmailShell(
        `See you in the water, ${data.firstName}!`,
        `<p>You're booked for <strong>${escapeHtml(data.campName)}</strong> — <strong>${escapeHtml(data.dateLabel)}</strong>${data.timeLabel ? ` at <strong>${escapeHtml(data.timeLabel)}</strong>` : ''}.</p>
         <p>This is your portal. Save this email — the link is yours and works on any device:</p>
         <ul style="margin:8px 0 12px;padding-left:18px;color:#334155;font-size:14px;line-height:1.6;">
           <li>Your course: what you'll learn, step by step.</li>
           <li>Let's Play: plan a session, surf, come back and rate it.</li>
           <li>After each class your coach leaves you one thing to work on next.</li>
         </ul>
         <p style="font-size:12px;color:#64748b;">By opening your portal you confirm you've read our <a href="${data.termsUrl}" style="color:#0090B0;">Terms</a> and <a href="${data.privacyUrl}" style="color:#0090B0;">Privacy Policy</a>. You'll confirm it once, inside.</p>`,
        { url: data.portalUrl, label: 'Confirm & open my portal' },
        undefined,
      ),
    });
    return { success: true };
  } catch (e) {
    console.error('[email] welcome enrolled failed', e);
    return { success: false, error: e instanceof Error ? e.message : 'send failed' };
  }
}


// ═══ Recordatorio del día antes AL ALUMNO (Marcelo 2026-09-10) ═══
// Hora de encuentro, playa y transporte — lo mismo que el front desk manda
// por WhatsApp. Nace APAGADO (email_settings.student_day_reminder).
export async function sendStudentDayReminderEmail(data: {
  toEmail: string;
  firstName: string;
  serviceName: string;
  dateLabel: string;
  meetingTime: string | null;
  venue: string | null;
  transport: string | null;
  portalUrl: string;
  academyId?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  if (!(await emailEnabled('student_day_reminder'))) return { success: false, error: 'disabled:student_day_reminder' } as any;
  try {
    const rows = [
      data.meetingTime ? `<li>🕐 Meet at <strong>${escapeHtml(data.meetingTime)}</strong></li>` : '',
      data.venue ? `<li>📍 ${escapeHtml(data.venue)}</li>` : '',
      data.transport ? `<li>🚐 ${escapeHtml(data.transport)}</li>` : '',
    ].filter(Boolean).join('');
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `Tomorrow: ${data.serviceName} 🌊`,
      html: assignmentEmailShell(
        `See you tomorrow, ${data.firstName}!`,
        `<p><strong>${escapeHtml(data.serviceName)}</strong> — ${escapeHtml(data.dateLabel)}.</p>
         ${rows ? `<ul style="margin:8px 0 12px;padding-left:18px;color:#334155;font-size:14px;line-height:1.7;">${rows}</ul>` : ''}
         <p style="font-size:13px;color:#475569;">Bring water, sunscreen and your word for the wave. If you can't make it, tell the front desk today.</p>`,
        { url: data.portalUrl, label: 'Open my portal' },
        undefined,
      ),
    });
    return { success: true };
  } catch (e) {
    console.error('[email] student day reminder failed', e);
    return { success: false, error: e instanceof Error ? e.message : 'send failed' };
  }
}
