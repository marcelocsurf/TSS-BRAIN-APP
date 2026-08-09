import { NextRequest, NextResponse } from 'next/server';
import { getAcademyPnL, type PnLRow } from '@/lib/actions/reports-pnl';
import { buildCsv, type CsvColumn } from '@/lib/utils/csv';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = await getAcademyPnL({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    academyId: searchParams.get('academy'),
  });
  if (!data.ok) return NextResponse.json({ error: data.error || 'Forbidden' }, { status: 403 });

  const columns: CsvColumn<PnLRow>[] = [
    ['Academia', 'academyName'],
    ['Ingreso asientos USD', (r) => (r.seatRevenueCents / 100).toFixed(2)],
    ['Ingreso membresias USD', (r) => (r.membershipRevenueCents / 100).toFixed(2)],
    ['Ingresos USD', (r) => (r.revenueCents / 100).toFixed(2)],
    ['Nomina coaches USD', (r) => (r.coachCostCents / 100).toFixed(2)],
    ['Neto USD', (r) => (r.netCents / 100).toFixed(2)],
    ['Margen %', (r) => (r.marginPct != null ? r.marginPct : '')],
  ];
  const body = buildCsv(data.rows, columns);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pnl-por-academia-${stamp}.csv"`,
    },
  });
}
