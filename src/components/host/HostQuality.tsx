'use client';

// ═══ CALIDAD · atención al cliente en el portal del host (Marcelo 2026-09-25) ═══
// "Que Kat tenga toda la info para saber exactamente qué está pasando: los
// ratings, las encuestas, los incidentes." Una sola pantalla, en este orden:
// 1) cuatro números de los últimos 30 días · 2) PARA ATENDER: todo lo que pide
// una llamada, junto y por fecha · 3) encuestas por camp con los que faltan
// (link para copiar / WhatsApp) · 4) ratings por coach · 5) experiencia ·
// 6) incidentes. Staff-facing → español, molde v10.1 del portal del host.

import { useEffect, useState } from 'react';
import { hostQualityBoard, type HostQualityBoard, type HostQualityAlert } from '@/lib/actions/host-portal';
import { CopyTextButton } from '@/components/dashboard/CopyTextButton';

const INK = '#061C2B', PAPER = '#F7F9FA', SAND = '#E9E2D2', BORDER = '#DCD7C6', CYAN = '#00D2FF', CORAL = '#FF6B6B', GOLD = '#FFD166', GREEN = '#06D6A0', MUTED = '#55666E';
const F_D: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' };
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em' };

const KIND: Record<HostQualityAlert['kind'], { label: string; color: string }> = {
  coach: { label: 'Coach', color: CORAL },
  method: { label: 'Método', color: GOLD },
  comment: { label: 'Comentario', color: CYAN },
  experience: { label: 'Experiencia', color: GOLD },
  incident: { label: 'Incidente', color: CORAL },
};

const fmtDay = (iso: string) => {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('es-SV', { day: 'numeric', month: 'short' });
};
const stars = (n: number | null | undefined) => (n == null ? '—' : `${n.toFixed(1)}★`);

function Card({ kicker, title, children, right }: { kicker: string; title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="rounded-lg border shadow-sm overflow-hidden" style={{ background: SAND, borderColor: BORDER }}>
      <div className="px-3.5 pt-3 pb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px]" style={{ ...F_M, color: '#0090B0' }}>{kicker}</p>
          <p className="font-bold text-[15px]" style={{ color: INK }}>{title}</p>
        </div>
        {right}
      </div>
      <div className="px-3.5 pb-3">{children}</div>
    </section>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: 'good' | 'warn' | 'bad' }) {
  const color = tone === 'bad' ? CORAL : tone === 'warn' ? GOLD : tone === 'good' ? GREEN : CYAN;
  return (
    <div className="rounded-[5px] px-3 py-2.5" style={{ background: INK }}>
      <p className="text-[8px]" style={{ ...F_M, color: 'rgba(247,249,250,.6)' }}>{label}</p>
      <p className="text-[24px] leading-none mt-1" style={{ ...F_D, color }}>{value}</p>
      {sub && <p className="text-[10px] mt-1" style={{ color: 'rgba(247,249,250,.65)' }}>{sub}</p>}
    </div>
  );
}

export function HostQuality({ token }: { token: string }) {
  const [board, setBoard] = useState<HostQualityBoard | null | undefined>(undefined);
  const [openCamp, setOpenCamp] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => { hostQualityBoard(token).then(setBoard).catch(() => setBoard(null)); }, [token]);

  if (board === undefined) return <p className="text-[12px] py-6 text-center" style={{ color: 'rgba(247,249,250,.7)' }}>Cargando calidad…</p>;
  if (board === null) return <p className="text-[12px] py-6 text-center" style={{ color: 'rgba(247,249,250,.7)' }}>No se pudo cargar. Probá de nuevo.</p>;

  const k = board.kpis;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const alerts = showAll ? board.alerts : board.alerts.slice(0, 8);
  const pendingByCamp = new Map<string, HostQualityBoard['pending']>();
  for (const p of board.pending) { if (!pendingByCamp.has(p.campId)) pendingByCamp.set(p.campId, []); pendingByCamp.get(p.campId)!.push(p); }
  // Solo los servicios donde hubo encuesta que responder: una clase de un día
  // sin cierre no tiene a quién perseguir y solo hace ruido en la lista.
  const campsWithSurvey = board.camps.filter((c) => c.invited > 0 || c.answered > 0 || c.experience > 0);
  const hiddenCamps = board.camps.length - campsWithSurvey.length;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[9px]" style={{ ...F_M, color: CYAN }}>Atención al cliente · últimos 30 días</p>
        <p className="text-[11px]" style={{ color: 'rgba(247,249,250,.65)' }}>Lo que dicen los clientes de Puro Surf y lo que pasó en el agua. Del {fmtDay(board.from)} al {fmtDay(board.to)}.</p>
      </div>

      {/* 1 · Los cuatro números */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Kpi label="Coach" value={stars(k.coachAvg)} sub={`${k.coachN} calificaci${k.coachN === 1 ? 'ón' : 'ones'}`} tone={k.coachAvg == null ? undefined : k.coachAvg >= 4.5 ? 'good' : k.coachAvg >= 4 ? 'warn' : 'bad'} />
        <Kpi label="Método" value={stars(k.methodAvg)} sub={`${Math.round(k.methodN)} encuesta${Math.round(k.methodN) === 1 ? '' : 's'}`} tone={k.methodAvg == null ? undefined : k.methodAvg >= 4.5 ? 'good' : k.methodAvg >= 4 ? 'warn' : 'bad'} />
        <Kpi label="NPS" value={k.nps == null ? '—' : `${k.nps > 0 ? '+' : ''}${k.nps}`} sub={`${k.npsN} respuesta${k.npsN === 1 ? '' : 's'}`} tone={k.nps == null ? undefined : k.nps >= 50 ? 'good' : k.nps >= 0 ? 'warn' : 'bad'} />
        <Kpi label="Encuestas" value={k.responsePct == null ? '—' : `${k.responsePct}%`} sub={`${k.answered} de ${k.invited} respondieron`} tone={k.responsePct == null ? undefined : k.responsePct >= 60 ? 'good' : k.responsePct >= 30 ? 'warn' : 'bad'} />
      </div>

      {/* 2 · Para atender */}
      <Card kicker="Para atender" title={board.alerts.length === 0 ? 'Nada pendiente. 🤙' : `${board.alerts.length} cosa${board.alerts.length === 1 ? '' : 's'} que piden una llamada o un mensaje`}
        right={board.alerts.length > 8 ? <button type="button" onClick={() => setShowAll(!showAll)} className="text-[11px] underline shrink-0" style={{ color: '#0090B0' }}>{showAll ? 'Ver menos' : `Ver las ${board.alerts.length}`}</button> : null}>
        {alerts.length > 0 && (
          <div className="space-y-1.5">
            {alerts.map((a, i) => (
              <div key={i} className="rounded-[5px] px-3 py-2" style={{ background: PAPER, borderLeft: `4px solid ${KIND[a.kind].color}` }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold truncate" style={{ color: INK }}>{a.student}</p>
                  <span className="text-[11px] font-bold shrink-0" style={{ color: INK }}>{a.score}</span>
                </div>
                <p className="text-[11px]" style={{ color: MUTED }}>{fmtDay(a.date)} · {KIND[a.kind].label}{a.camp ? ` · ${a.camp}` : ''}{a.coach ? ` · ${a.coach}` : ''}</p>
                {a.text && <p className="text-[12.5px] mt-1 leading-snug" style={{ color: INK }}>“{a.text}”</p>}
              </div>
            ))}
          </div>
        )}
        <p className="text-[10.5px] mt-2" style={{ color: MUTED }}>Coach o método en 3★ o menos, cualquier comentario escrito, experiencia baja (una dimensión en 3★ o NPS 6 o menos) e incidentes reportados por el coach.</p>
      </Card>

      {/* 3 · Encuestas por camp */}
      <Card kicker="Encuestas por camp" title={campsWithSurvey.length === 0 ? 'Sin encuestas enviadas en el período' : `${campsWithSurvey.length} servicio${campsWithSurvey.length === 1 ? '' : 's'} con encuesta · ${k.answered} de ${k.invited} respondieron`}>
        {campsWithSurvey.length > 0 && (
          <div className="space-y-1.5">
            {campsWithSurvey.map((c) => {
              const pend = pendingByCamp.get(c.campId) ?? [];
              const open = openCamp === c.campId;
              return (
                <div key={c.campId} className="rounded-[5px]" style={{ background: PAPER }}>
                  <button type="button" onClick={() => setOpenCamp(open ? null : c.campId)} className="w-full text-left px-3 py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold truncate" style={{ color: INK }}>{c.campName}</p>
                      <p className="text-[11px]" style={{ color: MUTED }}>terminó {fmtDay(c.endDate)} · {c.students} alumno{c.students === 1 ? '' : 's'} · {c.answered}/{c.invited} coach · {c.experience} experiencia</p>
                    </div>
                    <span className="text-[13px] font-black shrink-0" style={{ color: c.pct == null ? MUTED : c.pct >= 60 ? '#0a7c5d' : c.pct >= 30 ? '#8a6d00' : '#b42318' }}>{c.pct == null ? '—' : `${c.pct}%`}{pend.length ? ` · ${pend.length} sin responder ${open ? '▴' : '▾'}` : ''}</span>
                  </button>
                  {open && pend.length > 0 && (
                    <div className="px-3 pb-2.5 space-y-1 border-t" style={{ borderColor: BORDER }}>
                      {pend.map((p) => {
                        const link = p.feedbackToken ? `${origin}/feedback/${p.feedbackToken}` : null;
                        const wa = p.phone && link ? `https://wa.me/${p.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${p.name.split(' ')[0]}! Two minutes for your camp feedback? ${link}`)}` : null;
                        return (
                          <div key={p.studentId} className="flex items-center justify-between gap-2 pt-1.5">
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-semibold truncate" style={{ color: INK }}>{p.name}</p>
                              <p className="text-[10.5px] truncate" style={{ color: MUTED }}>{[p.phone, p.email].filter(Boolean).join(' · ') || 'sin teléfono ni email'}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {link && <CopyTextButton text={link} label="Copiar link" />}
                              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#25D366', color: '#fff' }}>WhatsApp</a>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[10.5px] mt-2" style={{ color: MUTED }}>La encuesta sale sola por correo al cerrar el camp. Tocá un camp para ver quién falta y mandarle el link.{hiddenCamps > 0 ? ` ${hiddenCamps} servicio${hiddenCamps === 1 ? '' : 's'} sin cierre no se muestra${hiddenCamps === 1 ? '' : 'n'}.` : ''}</p>
      </Card>

      {/* 4 · Ratings por coach */}
      <Card kicker="Ratings por coach" title={board.coaches.length === 0 ? 'Sin calificaciones en el período' : `${board.coaches.length} coach${board.coaches.length === 1 ? '' : 'es'} calificado${board.coaches.length === 1 ? '' : 's'}`}>
        {board.coaches.length > 0 && (
          <div className="space-y-1.5">
            {board.coaches.map((c) => {
              const max = Math.max(1, ...Object.values(c.stars));
              return (
                <div key={c.coachId} className="rounded-[5px] px-3 py-2 flex items-center gap-3" style={{ background: PAPER }}>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-bold truncate" style={{ color: INK }}>{c.name}</p>
                    <p className="text-[11px]" style={{ color: MUTED }}>{c.total} calificaci{c.total === 1 ? 'ón' : 'ones'}</p>
                  </div>
                  <div className="flex items-end gap-0.5 h-6" aria-label="Distribución de estrellas">
                    {(['1', '2', '3', '4', '5'] as const).map((s) => (
                      <span key={s} title={`${s}★: ${c.stars[s]}`} className="w-2 rounded-sm" style={{ height: `${Math.max(2, (c.stars[s] / max) * 24)}px`, background: s === '5' || s === '4' ? GREEN : s === '3' ? GOLD : CORAL }} />
                    ))}
                  </div>
                  <span className="text-[18px] shrink-0" style={{ ...F_D, color: c.avg >= 4.5 ? '#0a7c5d' : c.avg >= 4 ? '#8a6d00' : '#b42318' }}>{c.avg.toFixed(1)}★</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* 5 · Experiencia */}
      <Card kicker="Experiencia del camp" title={board.experience.responses === 0 ? 'Sin respuestas de experiencia' : `${board.experience.responses} respuesta${board.experience.responses === 1 ? '' : 's'} · NPS ${board.experience.nps.score == null ? '—' : `${board.experience.nps.score > 0 ? '+' : ''}${board.experience.nps.score}`}`}>
        {board.experience.responses > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {Object.entries(board.experience.dims).map(([col, d]: [string, any]) => (
              <div key={col} className="rounded-[5px] px-2.5 py-2" style={{ background: PAPER }}>
                <p className="text-[10px] truncate" style={{ color: MUTED }}>{board.experience.labels[col] ?? col}</p>
                <p className="text-[16px] leading-none mt-0.5" style={{ ...F_D, color: d.avg == null ? MUTED : d.avg >= 4.5 ? '#0a7c5d' : d.avg >= 4 ? '#8a6d00' : '#b42318' }}>{d.avg == null ? '—' : `${d.avg.toFixed(1)}★`}</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-[10.5px] mt-2" style={{ color: MUTED }}>NPS: promotores (9–10) menos detractores (0–6). {board.experience.nps.promoters} promotores · {board.experience.nps.passives} neutros · {board.experience.nps.detractors} detractores.</p>
      </Card>

      {/* 6 · Incidentes */}
      <Card kicker="Incidentes" title={board.incidents.length === 0 ? 'Sin incidentes en 30 días. 🤙' : `${board.incidents.length} incidente${board.incidents.length === 1 ? '' : 's'} reportado${board.incidents.length === 1 ? '' : 's'} por los coaches`}>
        {board.incidents.length > 0 && (
          <div className="space-y-1.5">
            {board.incidents.map((i) => (
              <div key={i.id} className="rounded-[5px] px-3 py-2" style={{ background: PAPER, borderLeft: `4px solid ${CORAL}` }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold truncate" style={{ color: INK }}>{i.student ?? 'General'} <span className="font-semibold text-[11px]" style={{ color: MUTED }}>· {i.type}</span></p>
                  <span className="text-[11px] shrink-0" style={{ color: MUTED }}>{fmtDay(i.date)}{i.coach ? ` · ${i.coach}` : ''}</span>
                </div>
                {i.description && <p className="text-[12.5px] mt-1 leading-snug" style={{ color: INK }}>{i.description}</p>}
                {i.action && <p className="text-[11.5px] mt-0.5" style={{ color: '#0a7c5d' }}>Acción: {i.action}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 7 · Todas las respuestas (feed) */}
      {board.responses.length > 0 && (
        <details className="rounded-lg border overflow-hidden" style={{ background: SAND, borderColor: BORDER }}>
          <summary className="cursor-pointer list-none px-3.5 py-3">
            <p className="text-[9px]" style={{ ...F_M, color: '#0090B0' }}>Todas las respuestas</p>
            <p className="font-bold text-[15px]" style={{ color: INK }}>{board.responses.length} encuesta{board.responses.length === 1 ? '' : 's'} de coach y método ▾</p>
          </summary>
          <div className="px-3.5 pb-3 space-y-1">
            {board.responses.map((r) => (
              <div key={r.id} className="rounded-[5px] px-3 py-2 flex items-start justify-between gap-2" style={{ background: PAPER }}>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-bold truncate" style={{ color: INK }}>{r.student}</p>
                  <p className="text-[10.5px]" style={{ color: MUTED }}>{fmtDay(r.date)}{r.camp ? ` · ${r.camp}` : ''}{r.coach ? ` · ${r.coach}` : ''}</p>
                  {r.comment && <p className="text-[12px] mt-0.5 leading-snug" style={{ color: INK }}>“{r.comment}”</p>}
                </div>
                <div className="text-right shrink-0 text-[11px]" style={{ color: INK }}>
                  <p>Coach <b>{r.coach_rating ?? '—'}★</b></p>
                  <p>Método <b>{r.method_clarity ?? '—'}★</b> · <b>{r.method_next ?? '—'}★</b></p>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
