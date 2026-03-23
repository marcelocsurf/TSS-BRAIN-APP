'use server';

import { Resend } from 'resend';
import { BRAND } from '@/lib/constants/brand';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

const resend = new Resend(process.env.RESEND_API_KEY);

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
}

export async function sendSessionEmail(data: SessionEmailData): Promise<{ success: boolean; error?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const portalUrl = `${appUrl}/portal/${data.portalToken}`;
  const belt = BELT_DISPLAY[data.beltLevel];

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.studentEmail,
      subject: `Your session report from ${data.coachName}`,
      html: buildEmailHtml({ ...data, portalUrl, feedbackUrl: `${portalUrl}?tab=feedback`, beltColor: belt?.color || '#1A1A2E' }),
    });
    return { success: true };
  } catch (err: any) {
    console.error('Email send failed:', err.message);
    return { success: false, error: err.message };
  }
}

function buildEmailHtml(data: SessionEmailData & { portalUrl: string; feedbackUrl: string; beltColor: string }): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="background:${BRAND.colors.navy};border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      <h1 style="margin:0;color:white;font-size:20px;font-weight:700;">The Surf Sequence</h1>
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
          <span style="font-size:13px;color:#111827;font-weight:500;">${new Date(data.sessionDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
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

      <!-- Homework -->
      <div style="background:#FFF7ED;border-left:3px solid ${BRAND.colors.gold};padding:12px;border-radius:0 8px 8px 0;margin-bottom:16px;">
        <p style="font-size:11px;color:#92400E;margin:0 0 4px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Your Homework</p>
        <p style="font-size:14px;color:#78350F;margin:0;font-weight:500;">${data.homework}</p>
      </div>

      <!-- What's Next -->
      <div style="margin-bottom:24px;">
        <p style="font-size:12px;color:#6B7280;margin:0 0 4px;">Next Recommended Focus</p>
        <p style="font-size:14px;color:#111827;font-weight:500;margin:0;">${data.whatsNext}</p>
      </div>

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
