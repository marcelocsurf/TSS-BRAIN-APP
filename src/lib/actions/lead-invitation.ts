'use server';

// Sends the newly-created Lead a single link to the /intake/[token] flow:
// required safety + waiver first, then (for members) the level quiz and
// extended profile — all in one link, no second send. Falls back to
// returning the URL so the coordinator can paste it into WhatsApp when
// the lead has no email.

import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendResult {
  url: string;
  emailed: boolean;
  reason?: string;
}

export async function sendLeadInvitation(studentId: string): Promise<SendResult> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('students')
    .select('id, first_name, last_name, email, portal_token')
    .eq('id', studentId)
    .single();
  if (error || !data) throw new Error(error?.message ?? 'Student not found');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tss-brain-app.vercel.app';
  const url = `${baseUrl}/intake/${data.portal_token}`;

  if (!data.email) {
    return { url, emailed: false, reason: 'No email on file' };
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.email,
      subject: 'Welcome — please complete your safety form',
      html: buildHtml(data.first_name, url),
    });
    return { url, emailed: true };
  } catch (err: any) {
    console.error('sendLeadInvitation failed:', err.message);
    return { url, emailed: false, reason: err.message };
  }
}

function buildHtml(firstName: string, url: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1A1A2E;">
  <h1 style="font-family: Georgia, serif; font-size: 22px; margin: 0 0 16px;">Hi ${firstName} — welcome to The Surf Sequence</h1>
  <p style="line-height: 1.6;">Before your first session we need a couple of safety details from you (waiver, emergency contact, swim level, medical). Takes 3–4 minutes.</p>
  <p style="margin: 28px 0;">
    <a href="${url}" style="display: inline-block; padding: 12px 22px; background: #071426; color: #FFF; text-decoration: none; border-radius: 8px; font-weight: 600;">
      Complete safety form →
    </a>
  </p>
  <p style="font-size: 12px; color: #64748B; line-height: 1.5;">If the button doesn't open, copy this link into your browser:<br><span style="word-break: break-all;">${url}</span></p>
  <p style="font-size: 12px; color: #64748B; margin-top: 24px;">— The Surf Sequence</p>
</body>
</html>`;
}
