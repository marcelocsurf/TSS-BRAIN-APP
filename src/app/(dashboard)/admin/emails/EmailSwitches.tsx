'use client';
import { useState } from 'react';
import { setEmailEnabled, type EmailSettingRow } from '@/lib/actions/email-settings';

const AUD: Record<string, string> = { student: 'Al alumno', coach: 'Al coach', staff: 'Al equipo', lead: 'A leads' };

export function EmailSwitches({ rows: initial }: { rows: EmailSettingRow[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const groups = ['student', 'coach', 'staff', 'lead'].map((a) => ({ a, list: rows.filter((r) => r.audience === a) })).filter((g) => g.list.length);
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div>
        <h1 className="text-xl font-bold">Correos</h1>
        <p className="text-sm text-gray-500 mt-1">Cada correo tiene su interruptor. Apagado = no sale aunque tenga disparador. Los marcados NEW nacen apagados hasta que los prendas.</p>
      </div>
      {groups.map((g) => (
        <div key={g.a} className="bg-white rounded-2xl border border-gray-200 divide-y">
          <p className="px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-gray-500">{AUD[g.a]}</p>
          {g.list.map((r) => (
            <div key={r.kind} className="px-4 py-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">{r.label}</p>
                <p className="text-[11px] text-gray-400 font-mono">{r.kind}</p>
              </div>
              <button type="button" disabled={busy === r.kind} aria-pressed={r.enabled}
                onClick={async () => {
                  setBusy(r.kind);
                  const res = await setEmailEnabled(r.kind, !r.enabled);
                  if (res.ok) setRows((p) => p.map((x) => (x.kind === r.kind ? { ...x, enabled: !r.enabled } : x)));
                  else alert(res.error ?? 'No se pudo guardar.');
                  setBusy(null);
                }}
                className="h-9 px-4 rounded-full text-[12px] font-bold disabled:opacity-50"
                style={r.enabled ? { background: '#06D6A0', color: '#061C2B' } : { background: '#e5e7eb', color: '#6b7280' }}>
                {r.enabled ? 'Encendido' : 'Apagado'}
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
