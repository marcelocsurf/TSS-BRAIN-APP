import { NextRequest, NextResponse } from 'next/server';
import { getSeatRevenue, type Granularity } from '@/lib/actions/reports-revenue';
import { SERVICE_LABELS } from '@/lib/reports/revenue-shared';
import { buildCsv, type CsvColumn } from '@/lib/utils/csv';

// Export CSV del reporte de ingresos por venta de asientos. El gate + scoping
// viven dentro de getSeatRevenue (resolveReportScope) — misma auth que la página.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const granularity: Granularity = searchParams.get('granularity') === 'month' ? 'month' : 'week';
  const data = await getSeatRevenue({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    granularity,
    academyId: searchParams.get('academy'),
  });
  if (!data.ok) return NextResponse.json({ error: data.error || 'Forbidden' }, { status: 403 });

  type Row = (typeof data.rows)[number];
  const serviceCols: CsvColumn<Row>[] = data.serviceTotals.map((s) => [
    SERVICE_LABELS[s.key],
    (r: Row) => (r.byService[s.key] / 100).toFixed(2),
  ]);
  const columns: CsvColumn<Row>[] = [
    ['Periodo', 'period'],
    ...serviceCols,
    ['Total USD', (r) => (r.total / 100).toFixed(2)],
    ['Asientos', 'seats'],
  ];
  const body = buildCsv(data.rows, columns);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ingresos-${granularity}-${stamp}.csv"`,
    },
  });
}
