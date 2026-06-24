import { NextResponse } from 'next/server';
import { getCurrentCoach } from '@/lib/actions/auth';
import { listDetailedCourseGrants } from '@/lib/actions/course-grants';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

const SOURCE_LABEL: Record<string, string> = {
  manual: 'Manual',
  auto_on_camp_enrol: 'Camp',
  auto_on_intake: 'Auto (intake)',
  direct_purchase: 'TSS Direct',
  override: 'Override (admin)',
  access_code: 'Access code',
};

function csvCell(v: string | number | null): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const me = await getCurrentCoach();
  if (!me || !(me.is_platform_admin || me.role === 'coordinator')) {
    return new NextResponse('Unauthorized', { status: 403 });
  }

  const rows = await listDetailedCourseGrants();
  const header = ['Date', 'Student', 'Course', 'Channel', 'Academy', 'Price', 'Currency', 'Billable', 'Granted by', 'Status'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push([
      csvCell(new Date(r.granted_at).toISOString().slice(0, 10)),
      csvCell(r.student_name),
      csvCell(BELT_DISPLAY[r.course_key as BeltLevel]?.en || r.course_key),
      csvCell(SOURCE_LABEL[r.source] || r.source),
      csvCell(r.academy_name),
      csvCell(r.price_cents == null ? '' : (r.price_cents / 100).toFixed(2)),
      csvCell(r.currency || 'USD'),
      csvCell(r.billable ? 'yes' : 'no'),
      csvCell(r.granted_by_name || ''),
      csvCell(r.revoked_at ? 'revoked' : 'active'),
    ].join(','));
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="course-sales-log.csv"`,
    },
  });
}
