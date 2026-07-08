import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { createAdminClient } from '@/lib/supabase/admin';
import { isRealPlatformAdmin } from '@/lib/actions/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Tables that make up the "bitácora" — the full operational record of
// students + coaches + their activity. Exported as both CSV (Excel) and
// JSON (lossless). Platform-admin only.
const TABLES = [
  'students',
  'coaches',
  'academies',
  'camp_instances',
  'camp_participants',
  'student_session_results',
  'survey_responses',
  'student_step_ratings',
  'course_grants',
  'audit_log',
];

// Convert an array of row objects to a CSV string. Handles commas,
// quotes, newlines, nulls, and nested objects (JSON-stringified).
function toCSV(rows: Record<string, any>[]): string {
  if (!rows.length) return '';
  const headerSet = new Set<string>();
  for (const row of rows) {
    for (const k of Object.keys(row)) headerSet.add(k);
  }
  const headers = Array.from(headerSet);
  const escape = (val: any): string => {
    if (val === null || val === undefined) return '';
    let s = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\r\n');
}

async function fetchAll(
  admin: ReturnType<typeof createAdminClient>,
  table: string,
): Promise<Record<string, any>[]> {
  const pageSize = 1000;
  let from = 0;
  const all: Record<string, any>[] = [];
  for (;;) {
    const { data, error } = await admin
      .from(table)
      .select('*')
      .range(from, from + pageSize - 1);
    if (error) {
      console.error(`[export-bitacora] ${table} failed`, error.message);
      break;
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

export async function GET() {
  const real = await isRealPlatformAdmin();
  if (!real) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const zip = new JSZip();
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

  const csvFolder = zip.folder('csv')!;
  const jsonFolder = zip.folder('json')!;
  const manifest: Record<string, number> = {};

  for (const table of TABLES) {
    const rows = await fetchAll(admin, table);
    manifest[table] = rows.length;
    csvFolder.file(`${table}.csv`, toCSV(rows));
    jsonFolder.file(`${table}.json`, JSON.stringify(rows, null, 2));
  }

  zip.file(
    'MANIFEST.txt',
    [
      `The Surf Sequence — Bitácora export`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `Row counts:`,
      ...Object.entries(manifest).map(([t, n]) => `  ${t}: ${n}`),
      ``,
      `Formats: /csv (Excel-ready) and /json (lossless).`,
    ].join('\n'),
  );

  const u8 = await zip.generateAsync({ type: 'uint8array' });
  // Copy into a fresh ArrayBuffer so the type is unambiguously ArrayBuffer
  // (not ArrayBufferLike/SharedArrayBuffer) for the Response body.
  const body = new ArrayBuffer(u8.byteLength);
  new Uint8Array(body).set(u8);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="tss-bitacora-${stamp}.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}
