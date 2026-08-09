import { NextRequest, NextResponse } from 'next/server';
import { getOccupancyReport, type OccupancyGroupBy, type OccupancyRow } from '@/lib/actions/reports-occupancy';
import { buildCsv, type CsvColumn } from '@/lib/utils/csv';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const groupBy = (searchParams.get('groupBy') as OccupancyGroupBy) || 'service_kind';
  const data = await getOccupancyReport({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    groupBy,
    academyId: searchParams.get('academy'),
  });
  if (!data.ok) return NextResponse.json({ error: data.error || 'Forbidden' }, { status: 403 });

  const columns: CsvColumn<OccupancyRow>[] = [
    ['Grupo', 'label'],
    ['Servicios', 'services'],
    ['Cupos', 'spots'],
    ['Inscritos', 'enrolled'],
    ['Pagados', 'sold'],
    ['Reservados sin pagar', 'reserved'],
    ['Libres', 'available'],
    ['Ocupacion %', 'occupancyPct'],
    ['Ocupacion pagada %', 'paidPct'],
    ['Sin cupo definido', 'capacityNotSet'],
  ];
  const body = buildCsv(data.rows, columns);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ocupacion-${groupBy}-${stamp}.csv"`,
    },
  });
}
