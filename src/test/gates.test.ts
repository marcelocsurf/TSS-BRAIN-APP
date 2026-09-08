// ═══ Compuertas: quién puede ver o hacer qué ═══
// Cada prueba usa un Supabase de mentira (fake-supabase.ts). Lo que importa
// acá no es que "funcione", sino que lo prohibido NO pase y NO escriba nada.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeSupabase, type FakeSupabase } from './fake-supabase';

let fake: FakeSupabase;
let coach: any = null;

vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => fake }));
vi.mock('@/lib/supabase/server', () => ({ createClient: async () => fake }));
vi.mock('@/lib/actions/auth', () => ({ getCurrentCoach: async () => coach, getCoachAccessibleStudentIds: async () => [] }));
vi.mock('next/cache', () => ({ revalidatePath: () => {} }));
vi.mock('next/navigation', () => ({ redirect: () => { throw new Error('redirect'); }, notFound: () => { throw new Error('notFound'); } }));
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': '203.0.113.9', 'user-agent': 'vitest' }),
  cookies: async () => ({ get: () => undefined, getAll: () => [], set: () => {} }),
}));
const grantBookAccess = vi.fn();
vi.mock('@/lib/actions/book-purchase', () => ({ grantBookAccess: (...a: any[]) => grantBookAccess(...a) }));
vi.mock('@/lib/actions/course-grants', () => ({ activatePendingCoursesForStudent: async () => {} }));
vi.mock('@/lib/actions/notifications', () => ({ createNotification: async () => {} }));
vi.mock('@/lib/actions/email', () => ({}));
vi.mock('@/lib/utils/student-match', () => ({ findLikelySamePerson: async () => null }));

const STUDENT = 'abb7e472-ab27-47a6-bac2-c6f68480dc4e';
const TOKEN = 'aefc3dcc-96cd-4a48-99b8-77152ff3b090';
const BOOK = 'f50677a2-72b1-4abd-9335-fe0c99c80333';

beforeEach(() => {
  coach = null;
  grantBookAccess.mockReset();
  fake = fakeSupabase({
    students: [{ id: STUDENT, portal_token: TOKEN, first_name: 'Test', email: 't@example.com', academy_id: 'acad-1', status: 'active', terms_accepted_at: null, terms_version: null, medical_notes: 'asma', photo_url: null }],
    coach_resources: [{ id: BOOK, title: 'One Wave', active: true, audience: 'both', storage_path: 'one-wave.pdf', file_url: '' }],
    student_resource_grants: [],
    coach_resource_grants: [],
    coaches: [],
    access_codes: [],
    audit_log: [],
  });
});

// ── Libro / materiales: /api/materials/[token]/[id] ──
describe('materials route — el PDF solo sale con token válido + grant', () => {
  const load = () => import('@/app/api/materials/[token]/[id]/route');
  const call = async (token: string, id: string) => {
    const { GET } = await load();
    return GET(new Request('http://x/api/materials'), { params: { token, id } });
  };
  it('token inexistente → 404', async () => {
    expect((await call('11111111-1111-1111-1111-111111111111', BOOK)).status).toBe(404);
  });
  it('alumno sin grant → 404', async () => {
    expect((await call(TOKEN, BOOK)).status).toBe(404);
  });
  it('alumno con grant PERO sin ticket → 404 (el link solo ya no sirve)', async () => {
    fake.tables.student_resource_grants.push({ student_id: STUDENT, resource_id: BOOK });
    expect((await call(TOKEN, BOOK)).status).toBe(404);
  });
  it('alumno con grant + ticket vigente → 200 y sin caché compartida', async () => {
    const { signMaterialTicket } = await import('@/lib/materials/ticket');
    fake.tables.student_resource_grants.push({ student_id: STUDENT, resource_id: BOOK });
    const { GET } = await load();
    const r = await GET(new Request(`http://x/api/materials?t=${signMaterialTicket(STUDENT, BOOK)}`), { params: { token: TOKEN, id: BOOK } });
    expect(r.status).toBe(200);
    expect(r.headers.get('cache-control')).toContain('no-store');
  });
  it('ticket vencido, de otro alumno o de otro material → 404', async () => {
    const { signMaterialTicket } = await import('@/lib/materials/ticket');
    fake.tables.student_resource_grants.push({ student_id: STUDENT, resource_id: BOOK });
    const { GET } = await load();
    const hit = async (t: string) => (await GET(new Request(`http://x/api/materials?t=${t}`), { params: { token: TOKEN, id: BOOK } })).status;
    expect(await hit(signMaterialTicket(STUDENT, BOOK, Date.now() - 11 * 60 * 1000))).toBe(404);
    expect(await hit(signMaterialTicket('otro-alumno', BOOK))).toBe(404);
    expect(await hit(signMaterialTicket(STUDENT, 'otro-material'))).toBe(404);
    expect(await hit('basura')).toBe(404);
  });
  it('openMaterial: sin grant no da ticket; con grant da URL con ticket', async () => {
    const { openMaterial } = await import('@/lib/actions/materials');
    expect((await openMaterial(TOKEN, BOOK)).ok).toBe(false);
    fake.tables.student_resource_grants.push({ student_id: STUDENT, resource_id: BOOK });
    const r = await openMaterial(TOKEN, BOOK);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.url).toMatch(new RegExp(`^/api/materials/${TOKEN}/${BOOK}\\?t=\\d+\\.[0-9a-f]{64}$`));
  });
  it('material solo para coaches nunca sale a un alumno, aunque tenga grant', async () => {
    fake.tables.coach_resources[0].audience = 'coaches';
    fake.tables.student_resource_grants.push({ student_id: STUDENT, resource_id: BOOK });
    expect((await call(TOKEN, BOOK)).status).toBe(404);
  });
  it('recurso desactivado → 404', async () => {
    fake.tables.coach_resources[0].active = false;
    fake.tables.student_resource_grants.push({ student_id: STUDENT, resource_id: BOOK });
    expect((await call(TOKEN, BOOK)).status).toBe(404);
  });
  it('ids con formato inválido → 404 sin tocar la base', async () => {
    expect((await call('abc', 'def')).status).toBe(404);
    expect(fake.ops.length).toBe(0);
  });
});

// ── Link de regalo del libro ──
describe('book gift — un solo uso, nunca otorga sin código válido', () => {
  it('estados: not_found / used / expired / valid', async () => {
    const { validateBookGift } = await import('@/lib/actions/book-gift');
    expect(await validateBookGift('TSS-OW-NADA-0000')).toBe('not_found');
    fake.tables.access_codes.push({ code: 'TSS-OW-USED-0001', product_type: 'one_wave', used_by: 'x', expires_at: null });
    fake.tables.access_codes.push({ code: 'TSS-OW-EXPD-0001', product_type: 'one_wave', used_by: null, expires_at: '2020-01-01' });
    fake.tables.access_codes.push({ code: 'TSS-OW-OK00-0001', product_type: 'one_wave', used_by: null, expires_at: null });
    fake.tables.access_codes.push({ code: 'TSS-WB-OK00-0001', product_type: 'white_belt', used_by: null, expires_at: null });
    expect(await validateBookGift('tss-ow-used-0001')).toBe('used');
    expect(await validateBookGift('TSS-OW-EXPD-0001')).toBe('expired');
    expect(await validateBookGift('TSS-OW-OK00-0001')).toBe('valid');
    expect(await validateBookGift('TSS-WB-OK00-0001')).toBe('not_found');
  });
  it('código usado o email inválido → no llama a grantBookAccess ni escribe', async () => {
    const { redeemBookGift } = await import('@/lib/actions/book-gift');
    fake.tables.access_codes.push({ code: 'TSS-OW-USED-0001', product_type: 'one_wave', used_by: 'x', expires_at: null });
    const r1 = await redeemBookGift('TSS-OW-USED-0001', { firstName: 'Ana', email: 'ana@example.com' });
    expect(r1.ok).toBe(false);
    const r2 = await redeemBookGift('TSS-OW-OK00-0001', { firstName: 'Ana', email: 'no-es-email' });
    expect(r2.ok).toBe(false);
    expect(grantBookAccess).not.toHaveBeenCalled();
    expect(fake.writes().length).toBe(0);
  });
  it('código válido → otorga con source gift:<código> y lo marca usado', async () => {
    const { redeemBookGift } = await import('@/lib/actions/book-gift');
    fake.tables.access_codes.push({ code: 'TSS-OW-OK00-0001', product_type: 'one_wave', used_by: null, expires_at: null });
    grantBookAccess.mockResolvedValue({ ok: true, portal_url: 'https://app/portal/x', student_id: 'stu-1' });
    const r = await redeemBookGift('tss-ow-ok00-0001', { firstName: 'Ana', lastName: 'García', email: 'Ana@Example.com' });
    expect(r.ok).toBe(true);
    expect(grantBookAccess).toHaveBeenCalledWith(expect.objectContaining({ email: 'ana@example.com', source: 'gift:TSS-OW-OK00-0001' }));
    expect(fake.tables.access_codes[0].used_by).toBeTruthy();
  });
});

// ── Términos + privacidad ──
describe('legal — aceptación de términos', () => {
  it('token inválido no escribe', async () => {
    const { acceptTerms } = await import('@/lib/actions/legal');
    expect((await acceptTerms('nope')).ok).toBe(false);
    expect((await acceptTerms('11111111-1111-1111-1111-111111111111')).ok).toBe(false);
    expect(fake.writes().length).toBe(0);
  });
  it('token válido guarda versión, fecha, IP y navegador; y ya no pide aceptar', async () => {
    const { acceptTerms, needsTermsAcceptance } = await import('@/lib/actions/legal');
    const { CURRENT_LEGAL_VERSION } = await import('@/lib/legal/versions');
    expect(await needsTermsAcceptance(STUDENT)).toBe(true);
    expect((await acceptTerms(TOKEN)).ok).toBe(true);
    const s = fake.tables.students[0];
    expect(s.terms_version).toBe(CURRENT_LEGAL_VERSION);
    expect(s.terms_accepted_at).toBeTruthy();
    expect(s.consent_ip).toBe('203.0.113.9');
    expect(s.consent_user_agent).toBe('vitest');
    expect(await needsTermsAcceptance(STUDENT)).toBe(false);
  });
  it('si cambia la versión, vuelve a pedir', async () => {
    const { needsTermsAcceptance } = await import('@/lib/actions/legal');
    fake.tables.students[0].terms_accepted_at = '2026-01-01';
    fake.tables.students[0].terms_version = 'vieja';
    expect(await needsTermsAcceptance(STUDENT)).toBe(true);
  });
});

// ── Anonimización ──
describe('anonymizeStudent — solo admin/coordinador de la academia, y borra lo que identifica', () => {
  it('sin sesión → no autorizado y sin escrituras', async () => {
    const { anonymizeStudent } = await import('@/lib/actions/students');
    const r = await anonymizeStudent(STUDENT, 'pedido por email 2026-09-05');
    expect(r.ok).toBe(false);
    expect(fake.writes().length).toBe(0);
  });
  it('coordinador de OTRA academia → denegado', async () => {
    coach = { id: 'c1', display_name: 'Coord', role: 'coordinator', academy_id: 'acad-2', is_platform_admin: false };
    const { anonymizeStudent } = await import('@/lib/actions/students');
    expect((await anonymizeStudent(STUDENT, 'pedido por email')).ok).toBe(false);
    expect(fake.writes().length).toBe(0);
  });
  it('coach normal → denegado', async () => {
    coach = { id: 'c1', display_name: 'Coach', role: 'coach', academy_id: 'acad-1', is_platform_admin: false };
    const { anonymizeStudent } = await import('@/lib/actions/students');
    expect((await anonymizeStudent(STUDENT, 'pedido por email')).ok).toBe(false);
  });
  it('sin motivo → denegado', async () => {
    coach = { id: 'c1', display_name: 'Admin', role: 'admin', academy_id: null, is_platform_admin: true };
    const { anonymizeStudent } = await import('@/lib/actions/students');
    expect((await anonymizeStudent(STUDENT, 'x')).ok).toBe(false);
    expect(fake.writes().length).toBe(0);
  });
  it('admin de plataforma → borra identidad y salud, rota el token, deja auditoría', async () => {
    coach = { id: 'c1', display_name: 'Admin', role: 'admin', academy_id: null, is_platform_admin: true };
    const { anonymizeStudent } = await import('@/lib/actions/students');
    expect((await anonymizeStudent(STUDENT, 'pedido por email 2026-09-05')).ok).toBe(true);
    const s = fake.tables.students[0];
    expect(s.first_name).toBe('Deleted');
    expect(s.email).toBeNull();
    expect(s.medical_notes).toBeNull();
    expect(s.portal_token).not.toBe(TOKEN);
    expect(s.anonymized_at).toBeTruthy();
    expect(s.status).toBe('archived');
    expect(fake.tables.audit_log[0].event_type).toBe('student_anonymized');
    // Dos veces no: ya está anonimizada.
    expect((await anonymizeStudent(STUDENT, 'otra vez')).ok).toBe(false);
  });
  it('coordinador de la MISMA academia → permitido', async () => {
    coach = { id: 'c1', display_name: 'Coord', role: 'coordinator', academy_id: 'acad-1', is_platform_admin: false };
    const { anonymizeStudent } = await import('@/lib/actions/students');
    expect((await anonymizeStudent(STUDENT, 'pedido en persona')).ok).toBe(true);
  });
});

// ── Consentimientos en el intake ──
describe('submitBasicIntake — sin consentimiento de salud o términos no guarda', () => {
  const base = { last_name: 'Prueba', shirt_size: 'M', allergies: 'none', emergency_contact_name: 'Mamá', emergency_contact_phone: '7000', swim_level: 'strong', waiver_signed: true, date_of_birth: '1990-01-01' } as any;
  it('apellido, talla y alergias son obligatorios (pedido del equipo 2026-09-05)', async () => {
    const { submitBasicIntake } = await import('@/lib/actions/intake');
    const ok = { health_data_consent: true, terms_accepted: true };
    await expect(submitBasicIntake(TOKEN, { ...base, ...ok, last_name: '' })).rejects.toThrow(/Last name/);
    await expect(submitBasicIntake(TOKEN, { ...base, ...ok, shirt_size: '' })).rejects.toThrow(/size/);
    await expect(submitBasicIntake(TOKEN, { ...base, ...ok, allergies: '  ' })).rejects.toThrow(/Allergies/);
    expect(fake.writes().length).toBe(0);
  });
  it('falta consentimiento de salud', async () => {
    const { submitBasicIntake } = await import('@/lib/actions/intake');
    await expect(submitBasicIntake(TOKEN, { ...base, terms_accepted: true })).rejects.toThrow(/health/);
    expect(fake.writes().length).toBe(0);
  });
  it('faltan términos', async () => {
    const { submitBasicIntake } = await import('@/lib/actions/intake');
    await expect(submitBasicIntake(TOKEN, { ...base, health_data_consent: true })).rejects.toThrow(/Terms/);
    expect(fake.writes().length).toBe(0);
  });
  it('con todo → guarda fechas de consentimiento, versión e IP; imagen queda en false si no se marcó', async () => {
    const { submitBasicIntake } = await import('@/lib/actions/intake');
    await submitBasicIntake(TOKEN, { ...base, health_data_consent: true, terms_accepted: true });
    const s = fake.tables.students[0];
    expect(s.health_data_consent_at).toBeTruthy();
    expect(s.terms_accepted_at).toBeTruthy();
    expect(s.media_release_consent).toBe(false);
    expect(s.consent_ip).toBe('203.0.113.9');
  });
});

// ── QR de clases: perfil nuevo ──
describe('publicEnroll — perfil nuevo exige waiver + salud + términos', () => {
  const input = () => ({
    slug: 'puro', campId: 'camp-1', email: 'nueva@example.com', studentId: null, force_new_person: false, coupon: null,
    profile: { first_name: 'Nueva', last_name: 'Persona', phone: null, emergency_contact_name: 'X', emergency_contact_phone: '1', medical_notes: 'none', date_of_birth: '1995-05-05', shirt_size: 'M', languages: 'English' },
    accept_waiver: true, signed_name: 'Nueva Persona',
  });
  beforeEach(() => {
    fake.tables.academies = [{ id: 'acad-1', name: 'Puro', slug: 'puro', archived_at: null }];
    // Clase de un día, futura, con cupo (el join a camp_templates se embebe como objeto).
    fake.tables.camp_instances = [{ id: 'camp-1', academy_id: 'acad-1', camp_name: 'Yoga', start_date: '2099-01-01', end_date: '2099-01-01', scheduled_time: '09:00', capacity_override: null, template_id: 't1', camp_templates: { template_name: 'Yoga', service_kind: 'class', capacity_max: 10 }, camp_participants: [] }];
  });
  it('sin consentimiento de salud → error y sin alumno creado', async () => {
    const { publicEnroll } = await import('@/lib/actions/public-classes');
    const r = await publicEnroll({ ...input(), accept_terms: true } as any);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/health/);
    expect(fake.tables.students.length).toBe(1);
  });
  it('sin términos → error', async () => {
    const { publicEnroll } = await import('@/lib/actions/public-classes');
    const r = await publicEnroll({ ...input(), health_consent: true } as any);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Terms/);
  });
  it('menor sin tutor → error', async () => {
    const { publicEnroll } = await import('@/lib/actions/public-classes');
    const i = input(); i.profile.date_of_birth = '2015-05-05';
    const r = await publicEnroll({ ...i, health_consent: true, accept_terms: true } as any);
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/guardian/);
  });
});

// ── Registro y progreso: curso o membresía. El libro solo, no. ──
describe('acceso del alumno — el que solo tiene el libro no registra', () => {
  it('sin curso ni membresía → canTrack false', async () => {
    const { getStudentAccess } = await import('@/lib/portal/access');
    fake.tables.memberships = [];
    const a = await getStudentAccess(STUDENT);
    expect(a).toEqual({ hasCourse: false, membershipActive: false, canTrack: false });
  });
  it('con curso white → canTrack', async () => {
    const { getStudentAccess } = await import('@/lib/portal/access');
    fake.tables.students[0].course_access_white = true;
    expect((await getStudentAccess(STUDENT)).canTrack).toBe(true);
  });
  it('con membresía activa → canTrack; vencida → no', async () => {
    const { getStudentAccess } = await import('@/lib/portal/access');
    fake.tables.memberships = [{ student_id: STUDENT, status: 'active', ends_at: '2099-01-01' }];
    expect((await getStudentAccess(STUDENT)).canTrack).toBe(true);
    fake.tables.memberships = [{ student_id: STUDENT, status: 'active', ends_at: '2020-01-01' }];
    expect((await getStudentAccess(STUDENT)).canTrack).toBe(false);
  });
  it('saveSequenceSession y logFreeSurf rechazan sin escribir', async () => {
    fake.tables.memberships = [];
    const { saveSequenceSession } = await import('@/lib/actions/lets-play');
    const r = await saveSequenceSession(TOKEN, { mode: 'sequence_run', sequence_id: 'x', planned_duration_minutes: 30, planned_reps: 5, safety_check: true } as any);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/course or membership/);
    const { logFreeSurf } = await import('@/lib/actions/portal');
    await expect(logFreeSurf(TOKEN, 60)).rejects.toThrow(/course or membership/);
    expect(fake.writes().length).toBe(0);
  });
});
