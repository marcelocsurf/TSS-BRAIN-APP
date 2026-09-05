-- 00184 — Consentimientos legales + anonimización (auditoría legal 2026-09-05)
--
-- Qué guarda esto y por qué:
--  * health_data_consent_at   — consentimiento EXPRESO para datos de salud
--                               (alergias, lesiones, notas médicas, natación).
--                               Categoría sensible en la ley de datos de SV.
--  * media_release_consent_at — cuándo se marcó el consentimiento de imagen
--                               (antes solo había el booleano, pre-marcado).
--  * terms_accepted_at/version — aceptación de Términos + Privacidad al entrar
--                               al portal por primera vez (o cuando cambia la versión).
--  * consent_ip / consent_user_agent — evidencia de la última aceptación.
--  * guardian_name/relationship — quién firmó por un menor (antes solo iba
--                               pegado en waiver_signed_by como texto).
--  * anonymized_at            — la ficha fue anonimizada a pedido del titular.
--                               Se conserva la fila (waiver, pagos, historial
--                               agregado) sin datos que identifiquen.

alter table public.students
  add column if not exists health_data_consent_at   timestamptz,
  add column if not exists media_release_consent_at timestamptz,
  add column if not exists terms_accepted_at        timestamptz,
  add column if not exists terms_version            text,
  add column if not exists consent_ip               text,
  add column if not exists consent_user_agent       text,
  add column if not exists guardian_name            text,
  add column if not exists guardian_relationship    text,
  add column if not exists anonymized_at            timestamptz;

comment on column public.students.health_data_consent_at is 'Consentimiento expreso para tratar datos de salud (intake/QR). NULL = nunca lo dio.';
comment on column public.students.terms_accepted_at is 'Última aceptación de Términos + Política de privacidad (portal). Ver terms_version.';
comment on column public.students.anonymized_at is 'Ficha anonimizada a pedido del titular; los datos identificativos fueron borrados.';

create index if not exists idx_students_anonymized on public.students (anonymized_at) where anonymized_at is not null;
