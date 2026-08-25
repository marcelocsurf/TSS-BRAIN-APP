'use client';

import { useEffect, useState } from 'react';
import { DeskBoard } from '@/app/front-desk/[token]/DeskBoard';
import { PortalSpaces } from '@/components/coach-portal/PortalSpaces';
import { BoardInventoryManager } from '@/components/board-inventory/BoardInventoryManager';
import { BoardSelectorLauncher } from '@/components/board-selector/BoardSelectorLauncher';
import { CoachTasks } from '@/components/coach-portal/CoachTasks';
import { getFrontDeskData, getRecentBookings, deskSetRoom } from '@/lib/actions/front-desk';
import { SeatContactPanel } from '@/components/shared/SeatContactPanel';
import { suggestCorrectedEmail } from '@/lib/utils/email-typo';
import {
  hostSearchStudents, hostAttentionList, hostStudentDetail,
  hostRecentIncidents, hostSendIntakeEmail, hostDayOperation,
  hostAdhocTemplates, hostCreateAdhocClass,
  hostPortalFlags, hostDayAlerts, hostCoachOptions, hostAssignCoach,
  hostRescheduleClass, hostCancelClass,
  hostSetTransport, hostConfirmRenewal, hostGrantRenewal,
  hostTransportBoard, hostTransportNotices,
  type HostStudentRow, type HostDayEvent, type HostDayAlerts, type TransportBoardRow,
} from '@/lib/actions/host-portal';
import { HostGuide } from '@/components/host/HostGuide';
import { CopyTextButton } from '@/components/dashboard/CopyTextButton';
import { sellerSearchStudents, sellerReserveSpot } from '@/lib/actions/seller';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

// ═══ PORTAL DEL HOST — "Servicio al cliente" (Brand Manual v10) ═══
// HOY: check-in y cobro del mostrador + incidentes recientes.
// VENDER: el tablero completo del vendedor (calendario, videos, decks, ventas).
// CLIENTES: buscador + semáforo de fichas + bitácora resumida + enviar links.

const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0', CORAL = '#FF6B6B';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em' };

type Tab = 'hoy' | 'operacion' | 'transporte' | 'espacios' | 'tablas' | 'clientes';

// Cinta legible + nivel entre paréntesis mientras el equipo aprende los
// colores (pedido de Rick): "Purple Belt (Emerging)" en vez de "purple_belt".
// Derivado de la fuente única (belts.ts) para no divergir.
const beltPretty = (b: string) => {
  const d = BELT_DISPLAY[b as BeltLevel];
  return d ? `${d.en} (${d.levelName})` : `Cinta ${b}`;
};

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
      style={ok ? { background: 'rgba(6,214,160,.18)', color: '#0a7c5d' } : { background: 'rgba(255,107,107,.15)', color: '#c04545' }}>
      {ok ? '✓' : '✗'} {label}
    </span>
  );
}

function StudentCard({ token, row, canCoordinate = false }: { token: string; row: HostStudentRow; canCoordinate?: boolean }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  // Renovación de membresía en mostrador (host cubre coordinador).
  const [renewMonths, setRenewMonths] = useState<number | null>(null);
  const [renewBusy, setRenewBusy] = useState(false);
  const complete = row.waiver && row.intake && row.quiz;

  const doRenew = async (mode: 'confirm' | 'grant', method: string) => {
    setRenewBusy(true);
    const r = mode === 'confirm'
      ? await hostConfirmRenewal(token, row.id, method)
      : await hostGrantRenewal(token, row.id, renewMonths ?? 6, method);
    setRenewBusy(false);
    if (!r.ok) { setMsg(r.error ?? 'No se pudo renovar.'); return; }
    setMsg('✓ Membresía renovada — el portal del alumno ya está activo.');
    setRenewMonths(null);
    setDetail(null); // re-fetch para ver la membresía nueva
  };

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
            <p className="text-[11px] text-gray-400 truncate">{row.belt ? beltPretty(row.belt) : 'Sin cinta'}{row.email ? ` · ${row.email}` : ''}</p>
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
          {/* Link del intake SIEMPRE disponible (pedido de Cony): aunque la
              ficha esté completa, sirve para pedir datos que faltan o corregir. */}
          <div className="flex gap-2">
            <button type="button" onClick={async () => { setMsg('Enviando…'); const r = await hostSendIntakeEmail(token, row.id); setMsg(r.ok ? '📧 Email enviado ✓' : (r.error ?? 'No se pudo enviar')); }}
              className="flex-1 rounded-full py-2 text-[9px]" style={{ ...F_M, background: complete ? '#f3f4f6' : CYAN, color: complete ? '#6b7280' : INK }}>
              📧 {complete ? 'Reenviar ficha' : 'Enviar por email'}
            </button>
            <button type="button" onClick={() => copy(row.intake_url, 'intake')}
              className="flex-1 rounded-full py-2 text-[9px]" style={{ ...F_M, background: complete ? '#f3f4f6' : GREEN, color: complete ? '#6b7280' : INK }}>
              📋 Copiar link de ficha
            </button>
          </div>
          <button type="button" onClick={() => copy(row.portal_url, 'portal')}
            className="w-full rounded-full py-2 text-[9px] border" style={{ ...F_M, color: INK, borderColor: '#e5e7eb' }}>🔗 Copiar link del portal del alumno</button>

          {/* Encuesta pendiente: antes SOLO salía por correo, así que con un
              correo dudoso (o sin correo) se perdía y nadie podía recuperarla
              — reporte de Cony 2026-08-11. Ahora se manda por WhatsApp. */}
          {detail?.pendingSurvey && (
            <div className="rounded-xl p-2.5 space-y-1.5" style={{ background: 'rgba(255,209,102,.18)', border: '1px solid rgba(255,209,102,.5)' }}>
              <p className="text-[11px] font-bold" style={{ color: '#7a5c00' }}>
                📝 Encuesta sin responder · clase del {new Date(detail.pendingSurvey.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', timeZone: 'America/El_Salvador' })}
              </p>
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => copy(`${window.location.origin}/feedback/${detail.pendingSurvey.token}`, 'encuesta')}
                  className="flex-1 rounded-full py-2 text-[9px]" style={{ ...F_M, background: GOLD, color: INK, fontWeight: 700 }}>
                  📋 Copiar link
                </button>
                {row.phone && (
                  <a href={`https://wa.me/${String(row.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${(row.name ?? '').split(' ')[0]}! Thanks for training with us 🤙 Here's a 1-minute survey about your session: ${typeof window !== 'undefined' ? window.location.origin : ''}/feedback/${detail.pendingSurvey.token}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 rounded-full py-2 text-[9px] text-center" style={{ ...F_M, background: GREEN, color: INK, fontWeight: 700 }}>
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
          {/* Experiencia del camp sin responder — mismo patrón de rescate. */}
          {detail?.pendingExperience && (
            <div className="rounded-xl p-2.5 space-y-1.5" style={{ background: 'rgba(0,210,255,.10)', border: '1px solid rgba(0,168,204,.4)' }}>
              <p className="text-[11px] font-bold" style={{ color: '#00607a' }}>
                🏄 Experiencia del camp sin responder{detail.pendingExperience.campName ? ` · ${detail.pendingExperience.campName}` : ''}
              </p>
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => copy(`${window.location.origin}/experience/${detail.pendingExperience.token}`, 'experiencia')}
                  className="flex-1 rounded-full py-2 text-[9px]" style={{ ...F_M, background: GOLD, color: INK, fontWeight: 700 }}>
                  📋 Copiar link
                </button>
                {row.phone && (
                  <a href={`https://wa.me/${String(row.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${(row.name ?? '').split(' ')[0]}! How was your camp with us? 🤙 1-minute survey about the overall experience: ${typeof window !== 'undefined' ? window.location.origin : ''}/experience/${detail.pendingExperience.token}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 rounded-full py-2 text-[9px] text-center" style={{ ...F_M, background: GREEN, color: INK, fontWeight: 700 }}>
                    💬 WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
          {msg && <p className="text-[11px] font-semibold" style={{ color: '#0090B0' }}>{msg}</p>}
          {detail ? (
            <div className="space-y-2">
              {detail.membership && (
                <p className="text-[11px]" style={{ color: detail.membership.active ? '#0a7c5d' : '#c04545' }}>
                  {detail.membership.active ? `Membresía activa · vence en ${detail.membership.days_left} días` : 'Membresía vencida o sin membresía'}
                  {detail.membership.pending_request ? ' · renovación pedida' : ''}
                </p>
              )}

              {/* Renovación en mostrador (host cubre coordinador, 2026-08-09).
                  Con solicitud pendiente → confirmarla; sin membresía activa →
                  renovar directo 1/6/12 meses a precio de lista. */}
              {canCoordinate && detail.membership?.pending_request && (
                <div className="rounded-xl p-2.5" style={{ background: 'rgba(6,214,160,.08)', border: '1px solid rgba(6,214,160,.35)' }}>
                  <p className="text-[8px] mb-1.5" style={{ ...F_M, color: '#0a7c5d' }}>Confirmar renovación pedida · método de pago</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(['cash', 'card', 'transfer'] as const).map((m) => (
                      <button key={m} type="button" disabled={renewBusy} onClick={() => doRenew('confirm', m)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#061C2B] text-white disabled:opacity-50 capitalize">
                        {m === 'cash' ? '💵 Cash' : m === 'card' ? '💳 Card' : '🏦 Transfer'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {canCoordinate && detail.membership && !detail.membership.active && !detail.membership.pending_request && (
                <div className="rounded-xl p-2.5" style={{ background: '#F7F9FA' }}>
                  <p className="text-[8px] mb-1.5" style={{ ...F_M, color: '#8a6d1c' }}>Renovar membresía en mostrador</p>
                  <div className="flex flex-wrap gap-1.5">
                    {([[1, '9.99'], [6, '49.99'], [12, '99.90']] as const).map(([m, p]) => (
                      <button key={m} type="button" disabled={renewBusy} onClick={() => setRenewMonths(renewMonths === m ? null : m)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold border disabled:opacity-50"
                        style={renewMonths === m
                          ? { background: '#061C2B', color: '#fff', borderColor: '#061C2B' }
                          : { background: '#fff', color: '#061C2B', borderColor: '#e5e7eb' }}>
                        {m}m · ${p}
                      </button>
                    ))}
                  </div>
                  {renewMonths != null && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {(['cash', 'card', 'transfer'] as const).map((m) => (
                        <button key={m} type="button" disabled={renewBusy} onClick={() => doRenew('grant', m)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold disabled:opacity-50 capitalize"
                          style={{ background: '#00D2FF', color: '#061C2B' }}>
                          {m === 'cash' ? '💵 Cash' : m === 'card' ? '💳 Card' : '🏦 Transfer'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                    <div key={i} className="mb-1">
                      <p className="text-[11px] text-gray-600 leading-snug">
                        {(r.created_at ?? '').slice(0, 10)} — {r.coach_feedback || r.status || 'sesión registrada'}
                      </p>
                      {/* El seguimiento es lo que el equipo necesita ver: qué
                          debe trabajar el alumno la próxima (pedido 2026-08-09). */}
                      {r.whats_next && (
                        <p className="text-[11px] leading-snug pl-3" style={{ color: '#0090B0' }}>
                          🎯 Próximo: {r.whats_next}
                        </p>
                      )}
                    </div>
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
              {/* Contacto & datos — lo que el mostrador necesita a diario
                  (pedido de Cony): correo, WhatsApp, cumpleaños, talla, medidas. */}
              <div className="space-y-0.5 rounded-xl bg-gray-50 p-2.5">
                <p className="text-[9px] text-gray-400" style={F_M}>Contacto & datos</p>
                {row.email && <p className="text-[11px] text-gray-700">📧 {row.email}</p>}
                {row.phone && (
                  <p className="text-[11px] text-gray-700">
                    💬 <a href={`https://wa.me/${String(row.phone).replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="underline decoration-dotted" style={{ color: '#0090B0' }}>{row.phone}</a>
                    <span className="text-gray-400"> · WhatsApp</span>
                  </p>
                )}
                {detail.instagram && <p className="text-[11px] text-gray-700">📸 @{String(detail.instagram).replace(/^@/, '')}</p>}
                {detail.dob && <p className="text-[11px] text-gray-700">🎂 {detail.dob}{detail.age ? ` · ${detail.age} años` : ''}</p>}
                {(detail.shirt || detail.height || detail.weight) && (
                  <p className="text-[11px] text-gray-700">
                    {[detail.shirt ? `👕 Talla ${detail.shirt}` : null, detail.height ? `📏 ${detail.height}` : null, detail.weight ? `⚖️ ${detail.weight}` : null].filter(Boolean).join(' · ')}
                  </p>
                )}
                {detail.languages && <p className="text-[11px] text-gray-700">🗣 {detail.languages}</p>}
                {!row.email && !row.phone && !detail.dob && !detail.shirt && (
                  <p className="text-[11px] text-gray-400">Sin datos aún — mandale el link de ficha ↑</p>
                )}
              </div>
              {(detail.goals || detail.fears || detail.experience || detail.board) && (
                <div className="space-y-0.5">
                  <p className="text-[9px] text-gray-400" style={F_M}>Perfil surf</p>
                  {(detail.experience || detail.frequency || detail.self_level) && (
                    <p className="text-[11px] text-gray-600">🏄 {[detail.experience, detail.frequency ? detail.frequency.split(' / ')[0] : null, detail.self_level].filter(Boolean).join(' · ')}</p>
                  )}
                  {(detail.board || detail.stance || detail.wave_size) && (
                    <p className="text-[11px] text-gray-600">🛹 {[detail.board, detail.stance, detail.wave_size ? `ola ${detail.wave_size.split(' - ')[0]}` : null].filter(Boolean).join(' · ')}</p>
                  )}
                  {detail.goals && <p className="text-[11px] text-gray-600">🎯 Metas: {detail.goals}</p>}
                  {detail.goal_mid && <p className="text-[11px] text-gray-500 pl-4">3-6 meses: {detail.goal_mid}</p>}
                  {detail.goal_long && <p className="text-[11px] text-gray-500 pl-4">1-3 años: {detail.goal_long}</p>}
                  {detail.week_wish && <p className="text-[11px] text-gray-600">⭐ Esta semana: {detail.week_wish}</p>}
                  {detail.barrier && <p className="text-[11px] text-gray-600">🧱 Barrera: {detail.barrier}</p>}
                  {detail.fears && <p className="text-[11px] text-gray-600">😰 Miedos: {detail.fears}</p>}
                  {detail.injuries && <p className="text-[11px] text-gray-600">🩹 Lesiones: {detail.injuries}</p>}
                  {detail.allergies && <p className="text-[11px] text-gray-600">⚠ Alergias: {detail.allergies}</p>}
                  {detail.emergency && <p className="text-[11px] text-gray-600">🆘 Emergencia: {detail.emergency}</p>}
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

export function HostPortal({ token, hostName, services, hostId, academyId }: { token: string; hostName: string; services: any[]; hostId?: string; academyId?: string }) {
  const [tab, setTab] = useState<Tab>('hoy');
  const [board, setBoard] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[] | null>(null);
  const [recent, setRecent] = useState<any[] | null>(null);
  const [attention, setAttention] = useState<HostStudentRow[] | null>(null);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<HostStudentRow[] | null>(null);
  // Operación: línea de tiempo del día seleccionado
  const [opDate, setOpDate] = useState(() => new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10));
  // Inicio de la tira visible — navegable semana a semana por TODO el año
  const [stripStart, setStripStart] = useState(() => new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10));
  const shiftStrip = (days: number) => {
    const d = new Date(stripStart + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const iso = d.toISOString().slice(0, 10);
    setStripStart(iso);
  };
  const [opEvents, setOpEvents] = useState<HostDayEvent[] | null>(null);
  const [reserveFor, setReserveFor] = useState<HostDayEvent | null>(null);
  // Clase fuera de horario (pedido de Rick): plantilla + hora en el día visto
  const [adhocOpen, setAdhocOpen] = useState(false);
  const [adhocTpls, setAdhocTpls] = useState<any[] | null>(null);
  const [adhocTpl, setAdhocTpl] = useState('');
  const [adhocTime, setAdhocTime] = useState('16:00');
  const [adhocMsg, setAdhocMsg] = useState<string | null>(null);
  const [adhocBusy, setAdhocBusy] = useState(false);
  // Modo cobertura + semáforo del día + guía de uso
  const [canCoordinate, setCanCoordinate] = useState(false);
  const [alerts, setAlerts] = useState<HostDayAlerts | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  const [academySlug, setAcademySlug] = useState<string | null>(null);
  useEffect(() => { hostPortalFlags(token).then((f) => { setCanCoordinate(f.canCoordinate); setAcademySlug(f.academySlug); }).catch(() => {}); }, [token]);
  useEffect(() => { hostDayAlerts(token).then(setAlerts).catch(() => {}); }, [token]);
  useEffect(() => {
    // Primera visita: la guía se abre sola; después queda en el botón 📖.
    try { if (!localStorage.getItem('tss_host_guide_v1')) setGuideOpen(true); } catch {}
  }, []);
  const closeGuide = () => { setGuideOpen(false); try { localStorage.setItem('tss_host_guide_v1', '1'); } catch {} };

  useEffect(() => { getFrontDeskData(token).then(setBoard).catch(() => setBoard({ classes: [] })); }, [token]);
  useEffect(() => { if (tab === 'hoy' && incidents === null) hostRecentIncidents(token).then(setIncidents).catch(() => setIncidents([])); }, [tab, incidents, token]);
  useEffect(() => { if (tab === 'hoy' && recent === null) getRecentBookings(token).then(setRecent).catch(() => setRecent([])); }, [tab, recent, token]);
  useEffect(() => { if (tab === 'clientes' && attention === null) hostAttentionList(token).then(setAttention).catch(() => setAttention([])); }, [tab, attention, token]);

  useEffect(() => {
    if (tab !== 'operacion') return;
    setOpEvents(null);
    hostDayOperation(token, opDate).then(setOpEvents).catch(() => setOpEvents([]));
  }, [tab, opDate, token]);

  useEffect(() => {
    if (!q.trim()) { setResults(null); return; }
    const t = setTimeout(() => hostSearchStudents(token, q).then(setResults).catch(() => setResults([])), 350);
    return () => clearTimeout(t);
  }, [q, token]);

  return (
    <div style={{ background: PAPER, minHeight: '100vh' }} className="pb-10">
      <div className="px-4 pt-5 pb-4" style={{ background: INK }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p style={{ ...F_M, color: CYAN }} className="text-[9px]">The Surf Sequence · Servicio al cliente</p>
            <h1 style={{ ...F_D, color: PAPER }} className="text-[24px] mt-1">{hostName}</h1>
          </div>
          <button type="button" onClick={() => setGuideOpen(true)}
            className="shrink-0 rounded-full px-3 py-2 text-[9px]" style={{ ...F_M, background: 'rgba(247,249,250,.1)', color: CYAN }}>
            📖 Guía
          </button>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {([['hoy', '📋 Hoy'], ['operacion', '🗓 Agenda'], ['transporte', '🚐 Transporte'], ['espacios', '🏛 Espacios'], ['tablas', '🏄 Tablas'], ['clientes', '👥 Clientes']] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              className="flex-1 shrink-0 whitespace-nowrap rounded-full py-2.5 px-3 text-[9px]"
              style={{ ...F_M, background: tab === id ? CYAN : 'rgba(247,249,250,.08)', color: tab === id ? INK : 'rgba(247,249,250,.7)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md lg:max-w-3xl mx-auto px-4 pt-4">
        {tab === 'hoy' && (
          <div className="space-y-4">
            {/* Qué es esta pestaña. La confusión #1 del host es buscar en HOY
                una clase que todavía no entra en la ventana de 7 días. */}
            <p className="text-[10.5px] text-gray-400 leading-snug">
              <strong style={{ color: '#0090B0' }}>Hoy = atender y cobrar.</strong> Solo lo que llega en los próximos 7 días.
              ¿Buscás una clase más adelante? Está en <button type="button" onClick={() => setTab('operacion')} className="underline decoration-dotted" style={{ color: '#0090B0' }}>🗓 Agenda</button>.
            </p>
            {/* Semáforo del día: los incendios de coordinación, a la vista */}
            {alerts && (
              (alerts.no_coach.length || alerts.pending_coach.length || alerts.unclosed.length || alerts.overcap.length) ? (
                <div className="rounded-2xl p-3.5 space-y-1.5" style={{ background: 'rgba(255,209,102,.16)', border: '1px solid rgba(255,209,102,.5)' }}>
                  <p className="text-[9px]" style={{ ...F_M, color: '#7a5c00' }}>🚦 Semáforo del día</p>
                  {alerts.no_coach.length > 0 && (
                    <p className="text-[12px] font-bold" style={{ color: '#c04545' }}>
                      ⚠ Sin coach hoy: {alerts.no_coach.join(', ')}{canCoordinate ? ' — asignalo en AGENDA' : ' — avisale a coordinación'}
                    </p>
                  )}
                  {alerts.pending_coach.length > 0 && (
                    <p className="text-[12px]" style={{ color: '#7a5c00' }}>⏳ Coach por confirmar: {alerts.pending_coach.join(', ')}</p>
                  )}
                  {alerts.overcap.length > 0 && (
                    <p className="text-[12px]" style={{ color: '#7a5c00' }}>📈 Sobrecupo: {alerts.overcap.join(' · ')}</p>
                  )}
                  {alerts.unclosed.length > 0 && (
                    <p className="text-[12px]" style={{ color: '#7a5c00' }}>
                      🔒 {alerts.unclosed.length} {alerts.unclosed.length === 1 ? 'sesión' : 'sesiones'} sin cierre: {alerts.unclosed.slice(0, 3).map((u) => `${u.service} ${u.date.slice(5)}${u.coach ? ` (${u.coach})` : ''}`).join(' · ')}{alerts.unclosed.length > 3 ? ` +${alerts.unclosed.length - 3} más` : ''}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] font-semibold rounded-2xl px-3.5 py-2.5" style={{ background: 'rgba(6,214,160,.1)', color: '#0a7c5d' }}>
                  🚦 Día en orden — servicios con coach y cierres al día. 🤙
                </p>
              )
            )}
            {/* Tareas que el coordinador le asignó — con reporte hecho/no hecho */}
            <CoachTasks token={token} />
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
              : <DeskBoard token={token} classes={(board?.classes ?? []) as any}
                  onChanged={() => {
                    // El HOY se carga client-side, así que tras cobrar/mover/
                    // cancelar re-consultamos el board y los "reservados hoy".
                    getFrontDeskData(token).then(setBoard).catch(() => {});
                    setRecent(null);
                  }} />}
            {/* Protocolo oficial cuando algo sale mal — referencia de un toque */}
            <a href="/docs/sistema-resolver-problemas.pdf" target="_blank" rel="noopener noreferrer"
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
              <span className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-bold" style={{ color: INK }}>🧭 Protocolo de resolución de problemas</span>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600" style={F_M}>PDF</span>
              </span>
            </a>
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

        {tab === 'operacion' && (
          <div className="space-y-3">
            <p className="text-[10.5px] text-gray-400 leading-snug">
              <strong style={{ color: '#0090B0' }}>Agenda = ver y planear.</strong> Cualquier día del año. Tocá un alumno para ver sus datos; el cobro se hace en 📋 Hoy.
            </p>
            {/* Calendario de todo el año: flechas por semana + salto a cualquier fecha */}
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => shiftStrip(-7)} className="rounded-full w-9 h-9 bg-white border border-gray-200 text-gray-500 font-bold">‹</button>
              <p className="text-[10px]" style={{ ...F_M, color: '#6b7280' }}>
                {new Date(stripStart + 'T00:00:00').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </p>
              <label className="rounded-full px-3 h-9 bg-white border border-gray-200 text-[11px] text-gray-500 inline-flex items-center gap-1 cursor-pointer">
                📅 Ir a
                <input type="date" value={opDate}
                  onChange={(e) => { if (e.target.value) { setOpDate(e.target.value); setStripStart(e.target.value); } }}
                  className="w-0 opacity-0 absolute" style={{ pointerEvents: 'none' }}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} />
              </label>
              <button type="button" onClick={() => shiftStrip(7)} className="rounded-full w-9 h-9 bg-white border border-gray-200 text-gray-500 font-bold">›</button>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(stripStart + 'T00:00:00');
                d.setDate(d.getDate() + i);
                const iso = d.toISOString().slice(0, 10);
                const sel = iso === opDate;
                const isToday = iso === new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
                return (
                  <button key={iso} type="button" onClick={() => setOpDate(iso)}
                    className="shrink-0 rounded-2xl px-3 py-2 text-center"
                    style={sel ? { background: CYAN, color: INK } : { background: '#fff', border: isToday ? `2px solid ${CYAN}` : '1px solid #e5e7eb', color: '#6b7280' }}>
                    <span className="block text-[8px]" style={F_M}>{d.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                    <span className="block text-[15px] font-bold">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            {opEvents === null ? <p className="text-[12px] text-gray-400 text-center py-8">Cargando el día…</p>
              : opEvents.length === 0 ? <p className="text-[12px] text-gray-400 text-center py-8">Nada programado este día.</p>
              : opEvents.map((e) => (
                <OpEventCard key={e.camp_id} token={token} e={e} canCoordinate={canCoordinate} academySlug={academySlug}
                  onReserve={() => setReserveFor(e)}
                  onChanged={() => { hostDayOperation(token, opDate).then(setOpEvents).catch(() => {}); hostDayAlerts(token).then(setAlerts).catch(() => {}); }} />
              ))}

            {/* Clase FUERA de horario (pedido de Rick): plantilla + hora en el
                día seleccionado; avisa a coordinación para asignar coach. */}
            {!adhocOpen ? (
              <button type="button"
                onClick={() => { setAdhocOpen(true); setAdhocMsg(null); if (adhocTpls === null) hostAdhocTemplates(token).then((t) => { setAdhocTpls(t); if (t[0]) setAdhocTpl(t[0].id); }).catch(() => setAdhocTpls([])); }}
                className="w-full rounded-full py-3 text-[9px] border-2 border-dashed" style={{ ...F_M, borderColor: '#00D2FF', color: '#0090B0', background: '#fff' }}>
                + Clase en otro horario ({new Date(opDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })})
              </button>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
                <p className="text-[9px] text-gray-400" style={F_M}>Nueva clase · {new Date(opDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                {adhocTpls === null ? <p className="text-[12px] text-gray-400">Cargando plantillas…</p> : (
                  <>
                    <select value={adhocTpl} onChange={(ev) => setAdhocTpl(ev.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                      {adhocTpls.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.template_name}{t.list_price_cents != null ? ` — $${(t.list_price_cents / 100).toFixed(0)}` : ''}</option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <input type="time" value={adhocTime} onChange={(ev) => setAdhocTime(ev.target.value)}
                        className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white" />
                      <button type="button" disabled={adhocBusy || !adhocTpl}
                        onClick={async () => {
                          setAdhocBusy(true); setAdhocMsg(null);
                          const r = await hostCreateAdhocClass(token, { templateId: adhocTpl, dateISO: opDate, time: adhocTime });
                          setAdhocBusy(false);
                          if (!r.ok) { setAdhocMsg(r.error ?? 'No se pudo crear.'); return; }
                          setAdhocMsg(`✓ ${r.name} creada — reservale al cliente acá abajo.`);
                          setAdhocOpen(false);
                          hostDayOperation(token, opDate).then(setOpEvents).catch(() => {});
                        }}
                        className="rounded-full px-5 py-2.5 text-[10px] disabled:opacity-40" style={{ ...F_M, background: '#00D2FF', color: INK, fontWeight: 700 }}>
                        {adhocBusy ? 'Creando…' : 'Crear'}
                      </button>
                      <button type="button" onClick={() => setAdhocOpen(false)} className="px-3 py-2.5 text-[11px] text-gray-400">Cancelar</button>
                    </div>
                    <p className="text-[10px] text-gray-400">Se avisa a coordinación para asignarle coach. El cobro, como siempre, en recepción.</p>
                  </>
                )}
                {adhocMsg && <p className="text-[11px] font-semibold" style={{ color: adhocMsg.startsWith('✓') ? '#0a7c5d' : '#c04545' }}>{adhocMsg}</p>}
              </div>
            )}
            {adhocMsg && !adhocOpen && <p className="text-[11px] font-semibold text-center" style={{ color: '#0a7c5d' }}>{adhocMsg}</p>}
          </div>
        )}

        {tab === 'tablas' && (
          <div className="space-y-4">
            {/* Calculadora de tabla ideal (volumen, tipo, medidas, quillas) */}
            <BoardSelectorLauncher variant="card" title="Calculadora de tablas" subtitle="Recomienda volumen, tipo, medidas y quillas según la persona." />
            {/* Sistema de renta: inventario + rentas con waiver y firma */}
            {academyId
              ? (
                <div className="rounded-2xl p-4" style={{ background: INK }}>
                  <BoardInventoryManager academyId={academyId} portalToken={token} />
                </div>
              )
              : <p className="text-[12px] text-gray-400 text-center py-6">Sin academia asignada.</p>}
          </div>
        )}

        {tab === 'transporte' && (
          <TransporteTab token={token} canCoordinate={canCoordinate} />
        )}

        {tab === 'espacios' && (
          /* El MISMO tablero de espacios de coaches/coordinadores — quién usa
             qué sala/lugar y cuándo (yoga deck, BJJ, gym, ice bath, skate). */
          <PortalSpaces token={token} coachId={hostId ?? ''} />
        )}

        {tab === 'clientes' && (
          <div className="space-y-3">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre, email o teléfono…"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white shadow-sm" />
            {results !== null ? (
              results.length === 0
                ? <p className="text-[12px] text-gray-400 text-center py-4">Sin resultados para “{q}”.</p>
                : results.map((r) => <StudentCard key={r.id} token={token} row={r} canCoordinate={canCoordinate} />)
            ) : (
              <>
                <p className="text-[9px] text-gray-400 pt-1" style={F_M}>🔔 Necesitan atención · próximos 14 días</p>
                {attention === null ? <p className="text-[12px] text-gray-400">Cargando…</p>
                  : attention.length === 0 ? <p className="text-[12px] py-3" style={{ color: '#0a7c5d' }}>Todos los inscritos tienen sus fichas completas. 🤙</p>
                  : attention.map((r) => <StudentCard key={r.id} token={token} row={r} canCoordinate={canCoordinate} />)}
              </>
            )}
          </div>
        )}
      </div>

      {reserveFor && (
        <ReserveModal token={token} event={reserveFor}
          onClose={() => setReserveFor(null)}
          onDone={() => { setReserveFor(null); hostDayOperation(token, opDate).then(setOpEvents).catch(() => {}); }} />
      )}
      {guideOpen && <HostGuide canCoordinate={canCoordinate} onClose={closeGuide} />}
    </div>
  );
}

// ── Tarjeta de un servicio en AGENDA + controles de MODO COBERTURA ──
// (asignar coach cuando falta, reprogramar o cancelar clases de un día).
function OpEventCard({ token, e, canCoordinate, academySlug, onReserve, onChanged }: {
  token: string; e: HostDayEvent; canCoordinate: boolean; academySlug?: string | null; onReserve: () => void; onChanged: () => void;
}) {
  // Link directo de reserva de ESTA clase (pedido de Cony): el cliente cae
  // en el QR con la clase ya elegida. Huéspedes de camp entran en $0 solos.
  const [linkMsg, setLinkMsg] = useState<string | null>(null);
  const shareLink = academySlug
    ? `${window.location.origin}/join/${academySlug}?class=${e.camp_id}`
    : null;
  const copyShare = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink)
      .then(() => setLinkMsg('🔗 Link copiado — pegalo en WhatsApp'))
      .catch(() => setLinkMsg(shareLink));
    setTimeout(() => setLinkMsg(null), 3500);
  };
  const spotsLeft = e.capacity > 0 ? e.capacity - e.enrolled : null;
  const unpaid = e.students.filter((s) => !s.paid).length;
  const noWaiver = e.students.filter((s) => !s.waiver).length;
  const [assignOpen, setAssignOpen] = useState(false);
  const [coachOpts, setCoachOpts] = useState<any[] | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [mvDate, setMvDate] = useState('');
  const [mvTime, setMvTime] = useState(e.time ? e.time.slice(0, 5) : '16:00');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  // Transporte editable (host cubre coordinador): horarios + "salió".
  const [trEdit, setTrEdit] = useState(false);
  const [trDep, setTrDep] = useState(e.transport?.depart?.slice(0, 5) ?? '');
  const [trRet, setTrRet] = useState(e.transport?.ret?.slice(0, 5) ?? '');
  // Ficha de contacto del alumno abierta (participant_id).
  const [openStudent, setOpenStudent] = useState<string | null>(null);

  const singleDayClass = e.total_days === 1 && ['class', 'surf_lesson', 'trip'].includes(e.kind ?? '');
  const coachPending = !!e.coach && e.coach_status === 'pending';
  const needsCoach = !e.coach || coachPending;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px]" style={{ ...F_M, color: '#0090B0' }}>
            {e.time ? e.time.slice(0, 5) : 'Sin hora'}{e.day_number ? ` · Día ${e.day_number} de ${e.total_days}` : ''}{e.session_status ? ` · ${e.session_status}` : ''}
          </p>
          <p className="font-bold text-[15px] truncate" style={{ color: INK }}>{e.name}</p>
          <p className="text-[11px] text-gray-400 truncate">
            {e.coach ? `Coach ${e.coach}${coachPending ? ' · por confirmar ⏳' : ''}` : 'Sin coach asignado ⚠'}{e.venue ? ` · 📍 ${e.venue}` : ''}
          </p>
        </div>
        <span className="shrink-0 flex flex-col items-end gap-1">
          {e.price_cents != null && (
            <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: 'rgba(255,209,102,.25)', color: '#7a5c00' }}>${(e.price_cents / 100).toFixed(0)}</span>
          )}
          <span className="text-[10px] font-bold rounded-full px-2 py-1"
            style={{ background: 'rgba(0,210,255,.1)', color: '#0090B0' }}>{e.enrolled}/{e.capacity || '∞'}</span>
        </span>
      </div>

      {(e.time || e.transport || e.spaces.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {/* Hora de ENCUENTRO explícita (pedido de Rick/Kat 2026-08-23):
              el número del header nadie lo leía como "a qué hora cito al
              cliente" — servicio al cliente necesita la etiqueta. Es la hora
              de clase que el coach fija en su Vista Semana. */}
          {e.time && (
            <span className="text-[10px] px-2 py-1 rounded-full font-bold"
              style={{ background: 'rgba(0,210,255,.12)', color: '#006C8C' }}>
              🕐 Encuentro {e.time.slice(0, 5)}{e.venue ? ` · ${e.venue}` : ''}
            </span>
          )}
          {e.transport && (
            <button type="button"
              onClick={() => canCoordinate && e.transport?.plan_id && setTrEdit((v) => !v)}
              className="text-[10px] px-2 py-1 rounded-full"
              style={{ background: e.transport.status === 'taken' ? 'rgba(6,214,160,.15)' : 'rgba(255,209,102,.18)', color: e.transport.status === 'taken' ? '#0a7c5d' : '#7a5c00' }}>
              🚐 Sale {e.transport.depart?.slice(0, 5) ?? '—'} · vuelve {e.transport.ret?.slice(0, 5) ?? '—'}
              {e.transport.status === 'taken' ? ' · salió ✓' : e.transport.status ? ` · ${e.transport.status}` : ''}
              {canCoordinate && e.transport.plan_id ? ' ✎' : ''}
            </button>
          )}
          {e.spaces.map((sp, i) => (
            <span key={i} className="text-[10px] px-2 py-1 rounded-full" style={{ background: 'rgba(6,214,160,.12)', color: '#0a7c5d' }}>🏛 {sp}</span>
          ))}
        </div>
      )}

      {/* Host cubre coordinador: ajustar horarios de la van / marcar que salió. */}
      {trEdit && e.transport?.plan_id && (
        <div className="mt-2 rounded-xl p-2.5 space-y-1.5" style={{ background: '#F7F9FA' }}>
          <p className="text-[8px] text-gray-400" style={F_M}>Transporte · ajustar (queda al instante)</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <label className="text-[10px] text-gray-500">Sale</label>
            <input type="time" value={trDep} onChange={(ev) => setTrDep(ev.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] bg-white" />
            <label className="text-[10px] text-gray-500">Vuelve</label>
            <input type="time" value={trRet} onChange={(ev) => setTrRet(ev.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded-lg text-[11px] bg-white" />
            <button type="button" disabled={busy}
              onClick={async () => {
                setBusy(true);
                const r = await hostSetTransport(token, e.transport!.plan_id!, { depart: trDep || null, ret: trRet || null });
                setBusy(false);
                if (!r.ok) { setMsg(r.error ?? 'No se pudo guardar.'); return; }
                setMsg('✓ Horarios de transporte actualizados.'); setTrEdit(false); onChanged?.();
              }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold disabled:opacity-50"
              style={{ background: '#061C2B', color: '#fff' }}>
              Guardar
            </button>
            <button type="button" disabled={busy}
              onClick={async () => {
                setBusy(true);
                const r = await hostSetTransport(token, e.transport!.plan_id!, { status: 'taken' });
                setBusy(false);
                if (!r.ok) { setMsg(r.error ?? 'No se pudo confirmar.'); return; }
                setMsg('✓ Van marcada como salida.'); setTrEdit(false); onChanged?.();
              }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold border disabled:opacity-50"
              style={{ borderColor: '#06D6A0', color: '#0a7c5d', background: 'rgba(6,214,160,.08)' }}>
              🚐 Salió ✓
            </button>
          </div>
        </div>
      )}

      {e.students.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-50">
          <p className="text-[8px] text-gray-400 mb-1" style={F_M}>
            Alumnos{unpaid ? ` · ${unpaid} por cobrar` : ''}{noWaiver ? ` · ${noWaiver} sin waiver ⚠` : ''} · tocá un nombre para ver sus datos
          </p>
          {/* Cada alumno se abre en su ficha de contacto (mismo bloque que el
              mostrador). Acá NO se cobra: para cobrar está la pestaña Hoy. */}
          <div className="divide-y divide-gray-50">
            {e.students.map((s) => {
              const open = openStudent === s.participant_id;
              return (
                <div key={s.participant_id} className="py-1">
                  <button type="button"
                    onClick={() => setOpenStudent(open ? null : s.participant_id)}
                    className="w-full flex items-center justify-between gap-2 text-left py-1">
                    <span className="text-[12px] font-semibold truncate" style={{ color: INK }}>
                      {s.name}
                      {s.room_number ? <span className="text-gray-400 font-normal"> · 🏨 {s.room_number}</span> : ''}
                    </span>
                    <span className="shrink-0 text-[10px] text-gray-400">
                      {!s.paid ? '💰 ' : ''}{!s.waiver ? '⚠ ' : ''}{open ? '▴' : '▾'}
                    </span>
                  </button>
                  {open && (
                    <div className="pb-1.5">
                      <SeatContactPanel
                        seat={s}
                        canEditRoom={canCoordinate}
                        onSaveRoom={(room) => deskSetRoom(token, s.participant_id, room).then((r) => { if (r.ok) onChanged?.(); return r; })}
                      />
                      <p className="mt-1 text-[9.5px] text-gray-400 leading-snug">
                        {s.paid ? '✓ Pagado.' : '💰 Pendiente de cobro — se cobra en la pestaña Hoy.'}
                        {!s.waiver ? ' Falta waiver.' : ''}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cupo ∞ (capacity 0 = sin tope): sí se puede reservar, sin contador. */}
      {spotsLeft === null && (
        <button type="button" onClick={onReserve}
          className="mt-2.5 w-full rounded-full py-2.5 text-[9px]" style={{ ...F_M, background: GREEN, color: INK }}>
          + Reservar
        </button>
      )}
      {spotsLeft !== null && spotsLeft > 0 && (
        <button type="button" onClick={onReserve}
          className="mt-2.5 w-full rounded-full py-2.5 text-[9px]" style={{ ...F_M, background: GREEN, color: INK }}>
          + Reservar ({spotsLeft} libre{spotsLeft === 1 ? '' : 's'})
        </button>
      )}
      {shareLink && (
        <button type="button" onClick={copyShare}
          className="mt-1.5 w-full rounded-full py-2 text-[9px] border" style={{ ...F_M, borderColor: '#e5e7eb', color: '#0090B0', background: '#fff' }}>
          🔗 Copiar link de reserva (WhatsApp)
        </button>
      )}
      {linkMsg && <p className="mt-1 text-[10px] font-semibold text-center" style={{ color: '#0090B0' }}>{linkMsg}</p>}

      {/* LLENO: el cupo es sugerido — el host puede meter +1 en sobrecupo */}
      {spotsLeft !== null && spotsLeft <= 0 && (
        <button type="button" onClick={onReserve}
          className="mt-2.5 w-full rounded-full py-2.5 text-[9px] border-2" style={{ ...F_M, borderColor: GOLD, color: '#7a5c00', background: 'rgba(255,209,102,.12)' }}>
          + Sobrecupo (lleno {e.enrolled}/{e.capacity})
        </button>
      )}

      {/* MODO COBERTURA: asignar coach / reprogramar / cancelar */}
      {canCoordinate && (needsCoach || singleDayClass) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {needsCoach && (
            <button type="button" disabled={busy}
              onClick={() => { setAssignOpen(!assignOpen); setMoveOpen(false); if (coachOpts === null) hostCoachOptions(token).then(setCoachOpts).catch(() => setCoachOpts([])); }}
              className="flex-1 min-w-[130px] rounded-full py-2 text-[9px] border-2" style={{ ...F_M, borderColor: coachPending ? GOLD : CORAL, color: coachPending ? '#7a5c00' : '#c04545', background: '#fff' }}>
              {coachPending ? '↺ Cambiar coach' : '⚠ Asignar coach'}
            </button>
          )}
          {singleDayClass && (
            <>
              <button type="button" disabled={busy} onClick={() => { setMoveOpen(!moveOpen); setAssignOpen(false); setMsg(null); }}
                className="rounded-full px-3 py-2 text-[9px] border border-gray-200 text-gray-500" style={F_M}>🕐 Reprogramar</button>
              <button type="button" disabled={busy}
                onClick={async () => {
                  const warn = e.students.length ? ` OJO: tiene ${e.students.length} alumno(s) — el sistema te dirá a quién avisar.` : '';
                  if (!window.confirm(`¿Cancelar ${e.name}?${warn}`)) return;
                  setBusy(true); setMsg(null);
                  const r = await hostCancelClass(token, e.camp_id);
                  setBusy(false);
                  if (!r.ok) { setMsg(r.error ?? 'No se pudo cancelar.'); return; }
                  setMsg(r.students?.length ? `✓ Cancelada — avisales a: ${r.students.join(', ')}` : '✓ Clase cancelada.');
                  setTimeout(onChanged, 1600);
                }}
                className="rounded-full px-3 py-2 text-[9px] border border-gray-200 text-gray-400" style={F_M}>✕ Cancelar</button>
            </>
          )}
        </div>
      )}

      {assignOpen && (
        <div className="mt-2 rounded-xl bg-gray-50 p-2.5 space-y-1.5">
          <p className="text-[9px] text-gray-400" style={F_M}>Invitar coach — debe aceptar desde su portal</p>
          {coachOpts === null ? <p className="text-[11px] text-gray-400">Cargando coaches…</p>
            : coachOpts.length === 0 ? <p className="text-[11px] text-gray-400">No hay coaches activos.</p>
            : coachOpts.map((c: any) => (
              <button key={c.id} type="button" disabled={busy}
                onClick={async () => {
                  setBusy(true); setMsg(null);
                  const r = await hostAssignCoach(token, e.camp_id, c.id);
                  setBusy(false);
                  if (!r.ok) { setMsg(r.error ?? 'No se pudo asignar.'); return; }
                  setMsg(`✓ Invitación enviada a ${r.coachName ?? 'coach'} — le llega email y debe aceptar.`);
                  setAssignOpen(false);
                  setTimeout(onChanged, 1200);
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-white border border-gray-200 text-[12px] disabled:opacity-50" style={{ color: INK }}>
                <span className="font-bold">{c.display_name}</span>{c.certification_level ? <span className="text-gray-400 text-[10px]"> · {c.certification_level}</span> : null}
              </button>
            ))}
        </div>
      )}

      {moveOpen && (
        <div className="mt-2 rounded-xl bg-gray-50 p-2.5 space-y-1.5">
          <p className="text-[9px] text-gray-400" style={F_M}>Nueva fecha y hora</p>
          <div className="flex items-center gap-1.5">
            <input type="date" value={mvDate} onChange={(ev) => setMvDate(ev.target.value)} className="flex-1 px-2.5 py-2 border border-gray-200 rounded-xl text-sm bg-white" />
            <input type="time" value={mvTime} onChange={(ev) => setMvTime(ev.target.value)} className="px-2.5 py-2 border border-gray-200 rounded-xl text-sm bg-white" />
            <button type="button" disabled={busy || !mvDate || !mvTime}
              onClick={async () => {
                setBusy(true); setMsg(null);
                const r = await hostRescheduleClass(token, e.camp_id, { dateISO: mvDate, time: mvTime });
                setBusy(false);
                if (!r.ok) { setMsg(r.error ?? 'No se pudo mover.'); return; }
                setMsg(`✓ Movida: ${r.name}. Si tenía espacio reservado, reagendalo en ESPACIOS.`);
                setMoveOpen(false);
                setTimeout(onChanged, 1600);
              }}
              className="rounded-full px-4 py-2 text-[10px] disabled:opacity-40" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 700 }}>
              {busy ? 'Moviendo…' : 'Mover'}
            </button>
          </div>
        </div>
      )}

      {msg && <p className="mt-2 text-[11px] font-semibold" style={{ color: msg.startsWith('✓') ? '#0a7c5d' : '#c04545' }}>{msg}</p>}
    </div>
  );
}

// ── Reservar EN CONTEXTO: el host está viendo la clase, cliente enfrente,
// un toque — sin saltar al portal del vendedor. Mismo motor (sellerReserveSpot).
function ReserveModal({ token, event, onClose, onDone }: {
  token: string; event: HostDayEvent; onClose: () => void; onDone: () => void;
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [q, setQ] = useState('');
  const [found, setFound] = useState<{ id: string; name: string; email: string | null }[] | null>(null);
  const [nu, setNu] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Aviso de posible duplicado (2026-08-10): la deduplicación del sistema es
  // por CORREO, así que un nombre repetido con correo distinto —o mal
  // tipeado— crea una persona nueva y le parte el historial. Antes de crear,
  // le mostramos al mostrador quién ya existe con ese nombre.
  const [nameDupes, setNameDupes] = useState<{ id: string; name: string; email: string | null }[]>([]);
  const emailSuggestion = suggestCorrectedEmail(nu.email);

  useEffect(() => {
    if (mode !== 'existing' || q.trim().length < 2) { setFound(null); return; }
    const t = setTimeout(() => sellerSearchStudents(token, q).then(setFound).catch(() => setFound([])), 350);
    return () => clearTimeout(t);
  }, [q, mode, token]);

  useEffect(() => {
    const name = nu.firstName.trim();
    if (mode !== 'new' || name.length < 2) { setNameDupes([]); return; }
    const t = setTimeout(() => {
      sellerSearchStudents(token, name)
        .then((r) => {
          const last = nu.lastName.trim().toLowerCase();
          // Con apellido escrito, solo avisamos si TAMBIÉN coincide — así no
          // molestamos con cada "Maria" del sistema.
          setNameDupes(last ? r.filter((x) => x.name.toLowerCase().includes(last)) : r);
        })
        .catch(() => setNameDupes([]));
    }, 400);
    return () => clearTimeout(t);
  }, [nu.firstName, nu.lastName, mode, token]);

  const isFull = event.capacity > 0 && event.enrolled >= event.capacity;

  const reserve = async (input: any) => {
    setBusy(true); setMsg(null);
    const r = await sellerReserveSpot(token, event.camp_id, { ...input, allowOverbook: isFull });
    setBusy(false);
    if (!r.ok) { setMsg(r.error ?? 'No se pudo reservar.'); return; }
    const tail = (r as any).overbooked ? ' · entró como SOBRECUPO' : '';
    setMsg((r as any).included
      ? `✓ ${r.studentName ?? 'Cliente'} reservado — INCLUIDO en ${(r as any).includedIn ?? 'su camp'}, NO cobrar. 🎁${tail}`
      : `✓ ${r.studentName ?? 'Cliente'} reservado — cobrar en HOY cuando llegue.${tail}`);
    setTimeout(onDone, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3" style={{ background: 'rgba(6,28,43,.8)' }} onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[9px]" style={{ ...F_M, color: '#0090B0' }}>Reservar cupo</p>
            <p className="font-bold text-[15px]" style={{ color: INK }}>{event.name}{event.time ? ` · ${event.time.slice(0, 5)}` : ''}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[20px] leading-none text-gray-400 px-1">×</button>
        </div>

        {isFull && (
          <p className="text-[11px] font-bold rounded-xl px-3 py-2" style={{ background: 'rgba(255,209,102,.18)', color: '#7a5c00' }}>
            ⚠ Grupo lleno ({event.enrolled}/{event.capacity} — cupo sugerido). Esta reserva entra como SOBRECUPO.
          </p>
        )}
        <div className="flex gap-2">
          {([['existing', 'Cliente existente'], ['new', 'Cliente nuevo']] as const).map(([m, label]) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className="flex-1 rounded-full py-2 text-[9px]"
              style={{ ...F_M, background: mode === m ? INK : '#f3f4f6', color: mode === m ? CYAN : '#6b7280' }}>{label}</button>
          ))}
        </div>

        {mode === 'existing' ? (
          <div className="space-y-1.5">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre o email…" autoFocus
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
            {(found ?? []).map((f) => (
              <button key={f.id} type="button" disabled={busy} onClick={() => reserve({ studentId: f.id })}
                className="w-full text-left px-3 py-2.5 rounded-xl border border-gray-200 text-[13px] disabled:opacity-50" style={{ color: INK }}>
                <span className="font-bold">{f.name}</span>{f.email ? <span className="text-gray-400 text-[11px]"> · {f.email}</span> : null}
              </button>
            ))}
            {found !== null && found.length === 0 && <p className="text-[11px] text-gray-400">Sin resultados — probá &quot;Cliente nuevo&quot;.</p>}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1.5">
              <input value={nu.firstName} onChange={(e) => setNu({ ...nu, firstName: e.target.value })} placeholder="Nombre *" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
              <input value={nu.lastName} onChange={(e) => setNu({ ...nu, lastName: e.target.value })} placeholder="Apellido" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
            </div>
            {/* ¿Ya existe alguien con ese nombre? Mejor reusarlo que crear
                un segundo perfil que le parte el historial en dos. */}
            {nameDupes.length > 0 && (
              <div className="rounded-xl p-2.5 space-y-1.5" style={{ background: 'rgba(255,209,102,.18)', border: '1px solid rgba(255,209,102,.5)' }}>
                <p className="text-[11px] font-bold" style={{ color: '#7a5c00' }}>
                  ⚠ Ya hay {nameDupes.length === 1 ? 'un cliente' : `${nameDupes.length} clientes`} con ese nombre
                </p>
                <p className="text-[10px]" style={{ color: '#a08030' }}>
                  Si es la misma persona, tocala acá — así no se le parte el historial. Si de verdad es otra, seguí abajo.
                </p>
                {nameDupes.map((d) => (
                  <button key={d.id} type="button" disabled={busy} onClick={() => reserve({ studentId: d.id })}
                    className="w-full text-left px-2.5 py-2 rounded-lg bg-white border border-gray-200 text-[12px] disabled:opacity-50" style={{ color: INK }}>
                    <span className="font-bold">{d.name}</span>
                    {d.email ? <span className="text-gray-400 text-[10.5px]"> · {d.email}</span> : <span className="text-gray-400 text-[10.5px]"> · sin correo</span>}
                  </button>
                ))}
              </div>
            )}
            <input value={nu.email} onChange={(e) => setNu({ ...nu, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
            {emailSuggestion && (
              <button type="button" onClick={() => setNu({ ...nu, email: emailSuggestion })}
                className="w-full text-left rounded-xl px-3 py-2"
                style={{ background: 'rgba(255,209,102,.18)', border: '1px solid rgba(255,209,102,.5)' }}>
                <span className="block text-[11.5px]" style={{ color: '#7a5c00' }}>¿Quisiste decir <strong>{emailSuggestion}</strong>?</span>
                <span className="block text-[10px] mt-0.5" style={{ color: '#a08030' }}>Tocá para usarlo — un correo mal escrito crea un segundo perfil.</span>
              </button>
            )}
            <input value={nu.phone} onChange={(e) => setNu({ ...nu, phone: e.target.value })} placeholder="Teléfono / WhatsApp" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
            <button type="button" disabled={busy || !nu.firstName.trim()} onClick={() => reserve(nu)}
              className="w-full rounded-full py-3 text-[10px] disabled:opacity-40" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 700 }}>
              {busy ? 'Reservando…' : nameDupes.length > 0 ? 'Es otra persona · crear nuevo' : 'Reservar cupo'}
            </button>
          </div>
        )}
        {msg && <p className="text-[12px] font-semibold text-center" style={{ color: msg.startsWith('✓') ? '#0a7c5d' : '#c04545' }}>{msg}</p>}
        <p className="text-[10px] text-gray-400 text-center">El pago se confirma en recepción — queda como reservado.</p>
      </div>
    </div>
  );
}


// ═══ 🚐 TRANSPORTE — tablero del Front Desk ═══
// Todas las solicitudes de transporte de los próximos 14 días, juntas:
// quién lo pide, cuántos alumnos, salida → regreso, lugar. El Front Desk
// marca "salió" y puede ajustar horarios (mismo hostSetTransport de Agenda).
function TransporteTab({ token, canCoordinate }: { token: string; canCoordinate: boolean }) {
  const [rows, setRows] = useState<TransportBoardRow[] | null | 'error'>(null);
  const [notices, setNotices] = useState<Array<{ id: string; title: string; body: string | null; created_at: string }>>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [dep, setDep] = useState(''); const [ret, setRet] = useState('');

  const load = () => {
    hostTransportBoard(token).then((r) => setRows(r ?? 'error')).catch(() => setRows('error'));
    hostTransportNotices(token).then(setNotices).catch(() => {});
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [token]);

  const hoy = new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10);
  const dayLabel = (d: string) => {
    const label = new Date(`${d}T12:00:00Z`).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });
    return d === hoy ? `HOY · ${label}` : label;
  };
  const groups: [string, TransportBoardRow[]][] = [];
  for (const r of (Array.isArray(rows) ? rows : [])) {
    const g = groups.find((x) => x[0] === r.date);
    if (g) g[1].push(r); else groups.push([r.date, [r]]);
  }

  const setStatus = async (r: TransportBoardRow, status: 'taken' | 'requested') => {
    setBusyId(r.plan_id);
    const res = await hostSetTransport(token, r.plan_id, { status });
    setBusyId(null);
    if (!res.ok) { alert(res.error || 'No se pudo actualizar.'); return; }
    load();
  };
  const saveTimes = async (r: TransportBoardRow) => {
    setBusyId(r.plan_id);
    const res = await hostSetTransport(token, r.plan_id, { depart: dep || null, ret: ret || null });
    setBusyId(null);
    if (!res.ok) { alert(res.error || 'No se pudo guardar.'); return; }
    setEditId(null);
    load();
  };

  // ── Compartir el tablero (pedido de Marcelo 2026-08-25): el Front Desk
  // necesita mandar los transportes por WhatsApp o imprimirlos para el chofer.
  const hhmm = (t: string | null) => (t ? String(t).slice(0, 5) : '—');
  const dayText = (date: string, list: TransportBoardRow[]) => {
    const L: string[] = [`🚐 TRANSPORTES · ${dayLabel(date).toUpperCase()}`];
    for (const r of list) {
      L.push('━━━━━━━━━━━━━━');
      L.push(`${hhmm(r.depart)} → ${hhmm(r.ret)} · ${r.camp_name.toUpperCase()}`);
      const l2: string[] = [`👥 ${r.passengers} pasajeros (${r.students} alumnos + ${r.staff} staff)`];
      if (r.venue) l2.push(`📍 ${r.venue}`);
      if (r.class_start) l2.push(`🕐 encuentro ${hhmm(r.class_start)}`);
      L.push(l2.join(' · '));
      if (r.coach_name) L.push(`Lo pide: ${r.coach_name}`);
      if (r.status === 'taken') L.push('✓ ya salió');
      else if (r.status === 'cancelled') L.push('✕ CANCELADO');
    }
    L.push('━━━━━━━━━━━━━━');
    L.push('The Surf Sequence · Front Desk');
    return L.join('\n');
  };
  const allText = () => groups.map(([d, list]) => dayText(d, list)).join('\n\n');

  // Imprimir: ventana propia con una tabla limpia (sirve para papel y para
  // "Guardar como PDF" o captura, que es como lo mandan por WhatsApp).
  const printBoard = () => {
    const esc = (v: unknown) => String(v ?? '—').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
    const body = groups.map(([d, list]) => `
      <h2>${esc(dayLabel(d))}</h2>
      <table>
        <thead><tr><th>Sale</th><th>Vuelve</th><th>Servicio</th><th>Pasajeros</th><th>Lugar</th><th>Encuentro</th><th>Lo pide</th><th>Estado</th></tr></thead>
        <tbody>${list.map((r) => `<tr>
          <td class="b">${esc(hhmm(r.depart))}</td>
          <td>${esc(hhmm(r.ret))}</td>
          <td class="b">${esc(r.camp_name)}</td>
          <td>${esc(r.passengers)} <span class="s">(${esc(r.students)}+${esc(r.staff)})</span></td>
          <td>${esc(r.venue)}</td>
          <td>${esc(hhmm(r.class_start))}</td>
          <td>${esc(r.coach_name)}</td>
          <td>${r.status === 'taken' ? '✓ salió' : r.status === 'cancelled' ? '✕ cancelado' : 'pendiente'}</td>
        </tr>`).join('')}</tbody>
      </table>`).join('');
    const w = window.open('', '_blank');
    if (!w) { alert('Permití las ventanas emergentes para imprimir.'); return; }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Transportes</title><style>
      body{font-family:system-ui,-apple-system,sans-serif;color:#061C2B;padding:24px;margin:0}
      h1{font-size:18px;margin:0 0 2px} .sub{font-size:11px;color:#667;margin:0 0 18px}
      h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;margin:18px 0 6px;color:#0090B0}
      table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:10px}
      th{text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#889;border-bottom:1px solid #ccd;padding:4px 6px}
      td{padding:6px;border-bottom:1px solid #eef} .b{font-weight:700} .s{color:#889;font-size:10px}
      @media print{body{padding:0}}
    </style></head><body>
      <h1>🚐 Transportes · próximos 14 días</h1>
      <p class="sub">The Surf Sequence · Front Desk · generado ${esc(new Date().toLocaleString('es-ES', { timeZone: 'America/El_Salvador' }))}</p>
      ${body || '<p>No hay transportes solicitados.</p>'}
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="space-y-4 pb-4">
      <div className="rounded-2xl px-4 py-5" style={{ background: '#0A1628' }}>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">Front Desk</p>
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>🚐 Transporte · próximos 14 días</h2>
        <p className="text-[11px] text-white/50 mt-1">Lo que los coaches solicitaron al planear sus clases y camps. Marcá "salió" cuando el transporte se vaya.</p>
        {groups.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            <CopyTextButton text={allText()} label="📋 Copiar todo (WhatsApp)" />
            <button type="button" onClick={printBoard}
              className="shrink-0 text-[10px] font-bold rounded-full px-3 py-1.5 border"
              style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.35)', minWidth: 96 }}>
              🖨 Imprimir / PDF
            </button>
          </div>
        )}
      </div>

      {/* 🔔 Notas de los coaches: pedidos, cambios de horario, cancelaciones */}
      {notices.length > 0 && (
        <div className="rounded-2xl bg-white p-3 space-y-1.5">
          <p className="text-[10px] font-bold" style={{ ...F_M, color: '#8a99a6' }}>🔔 Cambios recientes</p>
          {notices.slice(0, 5).map((n) => (
            <div key={n.id} className="text-[11px] leading-snug border-l-2 pl-2" style={{ borderColor: GOLD }}>
              <p className="font-semibold" style={{ color: INK }}>{n.title}</p>
              <p className="text-gray-500">
                {n.body}{' '}
                <span className="text-gray-400">· {new Date(n.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/El_Salvador' })}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {rows === null && <p className="text-sm text-gray-400 px-1">Cargando…</p>}
      {rows === 'error' && (
        <div className="rounded-2xl bg-white p-6 text-center">
          <p className="text-sm text-gray-600">No se pudo cargar el tablero de transporte.</p>
          <button type="button" onClick={() => { setRows(null); load(); }}
            className="mt-2 rounded-full px-4 py-2 text-[9px]" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 700 }}>
            Reintentar
          </button>
        </div>
      )}
      {Array.isArray(rows) && groups.length === 0 && (
        <div className="rounded-2xl bg-white p-6 text-center">
          <p className="text-sm text-gray-500">Sin transportes solicitados en los próximos 14 días.</p>
          <p className="text-[11px] text-gray-400 mt-1">El coach lo pide al planear su día; apenas lo haga, aparece acá.</p>
        </div>
      )}

      {groups.map(([date, list]) => (
        <div key={date} className="space-y-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <p className="text-[10px] font-bold" style={{ ...F_M, color: date === hoy ? '#0090B0' : '#8a99a6' }}>{dayLabel(date)}</p>
            <CopyTextButton text={dayText(date, list)} label="📋 Copiar día" />
          </div>
          {list.map((r) => (
            <div key={r.plan_id} className="rounded-2xl bg-white p-3.5 space-y-2" style={{ borderLeft: `4px solid ${r.status === 'taken' ? GREEN : r.status === 'cancelled' ? '#c04545' : GOLD}` }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[15px] font-extrabold leading-tight" style={{ color: INK }}>
                    {r.depart || '—'} → {r.ret || '—'}
                  </p>
                  <p className="text-[12px] font-semibold mt-0.5 truncate" style={{ color: '#0090B0' }}>{r.camp_name}</p>
                </div>
                <span className="text-[9px] px-2 py-1 rounded-full font-bold shrink-0"
                  style={r.status === 'taken'
                    ? { background: 'rgba(6,214,160,.18)', color: '#0a7c5d' }
                    : r.status === 'cancelled'
                      ? { background: 'rgba(255,107,107,.15)', color: '#c04545' }
                      : { background: 'rgba(255,209,102,.25)', color: '#7a5c00' }}>
                  {r.status === 'taken' ? '✓ Salió' : r.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                👥 <b>{r.passengers} pasajeros</b> ({r.students} {r.students === 1 ? 'alumno' : 'alumnos'} + {r.staff} staff)
                {r.venue ? <> · 📍 {r.venue}</> : null}
                {r.class_start ? <> · <b>🕐 encuentro {String(r.class_start).slice(0, 5)}</b></> : null}
                {r.coach_name ? <> · lo pide <b>{r.coach_name}</b></> : null}
              </p>
              {canCoordinate && (
                <div className="flex items-center gap-2 pt-0.5">
                  {r.status !== 'taken' ? (
                    <button type="button" disabled={busyId === r.plan_id} onClick={() => setStatus(r, 'taken')}
                      className="rounded-full px-3 py-1.5 text-[9px]" style={{ ...F_M, background: GREEN, color: INK, fontWeight: 700 }}>
                      ✓ Salió
                    </button>
                  ) : (
                    <button type="button" disabled={busyId === r.plan_id} onClick={() => setStatus(r, 'requested')}
                      className="rounded-full px-3 py-1.5 text-[9px] border" style={{ ...F_M, color: '#667', borderColor: '#e5e7eb' }}>
                      Deshacer
                    </button>
                  )}
                  <button type="button" onClick={() => { setEditId(editId === r.plan_id ? null : r.plan_id); setDep(r.depart || ''); setRet(r.ret || ''); }}
                    className="rounded-full px-3 py-1.5 text-[9px] border" style={{ ...F_M, color: INK, borderColor: '#e5e7eb' }}>
                    🕐 Horario
                  </button>
                </div>
              )}
              {editId === r.plan_id && (
                <div className="flex items-center gap-2">
                  <input type="time" value={dep} onChange={(e) => setDep(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-gray-200" aria-label="Hora de salida" />
                  <span className="text-gray-400 text-xs">→</span>
                  <input type="time" value={ret} onChange={(e) => setRet(e.target.value)} className="text-sm px-2 py-1.5 rounded-lg border border-gray-200" aria-label="Hora de regreso" />
                  <button type="button" disabled={busyId === r.plan_id} onClick={() => saveTimes(r)}
                    className="rounded-full px-3 py-1.5 text-[9px]" style={{ ...F_M, background: CYAN, color: INK, fontWeight: 700 }}>
                    Guardar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
