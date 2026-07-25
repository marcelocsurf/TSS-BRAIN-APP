import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// PUBLIC endpoint for the tool lead-gate (M151). The standalone tools
// (venue-scout / venue-check) POST here from any origin (they also live on
// GitHub Pages), so CORS is open. Data captured: name + email + usage count.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const name = String(body.name ?? '').trim().slice(0, 80) || null;
    const tool = ['venue-scout', 'venue-check'].includes(body.tool) ? body.tool : 'venue-scout';
    const newDevice = !!body.newDevice;
    if (!email || !email.includes('@') || email.length > 120) {
      return NextResponse.json({ ok: false }, { status: 400, headers: CORS });
    }
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from('tool_leads').select('id, opens, devices, name').eq('email', email).eq('tool', tool).maybeSingle();
    if (existing) {
      await admin.from('tool_leads').update({
        opens: (existing.opens ?? 0) + 1,
        devices: (existing.devices ?? 1) + (newDevice ? 1 : 0),
        last_seen: new Date().toISOString(),
        ...(name && !existing.name ? { name } : {}),
      }).eq('id', existing.id);
    } else {
      await admin.from('tool_leads').insert({ email, name, tool });
    }
    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: CORS });
  }
}
