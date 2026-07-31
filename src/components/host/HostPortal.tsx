'use client';

import { useEffect, useState } from 'react';
import { SellerPortal } from '@/components/seller/SellerPortal';
import { DeskBoard } from '@/app/front-desk/[token]/DeskBoard';
import { getFrontDeskData, getRecentBookings } from '@/lib/actions/front-desk';
import {
  hostSearchStudents, hostAttentionList, hostStudentDetail,
  hostRecentIncidents, hostSendIntakeEmail, type HostStudentRow,
} from '@/lib/actions/host-portal';

// ═══ PORTAL DEL HOST — "Servicio al cliente" (Brand Manual v10) ═══
// HOY: check-in y cobro del mostrador + incidentes recientes.
// VENDER: el tablero completo del vendedor (calendario, videos, decks, ventas).
// CLIENTES: buscador + semáforo de fichas + bitácora resumida + enviar links.

const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0', CORAL = '#FF6B6B';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em' };

type Tab = 'hoy' | 'vender' | 'clientes';

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
      style={ok ? { background: 'rgba(6,214,160,.18)', color: '#0a7c5d' } : { background: 'rgba(255,107,107,.15)', color: '#c04545' }}>
      {ok ? '✓' : '✗'} {label}
    </span>
  );
}

function StudentCard({ token, row }: { token: string; row: HostStudentRow }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const complete = row.waiver && row.intake && row.quiz;

  useEffect(() => {
    if (open && !detail) hostStudentDetail(token, row.id).then(setDetail).catch(() => {});
  }, [open, detail, token, row.id]);

  const copy = (url: string | null, what: string) => {
    if (!url) { setMsg('Sin link disponible'); return; }
    navigator.clipboard.writeText(url).then(() => setMsg(`Link de ${what} copiado — pegalo en WhatsApp`)).catch(() => setMsg(url));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full text-left px-3.5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-bold text-[14px] truncate" style={{ color: INK }}>{row.name}</p>
            <p className="text-[11px] text-gray-400 truncate">{row.belt ? `Cinta ${row.belt}` : 'Sin cinta'}{row.email ? ` · ${row.email}` : ''}</p>
          </div>
          <span className="text-[18px] shrink-0">{complete ? '🟢' : '🟠'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Check ok={row.waiver} label="Waiver" />
          <Check ok={row.intake} label="Ficha" />
          <Check ok={row.quiz} label="Quiz nivel" />
        </div>
      </button>
      {open && (
        <div className="px-3.5 pb-3.5 space-y-2.5 border-t border-gray-50 pt-2.5">
          {!complete && (
            <div className="flex gap-2">
              <button type="button" onClick={async () => { setMsg('Enviando…'); const r = await hostSendIntakeEmail(token, row.id); setMsg(r.ok ? '📧 Email enviado ✓' : (r.error ?? 'No se pudo enviar')); }}
                className="flex-1 rounded-full py-2 text-[9px]" style={{ ...F_M, background: CYAN, color: INK }}>📧 Enviar por email</button>
              <button type="button" onClick={() => copy(row.intake_url, 'intake')}
                className="flex-1 rounded-full py-2 text-[9px]" style={{ ...F_M, background: GREEN, color: INK }}>📋 Copiar link</button>
            </div>
          )}
          <button type="button" onClick={() => copy(row.portal_url, 'portal')}
            className="w-full rounded-full py-2 text-[9px] border" style={{ ...F_M, color: INK, borderColor: '#e5e7eb' }}>🔗 Copiar link del portal del alumno</button>
          {msg && <p className="text-[11px] font-semibold" style={{ color: '#0090B0' }}>{msg}</p>}
          {detail ? (
            <div className="space-y-2">
              {detail.membership && (
                <p className="text-[11px]" style={{ color: detail.membership.active ? '#0a7c5d' : '#c04545' }}>
                  {detail.membership.active ? `Membresía activa · vence en ${detail.membership.days_left} días` : 'Membresía vencida o sin membresía'}
                  {detail.membership.pending_request ? ' · renovación pedida' : ''}
                </p>
              )}
              {detail.upcoming?.length > 0 && (
                <div>
                  <p className="text-[9px] text-gray-400" style={F_M}>Próximas reservas</p>
                  {detail.upcoming.map((u: any, i: number) => (
                    <p key={i} className="text-[12px]" style={{ color: INK }}>
                      {(u.name ?? '').split(' · ')[0]} · {u.date}{u.time ? ` · ${u.time.slice(0, 5)}` : ''} — {u.paid ? '✓ pagado' : '💰 debe pagar'}
                    </p>
                  ))}
                </div>
              )}
              {detail.sessions?.length > 0 && (
                <div>
                  <p className="text-[9px] text-gray-400" style={F_M}>Bitácora reciente</p>
                  {detail.sessions.slice(0, 3).map((r: any, i: number) => (
                    <p key={i} className="text-[11px] text-gray-600 leading-snug">
                      {(r.created_at ?? '').slice(0, 10)} — {r.coach_feedback || r.whats_next || r.status || 'sesión registrada'}
                    </p>
                  ))}
                </div>
              )}
              {detail.incidents?.length > 0 && (
                <div>
                  <p className="text-[9px]" style={{ ...F_M, color: '#c04545' }}>⚠ Incidentes</p>
                  {detail.incidents.map((inc: any, i: number) => (
                    <p key={i} className="text-[11px] text-gray-600">{(inc.created_at ?? '').slice(0, 10)} · {inc.incident_type}: {inc.description}</p>
                  ))}
                </div>
              )}
              {detail.medical_notes && <p className="text-[11px] text-gray-500">🩺 {detail.medical_notes}</p>}
            </div>
          ) : <p className="text-[11px] text-gray-400">Cargando ficha…</p>}
        </div>
      )}
    </div>
  );
}

export function HostPortal({ token, hostName, services }: { token: string; hostName: string; services: any[] }) {
  const [tab, setTab] = useState<Tab>('hoy');
  const [board, setBoard] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[] | null>(null);
  const [recent, setRecent] = useState<any[] | null>(null);
  const [attention, setAttention] = useState<HostStudentRow[] | null>(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<HostStudentRow[] | null>(null);

  useEffect(() => { getFrontDeskData(token).then(setBoard).catch(() => setBoard({ classes: [] })); }, [token]);
  useEffect(() => { if (tab === 'hoy' && incidents === null) hostRecentIncidents(token).then(setIncidents).catch(() => setIncidents([])); }, [tab, incidents, token]);
  useEffect(() => { if (tab === 'hoy' && recent === null) getRecentBookings(token).then(setRecent).catch(() => setRecent([])); }, [tab, recent, token]);
  useEffect(() => { if (tab === 'clientes' && attention === null) hostAttentionList(token).then(setAttention).catch(() => setAttention([])); }, [tab, attention, token]);

  useEffect(() => {
    if (!q.trim()) { setResults(null); return; }
    const t = setTimeout(() => hostSearchStudents(token, q).then(setResults).catch(() => setResults([])), 350);
    return () => clearTimeout(t);
  }, [q, token]);

  if (tab === 'vender') {
    return (
      <div>
        <button type="button" onClick={() => setTab('hoy')} className="fixed top-2 right-3 z-50 rounded-full px-3.5 py-2 text-[9px] shadow-lg"
          style={{ ...F_M, background: GOLD, color: INK }}>← Mi portal</button>
        <SellerPortal token={token} sellerName={hostName} services={services} heading="Servicio al cliente" />
      </div>
    );
  }

  return (
    <div style={{ background: PAPER, minHeight: '100vh' }} className="pb-10">
      <div className="px-4 pt-5 pb-4" style={{ background: INK }}>
        <p style={{ ...F_M, color: CYAN }} className="text-[9px]">The Surf Sequence · Servicio al cliente</p>
        <h1 style={{ ...F_D, color: PAPER }} className="text-[24px] mt-1">{hostName}</h1>
        <div className="flex gap-2 mt-3">
          {([['hoy', '📋 Hoy'], ['vender', '🏄 Vender'], ['clientes', '👥 Clientes']] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              className="flex-1 rounded-full py-2.5 text-[9px]"
              style={{ ...F_M, background: tab === id ? CYAN : 'rgba(247,249,250,.08)', color: tab === id ? INK : 'rgba(247,249,250,.7)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md lg:max-w-3xl mx-auto px-4 pt-4">
        {tab === 'hoy' && (
          <div className="space-y-4">
            {/* Quién acaba de reservar (48 h) — QR o vendedor, pagado o pendiente */}
            {recent !== null && recent.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-[9px] text-gray-400" style={F_M}>🔔 Reservas recientes · 48 h</p>
                <div className="mt-2 space-y-2">
                  {recent.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between gap-2 text-[12px]">
                      <div className="min-w-0">
                        <p className="font-bold truncate" style={{ color: INK }}>{r.name}</p>
                        <p className="text-[10.5px] text-gray-400 truncate">{(r.class_name ?? '').split(' · ').slice(0, 2).join(' · ')} · vía {r.source}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full"
                        style={r.paid ? { background: 'rgba(6,214,160,.15)', color: '#0a7c5d' } : { background: 'rgba(255,209,102,.2)', color: '#7a5c00' }}>
                        {r.paid ? '✓ pagado' : (r.amount_cents != null ? `$${(r.amount_cents / 100).toFixed(0)} pend.` : 'pendiente')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {board === null ? <p className="text-sm text-gray-400 text-center py-8">Cargando clases…</p>
              : <DeskBoard token={token} classes={(board?.classes ?? []) as any} />}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-[9px] text-gray-400" style={F_M}>⚠ Incidentes · últimos 14 días</p>
              {incidents === null ? <p className="text-[12px] text-gray-400 mt-2">Cargando…</p>
                : incidents.length === 0 ? <p className="text-[12px] mt-2" style={{ color: '#0a7c5d' }}>Sin incidentes. 🤙</p>
                : incidents.map((i: any) => (
                  <div key={i.id} className="mt-2.5 pl-3 border-l-2" style={{ borderColor: CORAL }}>
                    <p className="text-[12px] font-bold" style={{ color: INK }}>{i.incident_type}{i.student_name ? ` · ${i.student_name}` : ''}</p>
                    <p className="text-[11px] text-gray-500 leading-snug">{i.description}{i.action_taken ? ` — ${i.action_taken}` : ''}</p>
                    <p className="text-[10px] text-gray-400">{(i.created_at ?? '').slice(0, 10)}{i.coach ? ` · ${i.coach}` : ''}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {tab === 'clientes' && (
          <div className="space-y-3">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, email o teléfono…"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white shadow-sm" />
            {results !== null ? (
              results.length === 0
                ? <p className="text-[12px] text-gray-400 text-center py-4">Sin resultados para “{q}”.</p>
                : results.map((r) => <StudentCard key={r.id} token={token} row={r} />)
            ) : (
              <>
                <p className="text-[9px] text-gray-400 pt-1" style={F_M}>🔔 Necesitan atención · próximos 14 días</p>
                {attention === null ? <p className="text-[12px] text-gray-400">Cargando…</p>
                  : attention.length === 0 ? <p className="text-[12px] py-3" style={{ color: '#0a7c5d' }}>Todos los inscritos tienen sus fichas completas. 🤙</p>
                  : attention.map((r) => <StudentCard key={r.id} token={token} row={r} />)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
