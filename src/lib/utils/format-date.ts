// Human-readable date/time helpers for notifications & emails.
// Date-only strings ('YYYY-MM-DD') are parsed as local midnight so they never
// shift a day in negative-UTC timezones (and on the UTC server the date part
// stays intact).

export function formatServiceDate(
  dateStr: string,
  opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
): string {
  if (!dateStr) return '';
  const d = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? new Date(`${dateStr}T00:00:00`) : new Date(dateStr);
  return d.toLocaleDateString('en-US', opts);
}

// '07:00' or '07:00:00' → '7:00 AM'
export function formatTime(t?: string | null): string {
  if (!t) return '';
  const [hRaw, mRaw] = t.split(':');
  const hour = parseInt(hRaw, 10);
  if (Number.isNaN(hour)) return t;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${mRaw ?? '00'} ${ampm}`;
}

// Build a clear one-line "when" for a service: date (+ range) + time.
export function formatServiceWhen(opts: {
  startDate: string;
  endDate?: string | null;
  scheduledTime?: string | null;
  durationDays?: number | null;
}): string {
  const short: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  let when = formatServiceDate(opts.startDate, short);
  if (opts.endDate && opts.endDate !== opts.startDate) {
    when += ` → ${formatServiceDate(opts.endDate, short)}`;
  }
  const time = formatTime(opts.scheduledTime);
  if (time) when += ` · ${time}`;
  if (opts.durationDays && opts.durationDays > 1 && (!opts.endDate || opts.endDate === opts.startDate)) {
    when += ` · ${opts.durationDays} days`;
  }
  return when;
}
