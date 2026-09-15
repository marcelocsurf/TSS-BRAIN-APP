'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMyTasks, type AcademyTask } from '@/lib/actions/tasks';

const TASK_PINK = '#F472B6';

// Visual month calendar for the coach's services (Fase 2). Days with a service
// get a dot; tap a day to see that day's services below. Complements the agenda
// list. Read-only, reuses the upcoming services already loaded.

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fmtTime(t?: string | null) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10); if (Number.isNaN(hr)) return t;
  return `${hr % 12 || 12}:${m ?? '00'} ${hr >= 12 ? 'PM' : 'AM'}`;
}

export function CoachMiniCalendar({ services, onOpen, token }: {
  services: any[];
  onOpen?: (id: string) => void;
  token?: string;
}) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  // Load the coach's assigned tasks so their due dates show on the calendar too.
  const [tasks, setTasks] = useState<AcademyTask[]>([]);
  useEffect(() => {
    if (!token) return;
    let alive = true;
    getMyTasks(token).then((t) => { if (alive) setTasks(t); }).catch(() => {});
    return () => { alive = false; };
  }, [token]);

  // day 'YYYY-MM-DD' → open tasks due that day.
  const taskByDay = useMemo(() => {
    const map = new Map<string, AcademyTask[]>();
    for (const t of tasks) {
      if (t.status === 'done' || !t.due_date) continue;
      const k = t.due_date.slice(0, 10);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return map;
  }, [tasks]);

  // day 'YYYY-MM-DD' → services active that day (covers multi-day camps).
  const byDay = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const s of services ?? []) {
      const start = s.start_date as string;
      const end = (s.end_date as string) || start;
      if (!start) continue;
      let d = new Date(start + 'T00:00:00');
      const last = new Date(end + 'T00:00:00');
      let guard = 0;
      while (d <= last && guard < 60) {
        const k = iso(d);
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(s);
        d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
        guard++;
      }
    }
    return map;
  }, [services]);

  const [selected, setSelected] = useState<string>(iso(today));

  // Build the month grid starting Monday.
  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Mon=0
    const gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
    return Array.from({ length: 42 }, (_, i) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedServices = byDay.get(selected) ?? [];
  const selectedTasks = taskByDay.get(selected) ?? [];

  return (
    <div className="rounded-lg border border-[#DCD7C6] p-3" style={{ background: '#E9E2D2' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[15px]" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#10263B' }}>{monthLabel}</p>
        <div className="flex gap-1">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="p-1.5 rounded-[5px] text-[#55666E] hover:bg-[#F7F9FA]"><ChevronLeft size={15} /></button>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="p-1.5 rounded-[5px] text-[#55666E] hover:bg-[#F7F9FA]"><ChevronRight size={15} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i} className="text-[10px] font-mono text-[#55666E]">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const k = iso(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const has = byDay.has(k);
          const hasTask = taskByDay.has(k);
          const isToday = k === iso(today);
          const isSel = k === selected;
          return (
            <button
              key={k}
              onClick={() => setSelected(k)}
              className="aspect-square rounded-[5px] flex flex-col items-center justify-center text-[11px] transition-colors"
              style={{
                background: isSel ? '#00D2FF' : has ? 'rgba(0,210,255,.18)' : hasTask ? 'rgba(244,84,162,.14)' : 'transparent',
                color: isSel ? '#061C2B' : inMonth ? '#10263B' : '#B8B1A0',
                border: isToday && !isSel ? '1px solid #00A8CC' : '1px solid transparent',
              }}
            >
              {d.getDate()}
              {(has || hasTask) && (
                <span className="flex gap-0.5 mt-0.5">
                  {has && <span className="w-1 h-1 rounded-full" style={{ background: isSel ? '#061C2B' : '#00A8CC' }} />}
                  {hasTask && <span className="w-1 h-1 rounded-full" style={{ background: isSel ? '#7A2348' : TASK_PINK }} />}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day's services */}
      <div className="mt-3 border-t border-[#DCD7C6] pt-2 space-y-1.5">
        <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: '#00A8CC' }}>
          {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        {selectedServices.length === 0 && selectedTasks.length === 0 ? (
          <p className="text-[11px] text-[#55666E]">Nada agendado este día.</p>
        ) : (
          <>
            {selectedServices.map((s: any) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onOpen?.(s.id)}
                className="w-full text-left rounded-[5px] px-2.5 py-2 bg-[#F7F9FA] border border-[#DCD7C6] hover:bg-white transition-colors"
              >
                <p className="text-[12px] text-[#10263B] font-medium">
                  {s.scheduled_time ? `${fmtTime(s.scheduled_time)} · ` : ''}{s.camp_name}
                </p>
              </button>
            ))}
            {selectedTasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-[5px] px-2.5 py-2"
                style={{ background: 'rgba(244,84,162,.12)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: TASK_PINK }} />
                <p className="text-[12px] font-medium" style={{ color: '#10263B' }}>{t.title}</p>
                <span className="ml-auto text-[9px] font-mono uppercase tracking-wider" style={{ color: TASK_PINK }}>Tarea</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-3 text-[10px] text-[#55666E]">
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: '#00A8CC' }} /> Servicio</span>
        <span className="inline-flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: TASK_PINK }} /> Tarea</span>
      </div>
    </div>
  );
}
