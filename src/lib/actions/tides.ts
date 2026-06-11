'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { isRealPlatformAdmin } from './auth';
import { revalidatePath } from 'next/cache';

export interface TideEvent {
  event_date: string;
  event_time: string;   // "HH:MM"
  event_type: 'high' | 'low';
  height_m: number | null;
}

export interface MidTideWindow {
  time: string;          // "HH:MM" — the mid-tide moment
  direction: 'rising' | 'falling';
  from: string;          // e.g. "low 03:24"
  to: string;            // e.g. "high 09:41"
}

const SPOT = 'la_libertad';

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}
function fromMinutes(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = Math.round(min % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export async function getTidesForDate(date: string): Promise<TideEvent[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('tide_events')
    .select('event_date, event_time, event_type, height_m')
    .eq('spot', SPOT)
    .eq('event_date', date)
    .order('event_time');
  return (data ?? []).map((t: any) => ({
    event_date: t.event_date,
    event_time: (t.event_time as string).slice(0, 5),
    event_type: t.event_type,
    height_m: t.height_m,
  }));
}

// Mid-tide = halfway in time between a high and an adjacent low. Tide is
// roughly sinusoidal so the mid-height crossing lands near the time
// midpoint — close enough for planning a whitewater lesson.
export async function getMidTideWindows(date: string): Promise<MidTideWindow[]> {
  const tides = await getTidesForDate(date);
  const windows: MidTideWindow[] = [];
  for (let i = 0; i < tides.length - 1; i++) {
    const a = tides[i];
    const b = tides[i + 1];
    if (a.event_type === b.event_type) continue;
    const mid = fromMinutes((toMinutes(a.event_time) + toMinutes(b.event_time)) / 2);
    windows.push({
      time: mid,
      direction: a.event_type === 'low' ? 'rising' : 'falling',
      from: `${a.event_type} ${a.event_time}`,
      to: `${b.event_type} ${b.event_time}`,
    });
  }
  return windows;
}

// Suggest the mid-tide window closest to (and ideally after) a target
// time on a date. Used when scheduling a whitewater / Discover Surfing
// lesson. Returns null if no tide data for that day.
export async function suggestMidTide(
  date: string,
  afterTime?: string,
): Promise<MidTideWindow | null> {
  const windows = await getMidTideWindows(date);
  if (windows.length === 0) return null;
  if (!afterTime) return windows[0];
  const target = toMinutes(afterTime);
  const upcoming = windows.filter((w) => toMinutes(w.time) >= target);
  if (upcoming.length > 0) return upcoming[0];
  // else nearest overall
  return windows.reduce((best, w) =>
    Math.abs(toMinutes(w.time) - target) < Math.abs(toMinutes(best.time) - target) ? w : best,
  );
}

// Import a year's tide table. Accepts rows of:
//   "YYYY-MM-DD, HH:MM, high|low, height_m"
// (height optional). Idempotent via the unique (spot,date,time) index.
export async function importTides(
  raw: string,
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const real = await isRealPlatformAdmin();
  if (!real) throw new Error('Platform admin only.');

  const admin = createAdminClient();
  const errors: string[] = [];
  const rows: Record<string, unknown>[] = [];

  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    const parts = line.split(/[,\t]/).map((p) => p.trim());
    if (parts.length < 3) { errors.push(`Bad row: ${line}`); continue; }
    const [date, time, type, height] = parts;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { errors.push(`Bad date: ${line}`); continue; }
    if (!/^\d{1,2}:\d{2}$/.test(time)) { errors.push(`Bad time: ${line}`); continue; }
    const t = type.toLowerCase();
    if (t !== 'high' && t !== 'low') { errors.push(`Bad type: ${line}`); continue; }
    rows.push({
      spot: SPOT,
      event_date: date,
      event_time: time,
      event_type: t,
      height_m: height ? Number(height) : null,
    });
  }

  let imported = 0;
  // Insert in chunks, ignoring duplicates.
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error, count } = await admin
      .from('tide_events')
      .upsert(chunk, { onConflict: 'spot,event_date,event_time', count: 'exact', ignoreDuplicates: false });
    if (error) errors.push(error.message);
    else imported += count ?? chunk.length;
  }

  revalidatePath('/dashboard');
  return { imported, skipped: lines.length - rows.length, errors };
}

export async function getTideDataRange(): Promise<{ min: string | null; max: string | null; count: number }> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('tide_events')
    .select('event_date')
    .eq('spot', SPOT)
    .order('event_date');
  if (!data || data.length === 0) return { min: null, max: null, count: 0 };
  return { min: data[0].event_date, max: data[data.length - 1].event_date, count: data.length };
}
