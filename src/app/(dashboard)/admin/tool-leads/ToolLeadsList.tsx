'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { convertToolLead } from '@/lib/actions/tool-leads';
import { Download } from 'lucide-react';

type Lead = { id: string; name: string | null; email: string; tool: string; opens: number; devices: number; first_seen: string; last_seen: string; converted_at: string | null };

const TOOL_CHIP: Record<string, { label: string; cls: string }> = {
  'venue-scout': { label: 'Venue Scout', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  'venue-check': { label: 'Venue Check', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

export function ToolLeadsList({ leads, academies }: { leads: Lead[]; academies: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [convertId, setConvertId] = useState<string | null>(null);
  const [academyId, setAcademyId] = useState('');

  const exportCsv = () => {
    const rows = [['Nombre', 'Email', 'Herramienta', 'Usos', 'Dispositivos', 'Primer uso', 'Último uso']];
    for (const l of leads) rows.push([l.name ?? '', l.email, l.tool, String(l.opens), String(l.devices), l.first_seen.slice(0, 10), l.last_seen.slice(0, 10)]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
    a.download = 'tool-leads.csv';
    a.click();
  };

  if (leads.length === 0) {
    return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-sm text-gray-400">Todavía no hay leads — compartí el link de la herramienta y van a ir cayendo acá. 🌊</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex justify-end mb-2">
        <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 text-[var(--tss-navy)]">
          <Download size={13} /> Descargar Excel (CSV)
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {leads.map((l) => {
          const chip = TOOL_CHIP[l.tool] ?? { label: l.tool, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
          return (
            <div key={l.id} className="py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[var(--tss-navy)] truncate">
                    {l.name || l.email}
                    <span className={`ml-2 text-[9px] font-bold rounded-full px-2 py-0.5 border align-middle ${chip.cls}`}>{chip.label}</span>
                    {l.converted_at && <span className="ml-1.5 text-[9px] font-bold rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 align-middle">Convertido ✓</span>}
                  </p>
                  <p className="text-[11px] text-gray-400 truncate">{l.email} · {l.opens} uso{l.opens === 1 ? '' : 's'} · {l.devices} dispositivo{l.devices === 1 ? '' : 's'} · último: {l.last_seen.slice(0, 10)}</p>
                </div>
                {!l.converted_at && (
                  <button type="button" onClick={() => { setConvertId(convertId === l.id ? null : l.id); setAcademyId(''); }}
                    className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--tss-navy)] text-white">
                    Convertir →
                  </button>
                )}
              </div>
              {convertId === l.id && (
                <div className="mt-2 flex items-center gap-2">
                  <select value={academyId} onChange={(e) => setAcademyId(e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
                    <option value="">Elegí la academia…</option>
                    {academies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <button type="button" disabled={pending || !academyId}
                    onClick={() => start(async () => {
                      const r = await convertToolLead(l.id, academyId);
                      if (!r.ok) { alert(r.error); return; }
                      setConvertId(null); router.refresh();
                    })}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-40">
                    {pending ? '…' : 'Crear lead'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
