import { NextRequest, NextResponse } from 'next/server';
import { getMembershipsReport } from '@/lib/actions/reports-memberships';
import { buildCsv, type CsvColumn } from '@/lib/utils/csv';

// Export: una fila por membresía relevante con su categoría (pendiente / por
// vencer / renovación confirmada), para que quepa todo en un solo CSV.
interface Flat {
  categoria: string; alumno: string; email: string; meses: string; monto_usd: string;
  metodo: string; vigente_hasta: string; fecha: string; dias_restantes: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = await getMembershipsReport({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    academyId: searchParams.get('academy'),
  });
  if (!data.ok) return NextResponse.json({ error: data.error || 'Forbidden' }, { status: 403 });

  const rows: Flat[] = [
    ...data.pending.map((p) => ({ categoria: 'Pendiente', alumno: p.name, email: p.email ?? '', meses: p.months != null ? String(p.months) : '', monto_usd: '', metodo: '', vigente_hasta: '', fecha: p.requestedAt ?? '', dias_restantes: '' })),
    ...data.expiring.map((e) => ({ categoria: 'Por vencer', alumno: e.name, email: e.email ?? '', meses: '', monto_usd: '', metodo: '', vigente_hasta: e.endsAt, fecha: '', dias_restantes: String(e.daysLeft) })),
    ...data.confirmed.map((c) => ({ categoria: 'Renovacion', alumno: c.name, email: c.email ?? '', meses: c.months != null ? String(c.months) : '', monto_usd: c.amountCents != null ? (c.amountCents / 100).toFixed(2) : '', metodo: c.paymentMethod ?? '', vigente_hasta: c.endsAt ?? '', fecha: c.createdAt ?? '', dias_restantes: '' })),
  ];
  const columns: CsvColumn<Flat>[] = [
    ['Categoria', 'categoria'], ['Alumno', 'alumno'], ['Email', 'email'], ['Meses', 'meses'],
    ['Monto USD', 'monto_usd'], ['Metodo', 'metodo'], ['Vigente hasta', 'vigente_hasta'], ['Fecha', 'fecha'], ['Dias restantes', 'dias_restantes'],
  ];
  const body = buildCsv(rows, columns);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="renovaciones-membresia-${stamp}.csv"`,
    },
  });
}
