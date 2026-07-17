'use client';

import { useEffect, useState, useTransition } from 'react';
import { ClipboardList, FileDown, Check, X, ShoppingCart, ChevronDown } from 'lucide-react';
import { listRequisitions, setRequisitionStatus, type Requisition } from '@/lib/actions/requisitions';

// Manager's purchase-requisition inbox: requisitions generated from low-stock
// inventory. See what's needed, mark ordered/received, and open the printable
// PDF to send to purchasing.

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: 'Abierta', cls: 'text-amber-700 bg-amber-50 border-amber-200' },
  ordered: { label: 'Pedida', cls: 'text-blue-700 bg-blue-50 border-blue-200' },
  received: { label: 'Recibida', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  cancelled: { label: 'Cancelada', cls: 'text-gray-500 bg-gray-50 border-gray-200' },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function RequisitionsPanel() {
  const [reqs, setReqs] = useState<Requisition[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function refresh() { listRequisitions().then(setReqs).catch(() => setReqs([])); }
  useEffect(() => { refresh(); }, []);

  // Only surface active requisitions (hide received/cancelled from the panel).
  const active = (reqs ?? []).filter((r) => r.status === 'open' || r.status === 'ordered');
  if (!reqs || active.length === 0) return null;

  function mark(id: string, status: 'ordered' | 'received' | 'cancelled') {
    start(async () => {
      const r = await setRequisitionStatus(id, status);
      if (!r.ok) { alert(r.error || 'No se pudo actualizar.'); return; }
      refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <h2 className="inline-flex items-center gap-2 text-sm font-bold text-[var(--tss-navy)] mb-3">
        <ClipboardList size={16} className="text-[var(--tss-cyan,#5AC3E7)]" /> Requisiciones de compra
        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">{active.length}</span>
      </h2>

      <ul className="space-y-2">
        {active.map((r) => {
          const isOpen = openId === r.id;
          const st = STATUS[r.status] ?? STATUS.open;
          return (
            <li key={r.id} className="rounded-xl border border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                <button type="button" onClick={() => setOpenId(isOpen ? null : r.id)} className="min-w-0 text-left flex items-center gap-2">
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[var(--tss-navy)]">
                      {r.items.length} ítem{r.items.length === 1 ? '' : 's'} · {fmtDate(r.created_at)}
                    </span>
                    <span className="block text-[11px] text-gray-500">{r.created_by_name || 'Coordinador'}</span>
                  </span>
                </button>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full border px-2 py-0.5 ${st.cls}`}>{st.label}</span>
                  <a
                    href={`/inventory/requisition/${r.id}`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    title="Ver / imprimir PDF"
                  ><FileDown size={12} /> PDF</a>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-gray-100 px-3 py-2.5">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-[10px] uppercase tracking-wider text-gray-400 text-left">
                        <th className="py-1 font-mono">Ítem</th>
                        <th className="py-1 font-mono text-center">Stock</th>
                        <th className="py-1 font-mono text-center">Mín</th>
                        <th className="py-1 font-mono text-center">Pedir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.items.map((it, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="py-1.5 text-gray-800">{it.name}{it.unit ? <span className="text-gray-400"> · {it.unit}</span> : ''}</td>
                          <td className="py-1.5 text-center text-red-600 font-semibold">{it.in_stock}</td>
                          <td className="py-1.5 text-center text-gray-500">{it.minimum}</td>
                          <td className="py-1.5 text-center font-bold text-[var(--tss-navy)]">{it.needed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {r.note && <p className="mt-2 text-[11px] text-gray-500 italic">Nota: {r.note}</p>}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.status === 'open' && (
                      <button onClick={() => mark(r.id, 'ordered')} disabled={pending} className="inline-flex items-center gap-1 text-[12px] font-bold px-2.5 py-1.5 rounded-lg bg-blue-600 text-white disabled:opacity-50">
                        <ShoppingCart size={13} /> Marcar pedida
                      </button>
                    )}
                    <button onClick={() => mark(r.id, 'received')} disabled={pending} className="inline-flex items-center gap-1 text-[12px] font-bold px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white disabled:opacity-50">
                      <Check size={13} /> Recibida
                    </button>
                    <button onClick={() => mark(r.id, 'cancelled')} disabled={pending} className="inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-red-600 disabled:opacity-50">
                      <X size={13} /> Cancelar
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
