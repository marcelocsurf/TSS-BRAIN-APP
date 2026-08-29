-- ═══ COMUNIDAD: The Lineup (2026-08-29) — YA APLICADA en producción vía MCP ═══
-- Copia de registro. Ver community_posts/community_reactions/community_reads.
-- Canal, no foro: Marcelo postea para muchos; una sola reacción; el buzón del
-- Home se vacía con community_reads.

create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  academy_id uuid references academies(id),
  kind text not null check (kind in ('note','video','live','seminar')),
  title text not null,
  body_md text,
  video_url text,
  event_at timestamptz,
  event_link text,
  recording_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_by uuid references coaches(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists community_reactions (
  post_id uuid not null references community_posts(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, student_id)
);
create table if not exists community_reads (
  post_id uuid not null references community_posts(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (post_id, student_id)
);
create index if not exists idx_community_posts_published on community_posts (published, published_at desc);
create index if not exists idx_community_reads_student on community_reads (student_id);
alter table community_posts enable row level security;
alter table community_reactions enable row level security;
alter table community_reads enable row level security;
