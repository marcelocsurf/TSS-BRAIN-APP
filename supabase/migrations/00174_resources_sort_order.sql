-- Presentaciones como CURSO ORDENADO (2026-08-29) — YA APLICADA vía MCP.
alter table coach_resources add column if not exists sort_order integer;
create index if not exists idx_coach_resources_sort on coach_resources (sort_order nulls last);
