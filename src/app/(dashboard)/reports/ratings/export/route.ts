import { NextRequest, NextResponse } from 'next/server';
import { getRatingsByCoach, type CoachRatingRow } from '@/lib/actions/reports-ratings';
import { buildCsv, type CsvColumn } from '@/lib/utils/csv';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = await getRatingsByCoach({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    academyId: searchParams.get('academy'),
  });
  if (!data.ok) return NextResponse.json({ error: data.error || 'Forbidden' }, { status: 403 });

  const columns: CsvColumn<CoachRatingRow>[] = [
    ['Coach', 'name'],
    ['Academia', (r) => r.academyName ?? ''],
    ['Promedio', (r) => r.avg.toFixed(1)],
    ['Respuestas', 'total'],
    ['5 estrellas', (r) => r.stars['5']],
    ['4 estrellas', (r) => r.stars['4']],
    ['3 estrellas', (r) => r.stars['3']],
    ['2 estrellas', (r) => r.stars['2']],
    ['1 estrella', (r) => r.stars['1']],
  ];
  const body = buildCsv(data.coaches, columns);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ratings-por-coach-${stamp}.csv"`,
    },
  });
}
