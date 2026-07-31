'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sellerSearchStudents, sellerReserveSpot, sellerMySales, type SellerSale } from '@/lib/actions/seller';
import { getMyCoachResources, type CoachResource } from '@/lib/actions/coach-resources';

// ═══ PORTAL DEL VENDEDOR (rol seller) — Brand Manual v10 ═══
// 3 pestañas, cero ruido: VENDER (home) · MIS VENTAS · MATERIAL.
// Menos es más: agrupado por día, filtros de un toque, meta siempre visible.

const INK = '#061C2B', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', GREEN = '#06D6A0', CORAL = '#FF6B6B';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em' };

type Tab = 'vender' | 'ventas' | 'material';
const FILTERS = [
  { id: 'all', label: 'Todo' },
  { id: 'camp', label: '🏄 Camps' },
  { id: 'discover', label: '🌊 Discover' },
  { id: 'class', label: '🧘 Clases' },
] as const;

function mondayOf(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const shift = (d.getDay() + 6) % 7; // lunes=0
  d.setDate(d.getDate() - shift);
  return d.toISOString().slice(0, 10);
}
function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
const DOW_ES = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

function money(c: number) { return `$${(c / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`; }
function dayLabel(iso: string, today: string) {
  if (iso === today) return 'HOY';
  const d = new Date(iso + 'T00:00:00');
  const t = new Date(today + 'T00:00:00');
  const diff = Math.round((d.getTime() - t.getTime()) / 86400000);
  const s = d.toLocaleDateString('es-ES', { weekday: 'long', month: 'short', day: 'numeric' });
  return diff === 1 ? 'MAÑANA' : s.toUpperCase();
}

export function SellerPortal({ token, sellerName, services, heading = 'Seller' }: { token: string; sellerName: string; services: any[]; heading?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('vender');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [q, setQ] = useState('');
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<string>('');
  const [sales, setSales] = useState<SellerSale[] | null>(null);
  const [material, setMaterial] = useState<CoachResource[] | null>(null);

  useEffect(() => { sellerMySales(token).then(setSales).catch(() => setSales([])); }, [token]);
  useEffect(() => {
    if (tab === 'material' && material === null) {
      getMyCoachResources(token).then(setMaterial).catch(() => setMaterial([]));
    }
  }, [tab, material, token]);

  const today = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
  const live = (services ?? []).filter((s) => s.status !== 'cancelled');

  // Tira de semana: arranca en la semana del primer servicio próximo.
  useEffect(() => {
    if (!weekStart) {
      const first = [...live].sort((a, b) => a.start_date.localeCompare(b.start_date))[0];
      setWeekStart(mondayOf(first ? (first.start_date > today ? first.start_date : today) : today));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.length]);

  // Disponibilidad por día (para los puntitos de la tira)
  const dayInfo = useMemo(() => {
    const m = new Map<string, { n: number; free: boolean }>();
    for (const s of live) {
      const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
      const cap = s.capacity_override ?? tpl?.capacity_max ?? 4;
      const act = (s.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active').length;
      const cur = m.get(s.start_date) ?? { n: 0, free: false };
      cur.n += 1; cur.free = cur.free || act < cap;
      m.set(s.start_date, cur);
    }
    return m;
  }, [live]);

  // Meta global (misma matemática del Sell tab clásico)
  const goal = useMemo(() => {
    const amounts: number[] = [];
    for (const s of live) for (const p of s.camp_participants ?? []) if (p.amount_cents > 0) amounts.push(p.amount_cents);
    const avg = amounts.length ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length) : 9900;
    let spots = 0, sold = 0, reserved = 0, committed = 0, meta = 0;
    for (const s of live) {
      const cap = s.capacity_override ?? (Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates)?.capacity_max ?? 4;
      const act = (s.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
      const svcAmts = act.filter((p: any) => p.amount_cents > 0).map((p: any) => p.amount_cents);
      const unit = svcAmts.length ? Math.round(svcAmts.reduce((a: number, b: number) => a + b, 0) / svcAmts.length) : avg;
      spots += cap; sold += act.filter((p: any) => p.payment_status === 'paid').length;
      reserved += act.filter((p: any) => p.payment_status !== 'paid').length;
      committed += act.reduce((s2: number, p: any) => s2 + (p.amount_cents || 0), 0);
      meta += cap * unit;
    }
    return { spots, sold, reserved, committed, meta, pct: meta ? Math.min(100, Math.round((committed / meta) * 100)) : 0 };
  }, [live]);

  // Filtro + búsqueda + agrupado por día
  const grouped = useMemo(() => {
    const kindOf = (s: any) => {
      const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
      const k = tpl?.service_kind ?? '';
      if (k === 'surf_camp') return 'camp';
      if (k === 'surf_lesson') return 'discover';
      return 'class';
    };
    const rows = live
      .filter((s) => filter === 'all' || kindOf(s) === filter)
      .filter((s) => !q.trim() || (s.camp_name ?? '').toLowerCase().includes(q.trim().toLowerCase()));
    const map = new Map<string, any[]>();
    for (const s of rows) { const arr = map.get(s.start_date) ?? []; arr.push(s); map.set(s.start_date, arr); }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [live, filter, q]);

  const pendingOld = (sales ?? []).filter((v) => v.enrollment_status === 'active' && v.payment_status !== 'paid'
    && v.reserved_at && (Date.now() - new Date(v.reserved_at).getTime()) > 3 * 86400000);
  const monthPaid = (sales ?? []).filter((v) => v.payment_status === 'paid' && (v.reserved_at ?? '').slice(0, 7) === today.slice(0, 7));

  return (
    <div style={{ background: INK, minHeight: '100vh' }} className="pb-24">
      {/* Header v10 */}
      <div className="px-4 pt-5 pb-4" style={{ background: '#04141F', borderBottom: `2px solid ${CYAN}4D` }}>
        <p style={{ ...F_M, color: CYAN }} className="text-[9px]">The Surf Sequence · {heading}</p>
        <h1 style={{ ...F_D, color: PAPER }} className="text-[26px] mt-1">{sellerName}</h1>
        {/* Meta siempre visible */}
        <div className="mt-3 rounded-2xl p-3" style={{ background: '#0A2438', border: '1px solid rgba(0,210,255,.25)' }}>
          <div className="flex justify-between items-baseline mb-1.5">
            <span style={{ ...F_M, color: CYAN }} className="text-[9px]">Meta de ventas</span>
            <span className="text-[11px]" style={{ color: 'rgba(247,249,250,.6)' }}>{goal.pct}% de {money(goal.meta)}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(247,249,250,.1)' }}>
            <div style={{ width: `${goal.pct}%`, background: CYAN, height: '100%' }} />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2.5">
            {[['Cupos', goal.spots], ['Vendidos', goal.sold], ['Reservados', goal.reserved], ['Libres', goal.spots - goal.sold - goal.reserved]].map(([l, v]) => (
              <div key={l as string} className="text-center">
                <p style={{ ...F_D, color: PAPER }} className="text-[18px] leading-none">{v as number}</p>
                <p style={{ ...F_M, color: 'rgba(247,249,250,.4)' }} className="text-[7px] mt-1">{l as string}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido — se adapta: teléfono 1 col · tablet 2 · desktop 3 */}
      <div className="px-4 pt-4 max-w-lg md:max-w-3xl xl:max-w-5xl mx-auto space-y-3">
        {tab === 'vender' && (
          <>
            {/* Tira de semana */}
            {weekStart && (
              <div className="flex items-center gap-1">
                <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="shrink-0 px-2 py-2 text-[16px]" style={{ color: 'rgba(247,249,250,.55)' }}>‹</button>
                <div className="flex-1 grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((iso, i) => {
                    const info = dayInfo.get(iso);
                    const on = selectedDay === iso;
                    return (
                      <button key={iso} onClick={() => setSelectedDay(on ? null : iso)}
                        className="rounded-xl py-1.5 text-center"
                        style={on ? { background: CYAN, color: INK } : { background: '#0A2438', border: iso === today ? `1.5px solid ${GOLD}` : '1px solid rgba(247,249,250,.08)' }}>
                        <span style={{ ...F_M, fontSize: 7, color: on ? INK : 'rgba(247,249,250,.45)' }}>{DOW_ES[i]}</span>
                        <span className="block text-[14px] font-extrabold" style={{ color: on ? INK : PAPER }}>{parseInt(iso.slice(8), 10)}</span>
                        <span className="block text-[8px] leading-none" style={{ color: !info ? 'transparent' : info.free ? (on ? INK : GREEN) : 'rgba(247,249,250,.3)' }}>
                          {info ? '●'.repeat(Math.min(info.n, 3)) : '·'}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="shrink-0 px-2 py-2 text-[16px]" style={{ color: 'rgba(247,249,250,.55)' }}>›</button>
              </div>
            )}
            {selectedDay && (
              <button onClick={() => setSelectedDay(null)} className="text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ border: '1.5px solid rgba(247,249,250,.25)', color: 'rgba(247,249,250,.7)' }}>
                × Ver todos los días
              </button>
            )}
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar servicio…"
              className="w-full text-[14px] px-4 py-3 rounded-full"
              style={{ background: 'rgba(247,249,250,.06)', border: '1.5px solid rgba(247,249,250,.15)', color: PAPER }} />
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {FILTERS.map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className="shrink-0 px-3.5 py-2 rounded-full text-[11px] font-bold"
                  style={filter === f.id ? { background: CYAN, color: INK } : { border: '1.5px solid rgba(247,249,250,.2)', color: 'rgba(247,249,250,.7)' }}>
                  {f.label}
                </button>
              ))}
            </div>
            {grouped.length === 0 && <p className="text-[13px] py-6 text-center" style={{ color: 'rgba(247,249,250,.4)' }}>Nada que coincida — probá otro filtro.</p>}
            {(selectedDay ? grouped.filter(([d]) => d === selectedDay) : grouped).slice(0, 30).map(([day, rows]) => (
              <div key={day}>
                <p style={{ ...F_M, color: GOLD }} className="text-[9px] mb-1.5 mt-2">{dayLabel(day, today)}</p>
                <div className="space-y-1.5 md:space-y-0 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-2">
                  {rows.map((s: any) => {
                    const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
                    const cap = s.capacity_override ?? tpl?.capacity_max ?? 4;
                    const act = (s.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active').length;
                    const free = Math.max(0, cap - act);
                    return (
                      <div key={s.id} className="rounded-2xl p-3" style={{ background: '#0A2438', border: '1px solid rgba(247,249,250,.08)' }}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold truncate" style={{ color: PAPER }}>{s.camp_name}</p>
                            <p style={{ ...F_M, color: 'rgba(247,249,250,.4)' }} className="text-[8px] mt-0.5">
                              {s.scheduled_time ? s.scheduled_time.slice(0, 5) : ''}{s.end_date !== s.start_date ? ` · hasta ${s.end_date.slice(5)}` : ''}
                            </p>
                          </div>
                          <span className="shrink-0 text-[11px] font-extrabold px-2.5 py-1 rounded-full"
                            style={free === 0 ? { background: 'rgba(247,249,250,.1)', color: 'rgba(247,249,250,.45)' } : { background: CYAN, color: INK }}>
                            {free === 0 ? 'Lleno' : `${free} de ${cap}`}
                          </span>
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          {(() => { const tv = (Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates)?.video_url; return tv ? (
                            <a href={tv} target="_blank" rel="noreferrer"
                              className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                              style={{ border: '1.5px solid rgba(247,249,250,.3)', color: PAPER }}>🎬 Video</a>
                          ) : null; })()}
                          {s.sales_deck_url && (
                            <a href={s.sales_deck_url} target="_blank" rel="noreferrer"
                              className="text-[11px] font-bold px-3 py-1.5 rounded-full"
                              style={{ border: `1.5px solid ${CYAN}80`, color: CYAN }}>📽 Deck</a>
                          )}
                          {free > 0 && (
                            <button onClick={() => setReservingId(reservingId === s.id ? null : s.id)}
                              className="text-[11px] font-extrabold px-3 py-1.5 rounded-full"
                              style={reservingId === s.id ? { background: 'rgba(247,249,250,.15)', color: PAPER } : { background: GREEN, color: INK }}>
                              {reservingId === s.id ? '× Cerrar' : '+ Reservar'}
                            </button>
                          )}
                        </div>
                        {reservingId === s.id && (
                          <SellerReserveForm token={token} campId={s.id}
                            onDone={() => { setReservingId(null); sellerMySales(token).then(setSales).catch(() => {}); router.refresh(); }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'ventas' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl p-3 text-center" style={{ background: '#0A2438', border: `1px solid ${GREEN}40` }}>
                <p style={{ ...F_D, color: GREEN }} className="text-[24px] leading-none">{monthPaid.length}</p>
                <p style={{ ...F_M, color: 'rgba(247,249,250,.45)' }} className="text-[8px] mt-1.5">Pagadas este mes</p>
              </div>
              <div className="rounded-2xl p-3 text-center" style={{ background: '#0A2438', border: `1px solid ${GOLD}40` }}>
                <p style={{ ...F_D, color: GOLD }} className="text-[24px] leading-none">{(sales ?? []).filter((v) => v.enrollment_status === 'active' && v.payment_status !== 'paid').length}</p>
                <p style={{ ...F_M, color: 'rgba(247,249,250,.45)' }} className="text-[8px] mt-1.5">Pago pendiente</p>
              </div>
            </div>
            {pendingOld.length > 0 && (
              <div className="rounded-2xl p-3" style={{ background: 'rgba(255,107,107,.08)', border: `1.5px solid ${CORAL}66` }}>
                <p style={{ ...F_M, color: CORAL }} className="text-[9px] mb-1.5">⚠ Necesitan seguimiento · +3 días sin pago</p>
                {pendingOld.map((v) => (
                  <p key={v.id} className="text-[13px]" style={{ color: PAPER }}>{v.student_name} — <span style={{ color: 'rgba(247,249,250,.5)' }}>{v.camp_name}</span></p>
                ))}
              </div>
            )}
            <div className="space-y-1.5">
              {!sales ? <p className="text-[12px]" style={{ color: 'rgba(247,249,250,.4)' }}>Cargando…</p>
                : sales.length === 0 ? <p className="text-[13px] py-6 text-center" style={{ color: 'rgba(247,249,250,.4)' }}>Tu primera venta aparecerá acá. 🤙</p>
                : sales.map((v) => (
                  <div key={v.id} className="rounded-2xl px-3 py-2.5 flex items-center justify-between gap-2" style={{ background: '#0A2438', border: '1px solid rgba(247,249,250,.08)' }}>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{ color: PAPER }}>{v.student_name}</p>
                      <p style={{ ...F_M, color: 'rgba(247,249,250,.4)' }} className="text-[8px] truncate">{v.camp_name}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-extrabold px-2 py-1 rounded-full"
                      style={v.enrollment_status !== 'active' ? { background: 'rgba(247,249,250,.1)', color: 'rgba(247,249,250,.4)' }
                        : v.payment_status === 'paid' ? { background: `${GREEN}26`, color: GREEN } : { background: `${GOLD}1F`, color: GOLD }}>
                      {v.enrollment_status !== 'active' ? v.enrollment_status : v.payment_status === 'paid' ? `Pagado${v.amount_cents ? ' ' + money(v.amount_cents) : ''}` : 'Pendiente'}
                    </span>
                  </div>
                ))}
            </div>
          </>
        )}

        {tab === 'material' && (
          <>
            <p className="text-[12px]" style={{ color: 'rgba(247,249,250,.5)' }}>Tus herramientas de venta: decks, precios y videos que te asignó la academia.</p>
            {!material ? <p className="text-[12px]" style={{ color: 'rgba(247,249,250,.4)' }}>Cargando…</p>
              : material.length === 0 ? <p className="text-[13px] py-6 text-center" style={{ color: 'rgba(247,249,250,.4)' }}>Todavía no te asignaron material — pedíselo al admin.</p>
              : material.map((r) => (
                <a key={r.id} href={r.file_url} target="_blank" rel="noreferrer"
                  className="block rounded-2xl p-3.5" style={{ background: '#0A2438', border: `1px solid ${CYAN}33` }}>
                  <p className="text-[14px] font-bold" style={{ color: PAPER }}>📽 {r.title}</p>
                  {r.description && <p className="text-[11px] mt-0.5" style={{ color: 'rgba(247,249,250,.5)' }}>{r.description}</p>}
                </a>
              ))}
          </>
        )}
      </div>

      {/* Tab bar v10 */}
      <div className="fixed bottom-0 left-0 right-0 flex" style={{ background: '#04141F', borderTop: '1px solid rgba(0,210,255,.25)' }}>
        {([['vender', 'Vender', '🏄'], ['ventas', 'Mis ventas', '📒'], ['material', 'Material', '📽']] as const).map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id as Tab)} className="flex-1 py-3 text-center">
            <span className="block text-[16px]">{icon}</span>
            <span style={{ ...F_M, color: tab === id ? CYAN : 'rgba(247,249,250,.4)' }} className="text-[8px]">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Formulario de reserva (mismo motor probado del Sell tab, estética v10)
function SellerReserveForm({ token, campId, onDone }: { token: string; campId: string; onDone: () => void }) {
  const [mode, setMode] = useState<'search' | 'new'>('search');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; name: string; email: string | null }[]>([]);
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(null);
  const [first, setFirst] = useState(''); const [last, setLast] = useState('');
  const [email, setEmail] = useState(''); const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (mode !== 'search' || q.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(() => { sellerSearchStudents(token, q).then(setResults).catch(() => {}); }, 350);
    return () => clearTimeout(t);
  }, [q, mode, token]);

  const submit = async () => {
    setBusy(true); setMsg(null);
    const res = await sellerReserveSpot(token, campId,
      picked ? { studentId: picked.id, note } : { firstName: first, lastName: last, email, phone, note });
    setBusy(false);
    if (!res.ok) { setMsg(res.error || 'No se pudo reservar.'); return; }
    onDone();
  };

  const inp: React.CSSProperties = { background: 'rgba(247,249,250,.06)', border: '1.5px solid rgba(247,249,250,.15)', color: PAPER };
  return (
    <div className="mt-2.5 rounded-xl p-3 space-y-2" style={{ background: 'rgba(247,249,250,.03)', border: '1px solid rgba(247,249,250,.1)' }}>
      <div className="flex gap-1.5">
        {(['search', 'new'] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setPicked(null); setMsg(null); }}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
            style={mode === m ? { background: CYAN, color: INK } : { border: '1px solid rgba(247,249,250,.2)', color: 'rgba(247,249,250,.55)' }}>
            {m === 'search' ? 'Cliente existente' : 'Cliente nuevo'}
          </button>
        ))}
      </div>
      {mode === 'search' ? (
        picked ? (
          <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: `${CYAN}14`, border: `1px solid ${CYAN}66` }}>
            <p className="text-[13px] font-bold" style={{ color: PAPER }}>{picked.name}</p>
            <button onClick={() => setPicked(null)} className="text-[11px]" style={{ color: 'rgba(247,249,250,.5)' }}>cambiar</button>
          </div>
        ) : (
          <>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre o email…" className="w-full text-[13px] px-3 py-2 rounded-lg" style={inp} />
            {results.map((r) => (
              <button key={r.id} onClick={() => setPicked(r)} className="w-full text-left px-3 py-2 rounded-lg" style={{ background: 'rgba(247,249,250,.05)' }}>
                <p className="text-[13px]" style={{ color: PAPER }}>{r.name}</p>
                {r.email && <p className="text-[10px]" style={{ color: 'rgba(247,249,250,.4)' }}>{r.email}</p>}
              </button>
            ))}
          </>
        )
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="Nombre *" className="text-[13px] px-3 py-2 rounded-lg" style={inp} />
            <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Apellido" className="text-[13px] px-3 py-2 rounded-lg" style={inp} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="text-[13px] px-3 py-2 rounded-lg" style={inp} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono / WhatsApp" className="text-[13px] px-3 py-2 rounded-lg" style={inp} />
          </div>
        </>
      )}
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota para el coordinador (opcional)" className="w-full text-[13px] px-3 py-2 rounded-lg" style={inp} />
      {msg && <p className="text-[11px]" style={{ color: CORAL }}>{msg}</p>}
      <button onClick={submit} disabled={busy || (mode === 'search' ? !picked : !first.trim())}
        className="w-full py-2.5 rounded-full text-[11px] font-extrabold disabled:opacity-40"
        style={{ background: GREEN, color: INK, ...F_M }}>
        {busy ? 'Reservando…' : 'Reservar — el coordinador confirma el pago'}
      </button>
    </div>
  );
}
