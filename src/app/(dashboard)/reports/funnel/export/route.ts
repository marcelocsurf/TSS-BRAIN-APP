import { NextRequest, NextResponse } from 'next/server';
import { getQrFunnel, type FunnelChannel } from '@/lib/actions/reports-funnel';
import { buildCsv, type CsvColumn } from '@/lib/utils/csv';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = await getQrFunnel({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    academyId: searchParams.get('academy'),
  });
  if (!data.ok) return NextResponse.json({ error: data.error || 'Forbidden' }, { status: 403 });

  const columns: CsvColumn<FunnelChannel>[] = [
    ['Canal', 'label'],
    ['Reservas', 'bookings'],
    ['Sin cobrar', 'unpaid'],
    ['Pagadas', 'paid'],
    ['Canceladas', 'cancelled'],
    ['Conversion %', 'conversionPct'],
  ];
  const body = buildCsv(data.channels, columns);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="embudo-qr-${stamp}.csv"`,
    },
  });
}
