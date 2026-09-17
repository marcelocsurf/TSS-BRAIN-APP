// ═══ Backup completo de TSS BRAIN — base + archivos ═══
//
// Corre en GitHub Actions cada semana (.github/workflows/backup.yml) y también
// a mano: `node scripts/backup.mjs ./salida`. Necesita en el entorno:
//   NEXT_PUBLIC_SUPABASE_URL   — URL del proyecto
//   SUPABASE_SERVICE_ROLE_KEY  — llave de servicio (salta RLS: lee TODO)
//   SUPABASE_DB_URL (opcional) — si está, además hace un pg_dump real.
//
// Qué produce en <salida>/:
//   db/<tabla>.json     — todas las filas de cada tabla del schema public
//   db/_schema.json     — columnas y tipos de cada tabla (para reconstruir)
//   storage/<bucket>/…  — todos los archivos de todos los buckets
//   MANIFEST.json       — conteos, tamaños y fecha
//   pg_dump.sql.gz      — solo si SUPABASE_DB_URL está definido
//
// Sin dependencias fuera de @supabase/supabase-js (ya está en el proyecto).

import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';

const out = process.argv[2] || './backup-out';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }

const sb = createClient(url, key, { auth: { persistSession: false } });
const PAGE = 1000;
const manifest = { started_at: new Date().toISOString(), tables: {}, storage: {}, errors: [] };

// ── 1. Lista de tablas + columnas (vía una función SQL mínima o PostgREST) ──
// PostgREST no expone information_schema; usamos el endpoint OpenAPI del
// proyecto, que lista todas las tablas del schema public con sus columnas.
async function listTables() {
  const r = await fetch(`${url}/rest/v1/`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!r.ok) throw new Error(`OpenAPI ${r.status}`);
  const spec = await r.json();
  const defs = spec.definitions || {};
  const tables = {};
  for (const [name, def] of Object.entries(defs)) {
    tables[name] = Object.fromEntries(Object.entries(def.properties || {}).map(([c, p]) => [c, p.format || p.type || '']));
  }
  return tables;
}

async function dumpTable(name) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb.from(name).select('*').range(from, from + PAGE - 1);
    if (error) { manifest.errors.push({ table: name, error: error.message }); break; }
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

async function dumpStorage() {
  const { data: buckets, error } = await sb.storage.listBuckets();
  if (error) { manifest.errors.push({ storage: 'listBuckets', error: error.message }); return; }
  for (const b of buckets) {
    let files = 0, bytes = 0;
    const walk = async (prefix) => {
      let offset = 0;
      for (;;) {
        const { data, error } = await sb.storage.from(b.name).list(prefix, { limit: 1000, offset });
        if (error) { manifest.errors.push({ bucket: b.name, prefix, error: error.message }); return; }
        for (const item of data) {
          const path = prefix ? `${prefix}/${item.name}` : item.name;
          if (item.id === null || item.metadata == null) { await walk(path); continue; } // carpeta
          const { data: blob, error: dlErr } = await sb.storage.from(b.name).download(path);
          if (dlErr || !blob) { manifest.errors.push({ bucket: b.name, path, error: dlErr?.message || 'download' }); continue; }
          const dest = join(out, 'storage', b.name, path);
          mkdirSync(dirname(dest), { recursive: true });
          const buf = Buffer.from(await blob.arrayBuffer());
          writeFileSync(dest, buf);
          files++; bytes += buf.length;
        }
        if (data.length < 1000) break;
        offset += 1000;
      }
    };
    await walk('');
    manifest.storage[b.name] = { files, bytes };
    console.log(`storage ${b.name}: ${files} archivos, ${(bytes / 1048576).toFixed(1)} MB`);
  }
}

async function main() {
  mkdirSync(join(out, 'db'), { recursive: true });
  const schema = await listTables();
  writeFileSync(join(out, 'db', '_schema.json'), JSON.stringify(schema, null, 1));
  const names = Object.keys(schema).sort();
  console.log(`${names.length} tablas`);
  for (const t of names) {
    const rows = await dumpTable(t);
    writeFileSync(join(out, 'db', `${t}.json`), JSON.stringify(rows));
    manifest.tables[t] = rows.length;
  }
  await dumpStorage();

  if (process.env.SUPABASE_DB_URL) {
    try {
      execSync(`pg_dump --no-owner --no-privileges "${process.env.SUPABASE_DB_URL}" | gzip > "${join(out, 'pg_dump.sql.gz')}"`, { stdio: 'inherit', shell: '/bin/bash' });
      manifest.pg_dump = true;
    } catch (e) { manifest.errors.push({ pg_dump: String(e.message).slice(0, 200) }); }
  }

  manifest.finished_at = new Date().toISOString();
  manifest.total_rows = Object.values(manifest.tables).reduce((a, b) => a + b, 0);
  writeFileSync(join(out, 'MANIFEST.json'), JSON.stringify(manifest, null, 1));
  console.log(`filas: ${manifest.total_rows} · errores: ${manifest.errors.length}`);
  if (manifest.errors.length) { console.error(JSON.stringify(manifest.errors, null, 1)); }
  // Un backup con errores de lectura NO cuenta como backup: que el workflow falle y avise.
  process.exit(manifest.errors.length ? 2 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
