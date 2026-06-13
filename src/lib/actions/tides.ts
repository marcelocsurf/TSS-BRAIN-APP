'use server';

// Tides for La Libertad, El Salvador. Read from a pre-baked JSON file
// bundled with the app (no API, no DB) — predictions for 2026-01-01 →
// 2027-12-31. Times are local El Salvador (UTC-6, no DST).
import tideData from '@/data/tides-la-libertad.json';

export interface TideEvent {
  event_time: string;   // "HH:MM"
  event_type: 'high' | 'low';
  height_m: number | null;
}

export interface MidTideWindow {
  time: string;          // "HH:MM" — the mid-tide moment
  direction: 'rising' | 'falling';
  from: string;
  to: string;
}

type RawDay = { hora: string; tipo: string; altura_m: number | null }[];
const DIAS = (tideData as any).dias as Record<string, RawDay>;
const COVER = (tideData as any).cobertura as { desde: string; hasta: string };

function toMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}
function fromMinutes(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = Math.round(min % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Today's date in El Salvador time (UTC-6, no DST) as YYYY-MM-DD.
export async function getElSalvadorToday(): Promise<string> {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/El_Salvador',
  }).format(new Date());
}

export async function getTidesForDate(date: string): Promise<TideEvent[]> {
  const day = DIAS[date];
  if (!day) return [];
  return day.map((e) => ({
    event_time: e.hora,
    event_type: e.tipo === 'pleamar' ? 'high' : 'low',
    height_m: e.altura_m ?? null,
  }));
}

// Mid-tide = halfway in time between a high and an adjacent low. Used to
// suggest when to run a whitewater / Discover Surfing lesson.
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
  return windows.reduce((best, w) =>
    Math.abs(toMinutes(w.time) - target) < Math.abs(toMinutes(best.time) - target) ? w : best,
  );
}

export async function getTideDataRange(): Promise<{ min: string | null; max: string | null; count: number }> {
  return { min: COVER?.desde ?? null, max: COVER?.hasta ?? null, count: Object.keys(DIAS).length };
}
