import { NextRequest, NextResponse } from 'next/server';
import { getCurrentCoach } from '@/lib/actions/auth';
import { getBillingForMonth } from '@/lib/actions/course-grants';

// CSV export of /admin/billing for a given month. Same data the page
// shows, flattened to a row-per-(academy,course,source). Importable to
// any invoicing/accounting tool.

function escapeCsv(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const coach = await getCurrentCoach();
  if (!coach?.is_platform_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  if (!month) {
    return NextResponse.json({ error: 'Missing month' }, { status: 400 });
  }

  const rows = await getBillingForMonth(month);

  const header = [
    'academy_id',
    'academy_name',
    'course_key',
    'source',
    'count',
    'total_cents',
    'currency',
    'revoked_count',
  ];

  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.academy_id ?? '',
        escapeCsv(r.academy_name),
        r.course_key,
        r.source,
        String(r.count),
        String(r.total_cents),
        r.currency,
        String(r.revoked_count),
      ].join(','),
    );
  }

  const csv = lines.join('\n');
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="tss-billing-${month}.csv"`,
    },
  });
}
