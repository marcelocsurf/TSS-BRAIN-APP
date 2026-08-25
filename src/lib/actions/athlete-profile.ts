'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// ═══ MI PERFIL del atleta (paridad app HP, 2026-08-23) ═══
// El atleta llena/actualiza SU ficha técnica desde su portal: wizard la
// primera vez, y "qué te falta" cuando ya tiene datos. Escribe en
// hp_athlete_profiles (la MISMA ficha que ve el staff en el cockpit) y la
// foto en students.photo_url — una sola fuente, cero duplicación.
// El % usa el MISMO checklist de 10 campos que el cockpit (hp-cockpit.ts).

const EDITABLE_TEXT = [
  'blood_type', 'dui', 'passport_number', 'emergency_relationship', 'emergency_phone_alt',
  'insurance_provider', 'insurance_number', 'doctor_name', 'doctor_phone',
  'medications', 'injury', 'sponsors', 'palmares_historico', 'why_train',
  'goal_short_term', 'goal_mid_term', 'goal_long_term',
] as const;
const EDITABLE_NUM = ['height_cm', 'weight_kg'] as const;
const EDITABLE_DATE = ['passport_expiry_date'] as const;

export interface MyProfileData {
  first_name: string;
  photo_url: string | null;
  fields: Record<string, string | number | null>;
  pct: number;
  missing: string[]; // labels EN para el atleta
  first_time: boolean; // 0 campos del checklist llenos → wizard completo
}

function checklist(p: any): { label: string; ok: boolean }[] {
  const has = (v: unknown) => v != null && String(v).trim() !== '';
  return [
    { label: 'height', ok: has(p?.height_cm) },
    { label: 'weight', ok: has(p?.weight_kg) },
    { label: 'blood type', ok: has(p?.blood_type) },
    { label: 'ID (DUI)', ok: has(p?.dui) },
    { label: 'passport', ok: has(p?.passport_number) },
    { label: 'passport expiry', ok: has(p?.passport_expiry_date) },
    { label: 'emergency contact', ok: has(p?.emergency_relationship) },
    { label: 'insurance', ok: has(p?.insurance_provider) },
    { label: 'doctor', ok: has(p?.doctor_name) },
    { label: 'goals', ok: has(p?.goal_short_term) || has(p?.goal_mid_term) || has(p?.goal_long_term) },
  ];
}

async function resolveEligibleStudent(portalToken: string) {
  if (!portalToken) return null;
  const admin = createAdminClient();
  const { data: student, error } = await admin
    .from('students')
    .select('id, first_name, photo_url, hp_access')
    .eq('portal_token', portalToken)
    .maybeSingle();
  if (error) throw error;
  if (!student) return null;

  // Elegible = tiene el ACCESO de Alto Rendimiento otorgado. Antes se deducía
  // ("temporada activa o ficha HP ya existente") y fallaba por los dos lados:
  //  · dejaba LEER y sobre todo ESCRIBIR la ficha a 4 alumnos que no son
  //    atletas — su fila hp_athlete_profiles se había creado de paso, que es
  //    justo lo que la migración 00168 vino a dejar de contar;
  //  · y al atleta recién otorgado, que todavía no tiene ni temporada ni
  //    ficha, le respondía "Not available for this account." — o sea, dar el
  //    acceso NO encendía su ficha, que es la primera tarjeta de su Home.
  // Invariante #3: el token + admin client saltea RLS, así que el candado ES
  // esta línea.
  if ((student as any).hp_access !== true) return null;

  const { data: profile, error: pErr } = await admin
    .from('hp_athlete_profiles').select('*').eq('student_id', student.id).maybeSingle();
  // Un fallo transitorio acá NO puede degradar a "no elegible": la tarjeta
  // desaparecería y los guardados fallarían en silencio para un atleta real.
  if (pErr) throw pErr;
  return { admin, student, profile };
}

export async function getMyAthleteProfile(portalToken: string): Promise<{ ok: boolean; data: MyProfileData | null }> {
  try {
    const ctx = await resolveEligibleStudent(portalToken);
    if (!ctx) return { ok: true, data: null };
    const { student, profile } = ctx;
    const check = checklist(profile);
    const done = check.filter((c) => c.ok).length;

    const fields: Record<string, string | number | null> = {};
    for (const k of [...EDITABLE_TEXT, ...EDITABLE_NUM, ...EDITABLE_DATE]) {
      fields[k] = (profile as any)?.[k] ?? null;
    }
    return {
      ok: true,
      data: {
        first_name: (student as any).first_name ?? 'there',
        photo_url: (student as any).photo_url ?? null,
        fields,
        pct: Math.round((done / check.length) * 100),
        missing: check.filter((c) => !c.ok).map((c) => c.label),
        first_time: done === 0,
      },
    };
  } catch (e) {
    console.error('[athlete-profile] get failed', e);
    return { ok: false, data: null };
  }
}

export async function saveMyAthleteProfile(
  portalToken: string,
  patch: Record<string, string | number | null>,
): Promise<{ ok: boolean; error?: string; pct?: number; missing?: string[] }> {
  try {
    const ctx = await resolveEligibleStudent(portalToken);
    if (!ctx) return { ok: false, error: 'Not available for this account.' };
    const { admin, student } = ctx;

    const clean: Record<string, unknown> = {};
    for (const k of EDITABLE_TEXT) {
      if (k in patch) {
        const v = patch[k];
        clean[k] = v == null || String(v).trim() === '' ? null : String(v).trim().slice(0, k === 'palmares_historico' || k === 'why_train' ? 2000 : 200);
      }
    }
    for (const k of EDITABLE_NUM) {
      if (k in patch) {
        const n = patch[k] == null || patch[k] === '' ? null : Number(patch[k]);
        if (n != null && (!Number.isFinite(n) || n < 0 || n > 500)) return { ok: false, error: 'Invalid number.' };
        clean[k] = n;
      }
    }
    for (const k of EDITABLE_DATE) {
      if (k in patch) {
        const v = patch[k];
        if (v != null && v !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(String(v))) return { ok: false, error: 'Invalid date.' };
        clean[k] = v || null;
      }
    }
    if (Object.keys(clean).length === 0) return { ok: false, error: 'Nothing to save.' };

    const { error } = await admin
      .from('hp_athlete_profiles')
      .upsert({ student_id: student.id, ...clean, updated_at: new Date().toISOString() }, { onConflict: 'student_id' });
    if (error) throw error;

    const { data: fresh, error: fErr } = await admin.from('hp_athlete_profiles').select('*').eq('student_id', student.id).maybeSingle();
    if (fErr) throw fErr; // sin re-lectura confiable, mejor error que pct=0 fantasma
    const check = checklist(fresh);
    const done = check.filter((c) => c.ok).length;
    return { ok: true, pct: Math.round((done / check.length) * 100), missing: check.filter((c) => !c.ok).map((c) => c.label) };
  } catch (e) {
    console.error('[athlete-profile] save failed', e);
    return { ok: false, error: 'Could not save. Try again.' };
  }
}

// Foto de perfil del atleta — mismo bucket/path que el dashboard
// (avatars / students/{id}.{ext}) para que sea LA misma foto en todos lados.
export async function uploadMyAvatar(
  portalToken: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string; url?: string }> {
  try {
    const ctx = await resolveEligibleStudent(portalToken);
    if (!ctx) return { ok: false, error: 'Not available for this account.' };
    const { admin, student } = ctx;

    const file = formData.get('file') as File | null;
    if (!file || typeof file === 'string') return { ok: false, error: 'Pick a photo first.' };
    if (file.size > 5 * 1024 * 1024) return { ok: false, error: 'Max 5MB — try a smaller photo.' };

    // Allowlist estricta: file.type viene del cliente y un SVG con <script>
    // servido como image/svg+xml desde el bucket público es XSS almacenado.
    // El contentType se deriva ACÁ, nunca del request.
    const MIME_EXT: Record<string, string> = {
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
      'image/heic': 'heic', 'image/heif': 'heif',
    };
    const ext = MIME_EXT[file.type];
    if (!ext) return { ok: false, error: 'Use a JPG, PNG or phone photo.' };
    const path = `students/${(student as any).id}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await admin.storage.from('avatars').upload(path, buf, { upsert: true, contentType: file.type });
    if (upErr) throw upErr;
    // Fotos previas con otra extensión quedarían públicas para siempre:
    // se limpian best-effort (nada de esto puede tumbar el upload que ya salió).
    const others = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif', 'svg'].filter((e) => e !== ext)
      .map((e) => `students/${(student as any).id}.${e}`);
    try { await admin.storage.from('avatars').remove(others); } catch { /* best-effort */ }
    const { data: pub } = admin.storage.from('avatars').getPublicUrl(path);
    const url = `${pub.publicUrl}?t=${Date.now()}`;

    const { error: uErr } = await admin.from('students').update({ photo_url: url }).eq('id', (student as any).id);
    if (uErr) throw uErr;
    return { ok: true, url };
  } catch (e) {
    console.error('[athlete-profile] avatar failed', e);
    return { ok: false, error: 'Could not upload the photo. Try again.' };
  }
}
