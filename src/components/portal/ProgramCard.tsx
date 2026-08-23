'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, Lock, Play, X } from 'lucide-react';
import { SeasonTimeline } from '@/components/portal/SeasonTimeline';
import {
  getMyProgram,
  markProgramItem,
  markProgramDayDone,
  saveProgramCheckin,
  type MyProgramData,
  type ProgramDayView,
} from '@/lib/actions/programs';

// ─── Programa de entreno en el portal del alumno ───
//
// Sigue el patrón de StudentPresentations: componente autocontenido que busca
// sus propios datos con el token y NO renderiza nada si el alumno no tiene
// programa activo — así los 2.727 alumnos sin programa ven el Home idéntico.
// El visor abre como overlay a pantalla completa (sin tocar el sistema de
// pestañas). Copy de cara al alumno en inglés, como todo el portal.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };
const ARCHIVO: React.CSSProperties = {
  fontFamily: 'var(--font-archivo), sans-serif',
  fontStretch: '125%' as any,
};

function toEmbed(url: string): string | null {
  const m =
    url.match(/youtube\.com\/watch\?v=([\w-]{6,})/) ||
    url.match(/youtu\.be\/([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export function ProgramCard({ token, initial }: { token: string; initial?: MyProgramData | null }) {
  const [data, setData] = useState<MyProgramData | null>(initial ?? null);
  const [open, setOpen] = useState(false);

  const refresh = () => {
    getMyProgram(token)
      .then((r) => {
        // Ante un error transitorio conservamos lo que había: pisar con null
        // desmontaba la tarjeta Y el visor con el alumno adentro. Solo ok:true
        // manda — y ok:true con data:null significa de verdad "sin programa".
        if (r.ok) setData(r.data);
      })
      .catch(() => {});
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (initial === undefined) refresh(); }, [token]);

  if (!data) return null;

  const pct = data.days_total > 0 ? Math.round((data.days_done / data.days_total) * 100) : 0;
  const current = data.days.find((d) => d.current) ?? null;

  return (
    <>
      {/* Tarjeta en el Home — dorado = línea de Alto Rendimiento */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-2xl p-4"
        style={{ background: 'rgba(255,209,102,.07)', border: '1px solid rgba(255,209,102,.4)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#FFD166' }}>
            Training Program
          </span>
          <span className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#FFD166' }}>
            {data.position ? `Micro ${data.position.week} · Day ${data.position.day}` : 'Completed ✓'}
          </span>
        </div>
        <p className="font-bold mt-1.5" style={{ ...ARCHIVO, color: '#f4f9fc', fontSize: 17 }}>
          {data.title}
        </p>
        <div className="mt-2 h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#FFD166' }} />
        </div>
        <p className="text-[11.5px] mt-2" style={{ color: '#b8cad8' }}>
          {current
            ? `Today: ${current.title.toLowerCase()} · ${current.items.length} tasks`
            : 'Every day done. See you in the water.'}
        </p>
        {current && (
          <p className="text-[11px] mt-2 font-semibold" style={{ color: '#FFD166' }}>
            Open today&apos;s session →
          </p>
        )}
      </button>

      {open && (
        <ProgramViewer
          token={token}
          data={data}
          onClose={() => setOpen(false)}
          onChanged={refresh}
        />
      )}
    </>
  );
}

// ─── El visor a pantalla completa ───

function ProgramViewer({
  token,
  data,
  onClose,
  onChanged,
}: {
  token: string;
  data: MyProgramData;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [busyItem, setBusyItem] = useState<string | null>(null);
  const [busyDay, setBusyDay] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // HOY primero (pedido Marcelo 2026-08-23): el atleta aterriza en SU día —
  // la semana completa queda a un tap ("View full program"). Sin día actual
  // (programa completado) se abre directo la vista de semanas.
  const currentDay = data.days.find((d) => d.current) ?? null;
  const [view, setView] = useState<'today' | 'week' | 'season'>(currentDay ? 'today' : 'week');

  const currentWeek = data.position?.week ?? data.weeks;
  // El header de microciclo sigue a la VISTA: en today, el micro del día
  // actual (no el estado del selector de semanas, que puede quedar en otra).
  const weekNumbers = useMemo(
    () => Array.from(new Set(data.days.map((d) => d.week_number))).sort((a, b) => a - b),
    [data.days]
  );
  const [week, setWeek] = useState(currentWeek);
  // Si el día actual cruza de semana (marcó el último día de la W1 sin cerrar
  // el visor), la lista sigue a la posición nueva en vez de quedarse en la
  // semana vieja mostrando todo atenuado.
  useEffect(() => {
    setWeek(currentWeek);
  }, [currentWeek]);
  const headerWeek = view === 'today' && currentDay ? currentDay.week_number : week;
  const weekDays = data.days.filter((d) => d.week_number === week);
  const weekDone = (w: number) => data.days.filter((d) => d.week_number === w).every((d) => d.done);

  const toggleItem = async (item: { id: string; marked: boolean }) => {
    setErr(null);
    setBusyItem(item.id);
    const r = await markProgramItem(token, item.id, !item.marked);
    setBusyItem(null);
    if (!r.ok) setErr(r.error || 'Could not save.');
    else onChanged();
  };

  const completeDay = async (dayId: string) => {
    setErr(null);
    setBusyDay(true);
    const r = await markProgramDayDone(token, dayId);
    setBusyDay(false);
    if (!r.ok) setErr(r.error || 'Could not save.');
    else onChanged();
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto"
      style={{
        background: '#061C2B',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider"
            style={{ ...MONO, color: '#7BA2B5' }}
          >
            <ChevronLeft size={13} /> Home
          </button>
          {data.assigned_by && (
            <span className="text-[9.5px] uppercase tracking-wider" style={{ ...MONO, color: '#6f8698' }}>
              Assigned by {data.assigned_by}
            </span>
          )}
          <button type="button" onClick={onClose} aria-label="Close" style={{ color: '#7BA2B5' }}>
            <X size={16} />
          </button>
        </div>

        <div>
          <h2 className="font-bold" style={{ ...ARCHIVO, color: '#fff', fontSize: 22, letterSpacing: '-0.01em' }}>
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-[12px] mt-0.5" style={{ color: '#8aa0b2' }}>{data.subtitle}</p>
          )}
          <p className="text-[10px] uppercase tracking-wider mt-1" style={{ fontFamily: 'DM Mono, monospace', color: '#7BA2B5' }}>
            Today is {new Date(data.today + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          {view !== 'season' && (data.week_labels?.[String(headerWeek)] || data.week_meta?.[String(headerWeek)]) && (
            <p className="text-[10px] uppercase tracking-wider mt-1" style={{ fontFamily: 'DM Mono, monospace', color: '#FFD166' }}>
              Microcycle {headerWeek}
              {data.week_labels?.[String(headerWeek)] ? ` · ${data.week_labels[String(headerWeek)]}` : ''}
              {data.week_meta?.[String(headerWeek)]?.type ? ` · ${data.week_meta[String(headerWeek)].type}` : ''}
              {data.week_meta?.[String(headerWeek)]?.intensity ? ` · ${data.week_meta[String(headerWeek)].intensity}` : ''}
            </p>
          )}
          {view !== 'season' && data.week_meta?.[String(headerWeek)]?.objective && (
            <p className="text-[11px] mt-0.5 italic" style={{ color: '#8aa0b2' }}>
              {data.week_meta[String(headerWeek)].objective}
            </p>
          )}
        </div>

        {/* Tres niveles de zoom: día · micro · temporada (dale 2026-08-23). */}
        <div className="flex gap-1.5">
          {([['today', 'Today'], ['week', 'Week'], ['season', 'Season']] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              disabled={id === 'today' && !currentDay}
              onClick={() => setView(id)}
              className="flex-1 rounded-full py-2 text-[10px] uppercase tracking-wider font-bold disabled:opacity-30"
              style={{
                ...MONO,
                background: view === id ? '#FFD166' : 'rgba(255,255,255,.06)',
                color: view === id ? '#061C2B' : '#7BA2B5',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {view === 'season' ? (
          <SeasonTimeline
            token={token}
            onJumpWeek={(w) => { setWeek(w); setView('week'); }}
          />
        ) : view === 'today' && currentDay ? (
          <>
            <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#FFD166' }}>
              Micro {currentDay.week_number} · Day {currentDay.day_number} — your session today
            </p>

            {err && (
              <p className="text-[11px] rounded-lg px-3 py-2" style={{ background: 'rgba(255,120,100,.12)', color: '#ffb4a6' }}>
                {err}
              </p>
            )}

            <DayCard
              day={currentDay}
              busyItem={busyItem}
              busyDay={busyDay}
              playing={playing}
              setPlaying={setPlaying}
              onToggleItem={toggleItem}
              onCompleteDay={completeDay}
            />

          </>
        ) : (
        <>
        {/* Semanas */}
        <div className="flex gap-1.5">
          {weekNumbers.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeek(w)}
              className="flex-1 rounded-lg py-1.5 text-[10px] uppercase tracking-wider"
              style={{
                ...MONO,
                background: week === w ? '#00D2FF' : 'rgba(255,255,255,.06)',
                color: week === w ? '#061C2B' : weekDone(w) ? '#39D98A' : '#7BA2B5',
                fontWeight: week === w ? 700 : 400,
              }}
            >
              M{w}{weekDone(w) ? ' ✓' : ''}
            </button>
          ))}
        </div>

        {err && (
          <p className="text-[11px] rounded-lg px-3 py-2" style={{ background: 'rgba(255,120,100,.12)', color: '#ffb4a6' }}>
            {err}
          </p>
        )}

        {/* Días */}
        {weekDays.map((d) => (
          <DayCard
            key={d.id}
            day={d}
            busyItem={busyItem}
            busyDay={busyDay}
            playing={playing}
            setPlaying={setPlaying}
            onToggleItem={toggleItem}
            onCompleteDay={completeDay}
          />
        ))}

        </>
        )}

        {/* Check-in — UNA instancia compartida por ambas vistas (si se
            desmonta al alternar today↔week se pierde lo escrito a medias). */}
        <CheckinCard token={token} data={data} onSaved={onChanged} />

        <p className="text-[9.5px] text-center pb-4" style={{ ...MONO, color: '#4a6272' }}>
          THE SURF SEQUENCE · TRAINING PROGRAM
        </p>
      </div>
    </div>
  );
}

function DayCard({
  day,
  busyItem,
  busyDay,
  playing,
  setPlaying,
  onToggleItem,
  onCompleteDay,
}: {
  day: ProgramDayView;
  busyItem: string | null;
  busyDay: boolean;
  playing: string | null;
  setPlaying: (id: string | null) => void;
  onToggleItem: (item: { id: string; marked: boolean }) => void;
  onCompleteDay: (dayId: string) => void;
}) {
  const base: React.CSSProperties = {
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.08)',
  };
  if (day.current) base.border = '1px solid rgba(255,209,102,.55)';

  return (
    <div className="rounded-2xl p-3.5" style={{ ...base, opacity: day.locked || (day.done && !day.current) ? 0.55 : 1 }}>
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] uppercase tracking-wider"
          style={{ ...MONO, color: day.current ? '#FFD166' : '#7BA2B5' }}
        >
          {day.current ? `Today · Day ${day.day_number}` : `Day ${day.day_number}`} · {day.title}
        </span>
        {day.done && (
          <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: '#39D98A' }}>
            <Check size={11} strokeWidth={2.5} /> done
          </span>
        )}
        {day.locked && <Lock size={11} style={{ color: '#4a6272' }} />}
      </div>

      {(day.current || day.done) && (
        <>
          {day.focus && (
            <p className="text-[11px] mt-1" style={{ color: '#8aa0b2' }}>{day.focus}</p>
          )}
          <div className="mt-2.5 space-y-2">
            {day.items.map((it) => {
              const embed = it.video_url ? toEmbed(it.video_url) : null;
              return (
                <div key={it.id}>
                  <div className="flex items-center gap-2.5">
                    {it.video_url ? (
                      <button
                        type="button"
                        onClick={() => setPlaying(playing === it.id ? null : it.id)}
                        className="shrink-0 rounded-md flex items-center justify-center"
                        style={{ width: 34, height: 24, background: '#123244', border: '1px solid #1C3D4E' }}
                        aria-label={`Play video: ${it.title}`}
                      >
                        <Play size={11} style={{ color: '#00D2FF' }} />
                      </button>
                    ) : (
                      <span className="shrink-0" style={{ width: 34 }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold leading-tight" style={{ color: '#eaf4fa' }}>
                        {it.title}
                      </p>
                      {it.detail && (
                        <p className="text-[10.5px]" style={{ color: '#8aa0b2' }}>{it.detail}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={busyItem === it.id}
                      onClick={() => onToggleItem(it)}
                      className="shrink-0 rounded-md flex items-center justify-center"
                      style={{
                        width: 22,
                        height: 22,
                        background: it.marked ? '#00D2FF' : 'transparent',
                        border: it.marked ? '1.5px solid #00D2FF' : '1.5px solid #2A4D5F',
                      }}
                      aria-label={it.marked ? `Unmark: ${it.title}` : `Mark done: ${it.title}`}
                    >
                      {it.marked && <Check size={13} strokeWidth={3} style={{ color: '#061C2B' }} />}
                    </button>
                  </div>
                  {playing === it.id && embed && (
                    <div className="mt-2 aspect-video rounded-lg overflow-hidden" style={{ background: '#000' }}>
                      <iframe
                        src={embed}
                        title={it.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  {playing === it.id && !embed && it.video_url && (
                    <a
                      href={it.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-1 text-[11px]"
                      style={{ color: '#00D2FF' }}
                    >
                      Open video →
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          {day.current && (
            <button
              type="button"
              disabled={busyDay}
              onClick={() => onCompleteDay(day.id)}
              className="w-full mt-3 rounded-full py-2.5 text-[11px] font-bold tracking-wide"
              style={{ background: '#00D2FF', color: '#061C2B', opacity: busyDay ? 0.6 : 1 }}
            >
              {busyDay ? 'SAVING…' : 'MARK DAY AS DONE ✓'}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function CheckinCard({
  token,
  data,
  onSaved,
}: {
  token: string;
  data: MyProgramData;
  onSaved: () => void;
}) {
  const cfg = data.checkin;
  const t = data.today_checkin;
  const [water, setWater] = useState<number>(t?.water_glasses ?? 0);
  const [sleep, setSleep] = useState<string>(t?.sleep_hours != null ? String(t.sleep_hours) : '');
  const [energy, setEnergy] = useState<number>(t?.energy ?? 0);
  const [comment, setComment] = useState<string>(t?.comment ?? '');
  const [nutrition, setNutrition] = useState<string>(t?.nutrition ?? '');
  const [surfH, setSurfH] = useState<number>(t?.surf_hours != null ? Number(t.surf_hours) : 0);
  const [goal, setGoal] = useState<string>(t?.goal_achieved ?? '');
  const [focus, setFocus] = useState<number>(t?.focus ?? 0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!cfg.water && !cfg.sleep && !cfg.energy && !cfg.comment && !cfg.nutrition) return null;

  const save = async () => {
    setErr(null);
    setSaving(true);
    const sleepNum = sleep.trim() === '' ? null : Number(sleep.replace(',', '.'));
    if (sleepNum != null && !Number.isFinite(sleepNum)) {
      setSaving(false);
      setErr('Sleep must be a number of hours.');
      return;
    }
    const r = await saveProgramCheckin(token, {
      water_glasses: cfg.water ? water : null,
      sleep_hours: cfg.sleep ? sleepNum : null,
      energy: cfg.energy && energy > 0 ? energy : null,
      comment: cfg.comment ? comment : null,
      nutrition: cfg.nutrition ? nutrition : null,
      surf_hours: surfH > 0 || t?.surf_hours != null ? surfH : null,
      goal_achieved: goal || null,
      focus: focus > 0 ? focus : null,
    });
    setSaving(false);
    if (!r.ok) setErr(r.error || 'Could not save.');
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    }
  };

  // Energía en NÚMEROS con rampa de color (pedido Marcelo 2026-08-23:
  // los símbolos se veían feos) — 1 rojo → 4 verde, escala 1-4 del ranking.
  const ENERGY_COLORS = ['#FF6B6B', '#FFD166', '#00D2FF', '#39D98A'];

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(165deg, rgba(255,209,102,.12) 0%, rgba(0,210,255,.05) 70%)',
        border: '1px solid rgba(255,209,102,.45)',
        boxShadow: '0 0 24px rgba(255,209,102,.06) inset',
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: '#FFD166' }}>
          ⚡ Daily check-in
        </p>
        <span className="text-[9px] uppercase tracking-wider" style={{ ...MONO, color: '#7BA2B5' }}>
          Counts for the ranking 🏆
        </span>
      </div>

      {cfg.water && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[12px]" style={{ color: '#b8cad8' }}>Water</span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 8 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setWater(i + 1 === water ? i : i + 1)}
                aria-label={`${i + 1} glasses`}
                className="rounded-full"
                style={{
                  width: 13,
                  height: 13,
                  background: i < water ? '#00D2FF' : 'transparent',
                  border: i < water ? '1px solid #00D2FF' : '1px solid #2A4D5F',
                }}
              />
            ))}
            <span className="text-[11px] font-bold w-7 text-right" style={{ color: '#00D2FF' }}>
              {water}/8
            </span>
          </div>
        </div>
      )}

      {/* 🏄 Horas surfeadas HOY — alimenta sus horas en el agua (paridad HP) */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[12px]" style={{ color: '#b8cad8' }}>Surf today</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSurfH(Math.max(0, Math.round((surfH - 0.5) * 10) / 10))} aria-label="Less surf"
            className="rounded-lg w-8 h-8 text-[15px] font-bold" style={{ background: 'rgba(255,255,255,.07)', color: '#7BA2B5', border: '1px solid #2A4D5F' }}>−</button>
          <span className="text-[13px] font-bold w-12 text-center" style={{ ...MONO, color: surfH > 0 ? '#39D98A' : '#5f7a8c' }}>
            {surfH > 0 ? `${surfH}h` : '0h'}
          </span>
          <button type="button" onClick={() => setSurfH(Math.min(14, Math.round((surfH + 0.5) * 10) / 10))} aria-label="More surf"
            className="rounded-lg w-8 h-8 text-[15px] font-bold" style={{ background: 'rgba(57,217,138,.12)', color: '#39D98A', border: '1px solid rgba(57,217,138,.4)' }}>+</button>
        </div>
      </div>

      {/* 🎯 ¿Se cumplió el objetivo del día? (puntos del ranking: Yes > Halfway) */}
      <div className="flex items-center justify-between mt-3 gap-2">
        <span className="text-[12px] shrink-0" style={{ color: '#b8cad8' }}>Today&apos;s goal</span>
        <div className="flex gap-1.5">
          {([['si', 'Yes ✓', '#39D98A'], ['parcial', 'Halfway', '#FFD166'], ['no', 'Not yet', '#FF6B6B']] as const).map(([v, label, color]) => (
            <button key={v} type="button" onClick={() => setGoal(goal === v ? '' : v)}
              className="rounded-full px-3 py-1.5 text-[10.5px] font-bold"
              style={{
                background: goal === v ? color : 'rgba(255,255,255,.06)',
                color: goal === v ? '#061C2B' : '#7BA2B5',
                border: goal === v ? '1px solid transparent' : '1px solid #2A4D5F',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 🧠 Enfoque 1-4 (misma rampa de color que Energy) */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[12px]" style={{ color: '#b8cad8' }}>Focus</span>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} type="button" onClick={() => setFocus(focus === n ? 0 : n)}
              className="rounded-lg w-9 h-9 text-[13px] font-bold"
              style={{
                background: focus === n ? ['#FF6B6B', '#FFD166', '#00D2FF', '#39D98A'][n - 1] : 'rgba(255,255,255,.06)',
                color: focus === n ? '#061C2B' : ['#FF6B6B', '#FFD166', '#00D2FF', '#39D98A'][n - 1],
                border: `1px solid ${focus === n ? 'transparent' : '#2A4D5F'}`,
              }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {cfg.sleep && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[12px]" style={{ color: '#b8cad8' }}>Sleep</span>
          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Less sleep"
              onClick={() => setSleep(String(Math.max(0, (Number(sleep.replace(',', '.')) || 0) - 0.5)))}
              className="rounded-lg font-bold"
              style={{ ...MONO, width: 28, height: 28, background: 'rgba(255,255,255,.06)', color: '#7BA2B5', border: '1px solid rgba(255,255,255,.14)' }}>−</button>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={14}
              step={0.5}
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              placeholder="7.5"
              aria-label="Hours of sleep"
              className="w-14 rounded-lg px-2 py-1 text-center text-[13px] font-bold"
              style={{ ...MONO, background: 'rgba(255,255,255,.07)', border: '1px solid #2A4D5F', color: '#00D2FF' }}
            />
            <button type="button" aria-label="More sleep"
              onClick={() => setSleep(String(Math.min(14, (Number(sleep.replace(',', '.')) || 0) + 0.5)))}
              className="rounded-lg font-bold"
              style={{ ...MONO, width: 28, height: 28, background: 'rgba(255,255,255,.06)', color: '#7BA2B5', border: '1px solid rgba(255,255,255,.14)' }}>+</button>
            <span className="text-[11px]" style={{ color: '#8aa0b2' }}>h</span>
          </div>
        </div>
      )}

      {cfg.energy && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[12px]" style={{ color: '#b8cad8' }}>Energy</span>
          <div className="flex gap-1.5">
            {ENERGY_COLORS.map((color, i) => {
              const n = i + 1;
              const active = energy === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setEnergy(active ? 0 : n)}
                  aria-label={`Energy ${n} of 4`}
                  className="rounded-xl font-bold transition-all"
                  style={{
                    ...MONO,
                    width: 36,
                    height: 36,
                    fontSize: 14,
                    background: active ? color : 'rgba(255,255,255,.05)',
                    color: active ? '#061C2B' : color,
                    border: `1.5px solid ${active ? color : 'rgba(255,255,255,.14)'}`,
                    transform: active ? 'scale(1.08)' : 'none',
                    boxShadow: active ? `0 0 14px ${color}55` : 'none',
                  }}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {cfg.nutrition && (
        <input
          value={nutrition}
          onChange={(e) => setNutrition(e.target.value)}
          placeholder="What did you eat today?"
          aria-label="Nutrition notes"
          className="w-full mt-3 rounded-lg px-3 py-2 text-[12px]"
          style={{ background: 'rgba(255,255,255,.07)', border: '1px solid #2A4D5F', color: '#eaf4fa' }}
        />
      )}

      {cfg.comment && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment for your coach…"
          aria-label="Comment for your coach"
          rows={2}
          className="w-full mt-3 rounded-lg px-3 py-2 text-[12px]"
          style={{ background: 'rgba(255,255,255,.07)', border: '1px dashed #2A4D5F', color: '#eaf4fa' }}
        />
      )}

      {err && <p className="text-[11px] mt-2" style={{ color: '#ffb4a6' }}>{err}</p>}

      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="w-full mt-3.5 rounded-full py-3 text-[11px] font-bold"
        style={{ ...MONO, letterSpacing: '0.14em', background: saved ? '#39D98A' : 'linear-gradient(90deg, #00D2FF, #35E0FF)', color: '#061C2B', opacity: saving ? 0.6 : 1, boxShadow: saved ? 'none' : '0 4px 18px rgba(0,210,255,.25)' }}
      >
        {saved ? 'SAVED ✓ +POINTS' : saving ? 'SAVING…' : 'SAVE CHECK-IN'}
      </button>
    </div>
  );
}
