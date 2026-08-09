import { NextRequest, NextResponse } from 'next/server';
import { getClosuresByCoach, type CoachClosureRow } from '@/lib/actions/reports-closures';
import { buildCsv, type CsvColumn } from '@/lib/utils/csv';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = await getClosuresByCoach({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    academyId: searchParams.get('academy'),
  });
  if (!data.ok) return NextResponse.json({ error: data.error || 'Forbidden' }, { status: 403 });

  const columns: CsvColumn<CoachClosureRow>[] = [
    ['Coach', 'name'],
    ['Academia', (r) => r.academyName ?? ''],
    ['Programadas', 'scheduled'],
    ['Cerradas', 'closed'],
    ['Atrasadas', 'overdue'],
    ['Proximas', 'upcoming'],
    ['Cumplimiento %', (r) => (r.compliancePct != null ? r.compliancePct : '')],
  ];
  const body = buildCsv(data.rows, columns);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="cierres-por-coach-${stamp}.csv"`,
    },
  });
}
