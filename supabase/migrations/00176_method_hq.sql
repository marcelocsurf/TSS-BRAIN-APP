-- ═══ EL MÉTODO — cuartel general del negocio (solo dueño) ═══
-- Bóveda de documentos + checklist de desarrollo por área. RLS habilitado
-- SIN policies: solo el service role entra (patrón The Lineup) — el gate
-- real es is_platform_admin dentro de las server actions.
-- Aplicada vía MCP el 2026-08-30; este archivo es la copia del repo.

create table if not exists method_docs (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  title text not null,
  kind text not null default 'pdf' check (kind in ('pdf','image','link','note','resource')),
  storage_path text,
  url text,
  resource_id uuid references coach_resources(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists method_tasks (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  title text not null,
  detail text,
  status text not null default 'pending' check (status in ('pending','in_progress','done')),
  doc_id uuid references method_docs(id) on delete set null,
  sort_order int,
  seeded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists method_docs_area_idx on method_docs(area);
create index if not exists method_tasks_area_idx on method_tasks(area, sort_order);

alter table method_docs enable row level security;
alter table method_tasks enable row level security;

insert into storage.buckets (id, name, public)
values ('method-vault', 'method-vault', false)
on conflict (id) do nothing;
