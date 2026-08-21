import { NextRequest, NextResponse } from 'next/server';
import { getExperienceReport, type ExperienceResponseRow } from '@/lib/actions/reports-experience';
import { EXPERIENCE_LABELS_ES, DIM_COLS } from '@/lib/survey/experience-questions';
import { buildCsv, type CsvColumn } from '@/lib/utils/csv';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = await getExperienceReport({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    academyId: searchParams.get('academy'),
  });
  if (!data.ok) return NextResponse.json({ error: data.error || 'Forbidden' }, { status: 403 });

  const columns: CsvColumn<ExperienceResponseRow>[] = [
    ['Fecha', 'date'],
    ['Alumno', 'studentName'],
    ['Camp', (r) => r.campName ?? ''],
    ...DIM_COLS.map((c): CsvColumn<ExperienceResponseRow> => [EXPERIENCE_LABELS_ES[c], (r) => r.scores[c] ?? '']),
    ['NPS (0-10)', (r) => r.nps ?? ''],
    ['Comentario', (r) => r.comment ?? ''],
    ['Alerta', (r) => (r.isAlert ? 'SÍ' : '')],
  ];
  const body = buildCsv(data.responses, columns);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="experiencia-camp-${stamp}.csv"`,
    },
  });
}
