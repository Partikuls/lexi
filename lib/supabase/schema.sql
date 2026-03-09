-- Lexi — Supabase schema
-- Run this in the Supabase SQL Editor to set up tables and storage.

-- ── Courses table ───────────────────────────────────────────────────────────

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  title text not null,
  subject text not null default '',
  level text not null default '',
  data jsonb not null,
  user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table courses enable row level security;

create policy "Public read via token"
  on courses for select
  using (true);

create policy "Authenticated insert"
  on courses for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ── Course images table ─────────────────────────────────────────────────────

create table if not exists course_images (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  type text not null check (type in ('ILLUSTRATIVE', 'SCHEMA', 'EXERCICE')),
  alt_text text not null default '',
  created_at timestamptz not null default now()
);

alter table course_images enable row level security;

create policy "Public read images"
  on course_images for select
  using (true);

create policy "Authenticated insert images"
  on course_images for insert
  to authenticated
  with check (true);

-- ── Storage bucket ──────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('course-images', 'course-images', true)
on conflict (id) do nothing;

create policy "Public read course-images"
  on storage.objects for select
  using (bucket_id = 'course-images');

create policy "Authenticated upload course-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'course-images');
