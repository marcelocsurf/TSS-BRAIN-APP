import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isRealPlatformAdmin } from '@/lib/actions/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Only platform admin can grant/revoke
  const isAdmin = await isRealPlatformAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { grant } = await request.json();

  const supabase = await createClient();
  const { error } = await supabase
    .from('coaches')
    .update({ course_access_granted: !!grant })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, granted: !!grant });
}
