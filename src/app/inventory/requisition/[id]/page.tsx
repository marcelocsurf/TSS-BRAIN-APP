import { getRequisition } from '@/lib/actions/requisitions';
import { PrintButton } from './print-button';

// Clean, printable purchase requisition (open in a new tab → Print → Save as
// PDF → send to purchasing). Authed via middleware (coordinator/admin session).

export default async function RequisitionPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const req = await getRequisition(id);

  if (!req) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: 24, fontFamily: 'system-ui, sans-serif', textAlign: 'center', color: '#6B7280' }}>
        <p>Requisición no encontrada o sin acceso.</p>
      </div>
    );
  }

  const date = new Date(req.created_at).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  const totalUnits = req.items.reduce((n, it) => n + (it.needed || 0), 0);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 28px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#111827' }}>
      <PrintButton />

      {/* Header */}
      <div style={{ borderBottom: '3px solid #0A1628', paddingBottom: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: '#5AC3E7', fontWeight: 700, margin: 0 }}>
          The Surf Sequence · Requisición de compra
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0A1628', margin: '6px 0 4px' }}>
          {req.academy_name || 'Academia'}
        </h1>
        <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>
          Fecha: {date} · Solicitado por: {req.created_by_name || '—'} · Ref: {req.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <p style={{ fontSize: 14, color: '#374151', margin: '0 0 16px' }}>
        Los siguientes ítems están por debajo del mínimo de stock. Cantidad a comprar para reponer:
      </p>

      {/* Items table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#F3F4F6', textAlign: 'left' }}>
            <th style={{ padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#6B7280' }}>Ítem</th>
            <th style={{ padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#6B7280' }}>Categoría</th>
            <th style={{ padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#6B7280', textAlign: 'center' }}>En stock</th>
            <th style={{ padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#6B7280', textAlign: 'center' }}>Mínimo</th>
            <th style={{ padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#0A1628', textAlign: 'center', fontWeight: 800 }}>Comprar</th>
          </tr>
        </thead>
        <tbody>
          {req.items.map((it, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #E5E7EB' }}>
              <td style={{ padding: '9px 10px', fontWeight: 600 }}>
                {it.name}{it.unit ? <span style={{ color: '#9CA3AF', fontWeight: 400 }}> · {it.unit}</span> : ''}
              </td>
              <td style={{ padding: '9px 10px', color: '#6B7280' }}>{it.category || '—'}</td>
              <td style={{ padding: '9px 10px', textAlign: 'center', color: '#DC2626', fontWeight: 700 }}>{it.in_stock}</td>
              <td style={{ padding: '9px 10px', textAlign: 'center', color: '#6B7280' }}>{it.minimum}</td>
              <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 800, fontSize: 15, color: '#0A1628' }}>{it.needed}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 700, color: '#374151' }}>Total de unidades a comprar</td>
            <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 800, fontSize: 16, color: '#0A1628' }}>{totalUnits}</td>
          </tr>
        </tfoot>
      </table>

      {req.note && (
        <p style={{ marginTop: 18, fontSize: 13, color: '#374151' }}><strong>Nota:</strong> {req.note}</p>
      )}

      <p style={{ marginTop: 40, fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
        The Surf Sequence® · Documento generado el {date}
      </p>
    </div>
  );
}
