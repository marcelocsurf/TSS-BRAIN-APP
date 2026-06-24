-- Video Analyzer — admin-managed model library.
--
-- The reference clips shown in the Video Analyzer ("model" videos) live in the
-- public `tss-library` Storage bucket; their metadata lives in `model_clips`.
-- The admin uploader (src/lib/actions/model-clips.ts) writes rows with the
-- service-role client (bypasses RLS); the analyzer reads them back grouped by
-- category. Reads are public because the bucket is public.
--
-- IMPORTANT: this table + bucket were originally created ad-hoc (dashboard/MCP)
-- and were NOT version-controlled, so a clean rebuild would lack them and the
-- uploader would fail at the INSERT step (file uploaded to Storage, then the
-- row insert errors → the file is cleaned up → "it uploads but nothing appears").
-- This migration makes them canonical. It is idempotent: safe to run whether or
-- not the objects already exist.

-- 1) Metadata table -----------------------------------------------------------
create table if not exists public.model_clips (
  id            uuid primary key default gen_random_uuid(),
  category      text not null,
  category_name text not null,
  title         text not null,
  description   text,
  video_url     text not null,
  storage_path  text,
  display_order integer not null default 0,
  created_at    timestamptz default now()
);

create index if not exists model_clips_category_order_idx
  on public.model_clips (category, display_order, created_at);

-- Reads go through the service-role client (server actions), so RLS is not on
-- the hot path, but enable it and add a public read policy as belt-and-braces
-- in case the table is ever read with the anon key.
alter table public.model_clips enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'model_clips'
      and policyname = 'model_clips public read'
  ) then
    create policy "model_clips public read"
      on public.model_clips for select
      using (true);
  end if;
end $$;

-- 2) Public Storage bucket for the clips --------------------------------------
insert into storage.buckets (id, name, public)
values ('tss-library', 'tss-library', true)
on conflict (id) do update set public = true;

-- Public read of objects in the bucket (the bucket being public already serves
-- the object URLs, but the explicit policy keeps intent clear and survives any
-- future bucket-privacy change for listing).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'tss-library public read'
  ) then
    create policy "tss-library public read"
      on storage.objects for select
      using (bucket_id = 'tss-library');
  end if;
end $$;
