'use server';

import { Resend } from 'resend';
import { BRAND } from '@/lib/constants/brand';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

const resend = new Resend(process.env.RESEND_API_KEY);

// Absolute production URL for the logo — email clients can't load relative
// paths, so this must point at the live domain (white horizontal mark for the
// dark header). alt text keeps the brand name for image-blocking clients.
const EMAIL_LOGO = `<img src="https://app.thesurfsequence.com/tss-logo-white-h.png" alt="${BRAND.name}" width="210" style="display:block;margin:0 auto;max-width:72%;height:auto;" />`;

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
    await resend.emails.send({
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
  /** student_session_results.id — deep-links the survey. */
  sessionResultId?: string;
  feedbackToken?: string;
  studentHasCourseAccess?: boolean;
}

export async function sendCoachSurveyEmail(data: CoachSurveyEmailData): Promise<{ success: boolean; error?: string }> {
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
    <p style="font-size:14px;color:#374151;line-height:1.6;margin:0;">
      We'd love to hear how it went. It takes about 30 seconds and helps your coach and the whole team keep getting better.
    </p>${INSTALL_APP_HTML}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.studentEmail,
      subject: `How was your experience with ${data.coachName}?`,
      html: assignmentEmailShell('Rate your coach & experience ★', body, { url: feedbackUrl, label: 'Rate my coach ★' }),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Coach survey email failed:', err.message);
    return { success: false, error: err.message };
  }
}

// ─── Service assignment emails ───────────────────────────────────────

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
function assignmentEmailShell(title: string, bodyHtml: string, cta?: { url: string; label: string }): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <div style="background:${BRAND.colors.navy};border-radius:16px 16px 0 0;padding:28px 24px 22px;text-align:center;border-bottom:3px solid ${BRAND.colors.cyan};">
      ${EMAIL_LOGO}
      <p style="margin:10px 0 0;color:${BRAND.colors.cyan};font-size:10px;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:3px;">${BRAND.tagline}</p>
    </div>
    <div style="background:white;padding:26px 24px;border-radius:0 0 16px 16px;border:1px solid #E5E9EC;border-top:none;">
      <h2 style="margin:0 0 14px;font-size:17px;font-weight:800;color:${BRAND.colors.navy};text-transform:uppercase;letter-spacing:-0.2px;line-height:1.15;">${title}</h2>
      ${bodyHtml}
      ${cta ? `<a href="${cta.url}" style="display:block;background:${BRAND.colors.cyan};color:${BRAND.colors.navy};text-align:center;padding:14px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;margin-top:20px;">${cta.label}</a>` : ''}
    </div>
    <p style="text-align:center;font-size:9px;color:#9CA3AF;margin:16px 0 0;font-family:'Courier New',monospace;text-transform:uppercase;letter-spacing:2px;">${BRAND.name}® · ${BRAND.tagline}</p>
  </div>
</body></html>`;
}

// "Install the app" instructions — appended to student-facing emails so the
// portal lives one tap away on their phone. English, brand name in full.
const INSTALL_APP_HTML = `
<div style="margin-top:20px;padding:14px 16px;background:#E5FAFF;border:1px solid #99E9FF;border-radius:12px;">
  <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0d2240;">📲 Add The Surf Sequence to your phone</p>
  <p style="margin:0 0 6px;font-size:12px;color:#374151;line-height:1.6;"><strong>iPhone:</strong> open your portal link in Safari → tap the Share button → <strong>"Add to Home Screen"</strong>.</p>
  <p style="margin:0 0 6px;font-size:12px;color:#374151;line-height:1.6;"><strong>Android:</strong> open it in Chrome → tap the ⋮ menu → <strong>"Add to Home screen"</strong>.</p>
  <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.6;">You'll get The Surf Sequence icon on your home screen — your portal, one tap away.</p>
</div>`;

// Send the intake link to a newly created student so they can complete their
// profile + waiver themselves. Fire-and-forget: never blocks student creation.
export async function sendIntakeLinkEmail(data: {
  toEmail: string;
  firstName: string;
  intakeUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: 'Complete your surf intake',
      html: assignmentEmailShell(
        `Welcome, ${data.firstName || 'surfer'}!`,
        `<p style="font-size:14px;color:#374151;line-height:1.6;margin:0;">Before your session, please complete your quick intake — it only takes a couple of minutes: your details, a short safety check, and the waiver.</p>${INSTALL_APP_HTML}`,
        { url: data.intakeUrl, label: 'Complete my intake' },
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
    await resend.emails.send({
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
}): Promise<void> {
  try {
    const body = `
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${escapeHtmlBasic(data.coachFirstName)}</strong>,</p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">You've been assigned as head coach for:</p>
      <div style="background:#F9FAFB;border-radius:8px;padding:14px;margin-bottom:8px;border:1px solid #E5E7EB;">
        <p style="margin:0;font-size:15px;color:#111827;font-weight:700;">${escapeHtmlBasic(data.serviceName)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">${escapeHtmlBasic(data.dateRange)}</p>
      </div>
      <p style="margin:12px 0 0;font-size:13px;color:#374151;line-height:1.6;">Please open your portal to <strong>accept or decline</strong> this assignment so your coordinator knows.</p>`;
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `New service assigned — please confirm`,
      html: assignmentEmailShell('You have a new service to confirm', body, { url: data.portalUrl, label: 'Open my portal' }),
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
}): Promise<void> {
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
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `${data.coachName} ${verb} — ${data.serviceName}`,
      html: assignmentEmailShell(`Service ${verb}`, body),
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
  try {
    const body = data.isAssignee
      ? `<p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${escapeHtmlBasic(data.firstName)}</strong>,</p>
         <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">This task was due <strong>${escapeHtmlBasic(data.dueLabel)}</strong> and is still open:</p>`
      : `<p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${escapeHtmlBasic(data.firstName)}</strong>,</p>
         <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">An assigned task passed its due date (<strong>${escapeHtmlBasic(data.dueLabel)}</strong>) and is still open:</p>`;
    const card = `<div style="background:#FBEBEB;border-left:3px solid #C43D3D;border-radius:0 8px 8px 0;padding:12px 14px;">
        <p style="margin:0;font-size:15px;color:#111827;font-weight:700;">${escapeHtmlBasic(data.taskTitle)}</p>
      </div>`;
    await resend.emails.send({
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
  try {
    const body = `
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${escapeHtmlBasic(data.firstName)}</strong>,</p>
      <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">A quick reminder — you have a service tomorrow:</p>
      <div style="background:#EAF6FB;border-left:3px solid ${BRAND.colors.cyan};border-radius:0 8px 8px 0;padding:14px;">
        <p style="margin:0;font-size:15px;color:#111827;font-weight:700;">${escapeHtmlBasic(data.serviceName)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">${escapeHtmlBasic(data.whenLabel)}</p>
      </div>`;
    await resend.emails.send({
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
  // Fail clearly (not cryptically) if the email service isn't configured.
  if (!process.env.RESEND_API_KEY) {
    console.error('sendCoachInviteEmail: RESEND_API_KEY is not set.');
    return { success: false, error: 'Email service not configured (RESEND_API_KEY missing).' };
  }
  try {
    await resend.emails.send({
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
          Go to <a href="${(process.env.NEXT_PUBLIC_APP_URL || 'https://tss-brain-app.vercel.app')}/forgot-password" style="color:${BRAND.colors.navy};font-weight:600;">${(process.env.NEXT_PUBLIC_APP_URL || 'https://tss-brain-app.vercel.app').replace(/^https?:\/\//, '')}</a>,
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
  try {
    await resend.emails.send({
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
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="background:${BRAND.colors.navy};border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      ${EMAIL_LOGO}
      <p style="margin:4px 0 0;color:${BRAND.colors.gold};font-size:12px;">${BRAND.tagline}</p>
    </div>

    <!-- Body -->
    <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;">
      <p style="margin:0 0 16px;font-size:15px;color:#111827;">
        Hi <strong>${data.studentName}</strong>,
      </p>
      <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.5;">
        Here is your session report from <strong>${data.coachName}</strong>.
      </p>

      <!-- Session card -->
      <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:12px;color:#6B7280;">Date</span>
          <span style="font-size:13px;color:#111827;font-weight:500;">${new Date(/^\d{4}-\d{2}-\d{2}$/.test(data.sessionDate) ? data.sessionDate + 'T00:00:00' : data.sessionDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <div style="margin-bottom:8px;">
          <span style="font-size:12px;color:#6B7280;">Mission</span>
          <p style="margin:4px 0 0;font-size:14px;color:#111827;font-weight:600;">${data.mission}</p>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:12px;color:#6B7280;">Status</span>
          <span style="font-size:13px;color:#111827;font-weight:500;text-transform:capitalize;">${data.status.replace('_', ' ')}</span>
        </div>
      </div>

      <!-- Feedback -->
      <div style="margin-bottom:16px;">
        <p style="font-size:12px;color:#6B7280;margin:0 0 4px;">Coach Feedback</p>
        <p style="font-size:14px;color:#374151;line-height:1.5;margin:0;">${data.coachFeedback}</p>
      </div>

      <!-- Homework — only shown when the coach actually left something -->
      ${data.homework && data.homework.trim() ? `
      <div style="background:#FFF7ED;border-left:3px solid ${BRAND.colors.gold};padding:12px;border-radius:0 8px 8px 0;margin-bottom:16px;">
        <p style="font-size:11px;color:#92400E;margin:0 0 4px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Homework</p>
        <p style="font-size:14px;color:#78350F;margin:0;font-weight:500;">${data.homework}</p>
      </div>` : ''}

      <!-- What's Next — only shown when set -->
      ${data.whatsNext && data.whatsNext.trim() ? `
      <div style="margin-bottom:24px;">
        <p style="font-size:12px;color:#6B7280;margin:0 0 4px;">Next Recommended Focus</p>
        <p style="font-size:14px;color:#111827;font-weight:500;margin:0;">${data.whatsNext}</p>
      </div>` : ''}

      <!-- CTA: Rate Session -->
      <a href="${data.feedbackUrl}" style="display:block;background:${BRAND.colors.navy};color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
        Rate Your Session &amp; Coach &#9733;
      </a>

      <p style="margin:16px 0 0;font-size:12px;color:#9CA3AF;text-align:center;">
        Your feedback helps us improve. Takes 30 seconds.
      </p>

      <!-- Secondary CTA: Dashboard -->
      <a href="${data.portalUrl}" style="display:block;text-align:center;padding:10px;font-size:13px;color:${BRAND.colors.navy};text-decoration:none;font-weight:500;margin-top:8px;">
        View your full training dashboard &rarr;
      </a>
    </div>

    <!-- Footer -->
    <p style="text-align:center;font-size:11px;color:#9CA3AF;margin:16px 0 0;">
      The Surf Sequence® · Evolve through play
    </p>
  </div>
</body>
</html>`;
}

// ─── New quiz lead notification — sent to TSS + the academy ───────────────

interface QuizLeadEmailData {
  name: string;
  email: string | null;
  phone: string | null;
  belt: string;            // e.g. 'white_belt'
  score: number;           // 0–70
  academyName: string | null;
  academyId?: string | null;
}

export async function sendQuizLeadEmail(
  data: QuizLeadEmailData,
): Promise<{ success: boolean; error?: string }> {
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
  // Legacy fallback so the pilot academy keeps receiving leads even if its
  // coordinators aren't registered with emails yet.
  if (to.size === 1) to.add('academy@purosurf.com');
  const beltName = BELT_DISPLAY[data.belt as BeltLevel]?.en || data.belt.replace(/_/g, ' ');
  const levelName = BELT_DISPLAY[data.belt as BeltLevel]?.levelName || '';
  try {
    await resend.emails.send({
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
        <tr><td style="padding:6px 0;color:#6B7280;">Result</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(beltName)}${levelName ? ` · ${escapeHtml(levelName)}` : ''} (${data.score}/70)</td></tr>
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

// Confirmación de reserva del QR público — lleva el link de gestión para
// cancelar o mover la reserva (política de 24 h aplicada en esa página).
export async function sendBookingConfirmationEmail(data: {
  toEmail: string;
  firstName: string;
  className: string;
  dateLabel: string;
  amountLabel: string | null;
  manageUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `You're booked: ${data.className} 🌊`,
      html: assignmentEmailShell(
        `See you in the water, ${data.firstName}!`,
        `<p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 10px;"><strong>${data.className}</strong><br/>${data.dateLabel}${data.amountLabel ? `<br/>${data.amountLabel} — pay at front desk (cash or card)` : ''}</p>
         <p style="font-size:12px;color:#6b7280;line-height:1.6;margin:0;">Plans changed? Use the button below to move or cancel your booking. Cancel more than 24 hours before class and it's free; within 24 hours the full class price is due.</p>`,
        { url: data.manageUrl, label: 'Manage my booking' },
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
}): Promise<{ success: boolean; error?: string }> {
  try {
    const rows = data.pending.map((p) => `<li style="margin:0 0 4px;">${p.service} — <strong>${p.date}</strong></li>`).join('');
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.toEmail,
      subject: `Tenés ${data.pending.length} cierre(s) pendiente(s) 🔒`,
      html: assignmentEmailShell(
        `${data.coachName}, te falta cerrar:`,
        `<ul style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 10px;padding-left:18px;">${rows}</ul>
         <p style="font-size:12px;color:#6b7280;line-height:1.6;margin:0;">El cierre del día alimenta la bitácora de tus alumnos y es <strong>requisito para emitir tu pago</strong>. Te toma 2 minutos desde tu portal.</p>`,
        { url: data.portalUrl, label: 'Cerrar mis sesiones' },
      ),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Closure reminder email failed:', err.message);
    return { success: false, error: err.message };
  }
}
