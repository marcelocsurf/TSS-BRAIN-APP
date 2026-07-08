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

// ─── Service assignment emails ───────────────────────────────────────

function escapeHtmlBasic(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function assignmentEmailShell(title: string, bodyHtml: string, cta?: { url: string; label: string }): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <div style="background:${BRAND.colors.navy};border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      ${EMAIL_LOGO}
      <p style="margin:4px 0 0;color:${BRAND.colors.cyan};font-size:12px;">${BRAND.tagline}</p>
    </div>
    <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;">
      <h2 style="margin:0 0 14px;font-size:16px;color:#111827;">${title}</h2>
      ${bodyHtml}
      ${cta ? `<a href="${cta.url}" style="display:block;background:${BRAND.colors.navy};color:white;text-align:center;padding:13px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;margin-top:18px;">${cta.label}</a>` : ''}
    </div>
    <p style="text-align:center;font-size:11px;color:#9CA3AF;margin:16px 0 0;">${BRAND.name}® · ${BRAND.tagline}</p>
  </div>
</body></html>`;
}

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
        `<p style="font-size:14px;color:#374151;line-height:1.6;margin:0;">Before your session, please complete your quick intake — it only takes a couple of minutes: your details, a short safety check, and the waiver.</p>`,
        { url: data.intakeUrl, label: 'Complete my intake' },
      ),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Intake email failed:', err.message);
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
}

export async function sendQuizLeadEmail(
  data: QuizLeadEmailData,
): Promise<{ success: boolean; error?: string }> {
  // Production recipients for quiz-lead notifications.
  const to = ['info@thesurfsequence.com', 'academy@purosurf.com'];
  const beltName = BELT_DISPLAY[data.belt as BeltLevel]?.en || data.belt.replace(/_/g, ' ');
  const levelName = BELT_DISPLAY[data.belt as BeltLevel]?.levelName || '';
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to,
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
