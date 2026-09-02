'use server';

// Public "get my portal link" flow (/my-portal). A student on any device
// enters their email; if it matches active students we email them their
// portal link(s). The response is always the same neutral success so the
// page never reveals whether an email exists (no account enumeration).

import { createAdminClient } from '@/lib/supabase/admin';
import { sendPortalLinkEmail } from '@/lib/actions/email';

// Best-effort in-process throttle: one send per email per minute. Serverless
// instances don't share memory, so this is a soft brake, not a guarantee —
// fine for this endpoint (it can only email the address's real owner).
const lastSent = new Map<string, number>();

export async function requestPortalLink(rawEmail: string): Promise<{ ok: true }> {
  const email = (rawEmail || '').trim().toLowerCase();
  // Silently accept invalid input — same neutral answer as everything else.
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: true };

  const last = lastSent.get(email) ?? 0;
  if (Date.now() - last < 60_000) return { ok: true };
  lastSent.set(email, Date.now());

  try {
    const admin = createAdminClient();
    const { data: students } = await admin
      .from('students')
      .select('id, first_name, portal_token, status, email')
      .eq('email', email)
      .limit(10);

    const active = (students ?? []).filter(
      (s: any) => s.portal_token && s.status !== 'inactive',
    );
    if (active.length === 0) return { ok: true };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com';
    await sendPortalLinkEmail({
      toEmail: email,
      students: active.map((s: any) => ({
        firstName: s.first_name || 'Surfer',
        portalUrl: `${appUrl}/portal/${s.portal_token}`,
      })),
    });
  } catch (e) {
    // Never leak errors to the public page.
    console.error('[requestPortalLink] failed:', e);
  }
  return { ok: true };
}
