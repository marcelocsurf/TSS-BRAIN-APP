-- 00190: interruptor por correo (Marcelo 2026-09-10). En etapa de prueba
-- nada nuevo sale sin su ok. Cada send*() consulta su kind antes de mandar.
create table if not exists public.email_settings (
  kind text primary key,
  enabled boolean not null default true,
  label text not null,
  audience text not null check (audience in ('student','coach','staff','lead')),
  updated_at timestamptz not null default now()
);
alter table public.email_settings enable row level security;
drop policy if exists email_settings_select on public.email_settings;
create policy email_settings_select on public.email_settings for select using (current_coach_is_platform_admin());
insert into public.email_settings (kind, enabled, label, audience) values
 ('portal_link', true, 'Your Surf Sequence portal link', 'student'),
 ('intake_link', true, 'Complete your surf intake', 'student'),
 ('booking_confirmation', true, 'You''re booked (QR / web)', 'student'),
 ('session_report', true, 'Your session report from [coach]', 'student'),
 ('coach_survey', true, 'How was your experience with [coach]?', 'student'),
 ('membership_expiry', true, 'Your training tool ends soon', 'student'),
 ('book_delivery', true, 'ONE WAVE — your book is ready', 'student'),
 ('welcome_enrolled', false, 'Welcome: you are in [camp] + your portal (NEW)', 'student'),
 ('day_feedback', false, 'Feedback of the day at close (NEW)', 'student'),
 ('student_day_reminder', false, 'Tomorrow: meeting time + transport (NEW)', 'student'),
 ('quiz_lead', true, 'New surf-level quiz lead', 'staff'),
 ('assignment', true, 'New service assigned — please confirm', 'coach'),
 ('assignment_response', true, 'Coach accepted / declined', 'staff'),
 ('service_reminder', true, 'Tomorrow: [service] (coach)', 'coach'),
 ('closure_reminder', true, 'Cierres pendientes 5 PM', 'coach'),
 ('task_overdue', true, 'Overdue task', 'coach'),
 ('coach_invite', true, 'Coach invite', 'coach'),
 ('coach_welcome', true, 'Bienvenido al equipo', 'coach'),
 ('password_reset', true, 'Reset your password', 'staff')
on conflict (kind) do nothing;
