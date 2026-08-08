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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com';
  const url = `${baseUrl}/intake/${data.portal_token}`;

  if (!data.email) {
    return { url, emailed: false, reason: 'No email on file' };
  }

  try {
    // Resend v3 no lanza en fallo de API: devuelve { error }. Sin este check
    // se reportaba emailed:true aunque el correo nunca saliera.
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'The Surf Sequence <onboarding@resend.dev>',
      to: data.email,
      subject: 'Welcome — please complete your safety form',
      html: buildHtml(data.first_name, url),
    });
    if (error) {
      const msg = (error as any)?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      console.error('sendLeadInvitation failed:', msg);
      return { url, emailed: false, reason: msg };
    }
    return { url, emailed: true };
  } catch (err: any) {
    console.error('sendLeadInvitation failed:', err?.message || err);
    return { url, emailed: false, reason: err?.message || String(err) };
  }
}

function buildHtml(firstName: string, url: string): string {
  // Same branded shell as every other email: navy header + The Surf Sequence
  // logo, white card body.
  const logo = `<img src="https://app.thesurfsequence.com/tss-logo-white-h.png" alt="The Surf Sequence" width="210" style="display:block;margin:0 auto;max-width:72%;height:auto;" />`;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px;">
    <div style="background:#0d2240;border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      ${logo}
    </div>
    <div style="background:white;padding:24px;border-radius:0 0 12px 12px;border:1px solid #E5E7EB;border-top:none;">
      <h1 style="font-family:Georgia,serif;font-size:20px;margin:0 0 14px;color:#0d2240;">Hi ${firstName} — welcome to The Surf Sequence</h1>
      <p style="font-size:14px;color:#374151;line-height:1.6;margin:0;">Before your first session we need a couple of safety details from you (waiver, emergency contact, swim level, medical). Takes 3–4 minutes.</p>
      <p style="margin:24px 0;">
        <a href="${url}" style="display:inline-block;padding:12px 22px;background:#0d2240;color:#FFFFFF;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">
          Complete safety form →
        </a>
      </p>
      <p style="font-size:12px;color:#64748B;line-height:1.5;">If the button doesn't open, copy this link into your browser:<br><span style="word-break:break-all;">${url}</span></p>
      <div style="margin-top:20px;padding:14px 16px;background:#F0F9FF;border:1px solid #BAE6FD;border-radius:10px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0d2240;">📲 Add The Surf Sequence to your phone</p>
        <p style="margin:0 0 6px;font-size:12px;color:#374151;line-height:1.6;"><strong>iPhone:</strong> open your link in Safari → tap the Share button → <strong>"Add to Home Screen"</strong>.</p>
        <p style="margin:0 0 6px;font-size:12px;color:#374151;line-height:1.6;"><strong>Android:</strong> open it in Chrome → tap the ⋮ menu → <strong>"Add to Home screen"</strong>.</p>
        <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.6;">You'll get The Surf Sequence icon on your home screen — your portal, one tap away.</p>
      </div>
      <p style="font-size:12px;color:#64748B;margin-top:20px;">— The Surf Sequence</p>
    </div>
  </div>
</body>
</html>`;
}
