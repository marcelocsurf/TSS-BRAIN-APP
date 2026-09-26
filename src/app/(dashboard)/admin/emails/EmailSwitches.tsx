'use client';
import { useState } from 'react';
import { setEmailEnabled, sendSurveyPreviewEmail, type EmailSettingRow } from '@/lib/actions/email-settings';

const AUD: Record<string, string> = { student: 'Al alumno', coach: 'Al coach', staff: 'Al equipo', lead: 'A leads' };

export function EmailSwitches({ rows: initial }: { rows: EmailSettingRow[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const groups = ['student', 'coach', 'staff', 'lead'].map((a) => ({ a, list: rows.filter((r) => r.audience === a) })).filter((g) => g.list.length);
  // Vista previa del correo de cierre de camp (Marcelo 2026-09-26): el equipo
  // de la academia ve exactamente lo que le llega al cliente.
  const [previewTo, setPreviewTo] = useState('academy@purosurf.com');
  const [previewState, setPreviewState] = useState<{ busy: boolean; msg: string | null; ok: boolean }>({ busy: false, msg: null, ok: false });
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      <div>
        <h1 className="text-xl font-bold">Correos</h1>
        <p className="text-sm text-[#55666E] mt-1">Cada correo tiene su interruptor. Apagado = no sale aunque tenga disparador. Los marcados NEW nacen apagados hasta que los prendas.</p>
      </div>
      {groups.map((g) => (
        <div key={g.a} className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] divide-y">
          <p className="px-4 py-2 text-[11px] font-mono uppercase tracking-wider text-[#55666E]">{AUD[g.a]}</p>
          {g.list.map((r) => (
            <div key={r.kind} className="px-4 py-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#10263B]">{r.label}</p>
                <p className="text-[11px] text-[#55666E] font-mono">{r.kind}</p>
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

      <div className="bg-[#E9E2D2] rounded-lg border border-[#DCD7C6] px-4 py-4 space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-wider text-[#55666E]">Vista previa · correo de cierre de camp</p>
        <p className="text-sm text-[#10263B]">Manda a la dirección que escribas el mismo correo que recibe el cliente al cerrar su camp: logo de Puro Surf, próximo foco y el link a la encuesta (Method &amp; coach → Experience). Usa la persona de prueba Androide; el link se puede abrir y responder sin tocar a ningún cliente real.</p>
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={async (e) => {
          e.preventDefault();
          setPreviewState({ busy: true, msg: null, ok: false });
          const r = await sendSurveyPreviewEmail(previewTo);
          setPreviewState({ busy: false, ok: r.ok, msg: r.ok ? `Enviado a ${previewTo.trim()}.` : (r.error ?? 'No salió.') });
        }}>
          <input type="email" value={previewTo} onChange={(e) => setPreviewTo(e.target.value)} required
            className="flex-1 h-10 rounded-lg px-3 text-sm bg-white border border-[#DCD7C6]" placeholder="correo@dominio.com" />
          <button type="submit" disabled={previewState.busy} className="h-10 px-4 rounded-full text-[12px] font-bold disabled:opacity-50" style={{ background: '#00D2FF', color: '#061C2B' }}>
            {previewState.busy ? 'Enviando…' : 'Enviar vista previa'}
          </button>
        </form>
        {previewState.msg && <p className="text-[12px]" style={{ color: previewState.ok ? '#0a7c5d' : '#b42318' }}>{previewState.msg}</p>}
      </div>
    </div>
  );
}
