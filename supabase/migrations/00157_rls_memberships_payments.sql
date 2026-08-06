-- Cierra el aviso de seguridad de Supabase (2026-08-03): memberships y
-- coach_payments quedaron sin RLS al crearse. Convención del proyecto:
-- RLS habilitado sin políticas públicas — solo el service role (server
-- actions) accede; anon/authenticated quedan bloqueados por completo.
alter table memberships enable row level security;
alter table coach_payments enable row level security;
