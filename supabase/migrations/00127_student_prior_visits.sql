-- Manual override for visits that happened BEFORE the app existed, so the
-- visit count reflects the client's true history (detected trips + prior).
alter table public.students add column if not exists prior_visits integer not null default 0;
