-- Tempo V3/V4: Database Schema & Row Level Security (RLS)
-- Run this entire file in your Supabase SQL Editor.
-- It is 100% idempotent: safe to run on both brand-new and pre-existing databases.

-- ==========================================================
-- 1. TABLE DEFINITIONS
-- ==========================================================

-- RSD Communication Buffer Logs
create table if not exists public.rsd_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade null,
  original_message text not null,
  neutral_translation text not null,
  relationship_category text not null default 'general',
  distortions jsonb not null default '{}'::jsonb
);

-- Task Chunker Steps (Text & Spatial)
create table if not exists public.task_chunks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade null,
  original_task text not null,
  steps jsonb not null
);

-- Voice & Written Vent Logs
create table if not exists public.vent_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade null,
  transcript text not null,
  ai_reply text not null
);

-- User Preferences & Settings
create table if not exists public.user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_name text default 'Friend',
  theme text default 'system',
  motion text default 'system',
  text_size text default 'default'
);

-- Community Feedback & Suggestions
create table if not exists public.suggestions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete set null null,
  category text not null default 'general',
  content text not null,
  contact_email text null
);

-- ==========================================================
-- 2. SAFE COLUMN MIGRATIONS (For pre-existing tables)
-- ==========================================================

-- Ensure rsd_logs has user_id, relationship_category, and distortions
alter table public.rsd_logs add column if not exists user_id uuid references auth.users(id) on delete cascade null;
alter table public.rsd_logs add column if not exists relationship_category text not null default 'general';
alter table public.rsd_logs add column if not exists distortions jsonb not null default '{}'::jsonb;

-- Ensure task_chunks has user_id
alter table public.task_chunks add column if not exists user_id uuid references auth.users(id) on delete cascade null;

-- Ensure vent_logs has user_id
alter table public.vent_logs add column if not exists user_id uuid references auth.users(id) on delete cascade null;

-- Ensure suggestions has user_id, category, and contact_email
alter table public.suggestions add column if not exists user_id uuid references auth.users(id) on delete set null null;
alter table public.suggestions add column if not exists category text not null default 'general';
alter table public.suggestions add column if not exists contact_email text null;

-- ==========================================================
-- 3. INDEXES
-- ==========================================================

create index if not exists idx_rsd_logs_relationship on public.rsd_logs(relationship_category);
create index if not exists idx_rsd_logs_user_id on public.rsd_logs(user_id);
create index if not exists idx_task_chunks_user_id on public.task_chunks(user_id);
create index if not exists idx_vent_logs_user_id on public.vent_logs(user_id);
create index if not exists idx_suggestions_user_id on public.suggestions(user_id);

-- ==========================================================
-- 4. ROW LEVEL SECURITY (RLS) ACTIVATION
-- ==========================================================

alter table public.rsd_logs enable row level security;
alter table public.task_chunks enable row level security;
alter table public.vent_logs enable row level security;
alter table public.user_settings enable row level security;
alter table public.suggestions enable row level security;

-- ==========================================================
-- 5. INSERT POLICIES
-- Guests (user_id is null) or Authenticated users can insert
-- ==========================================================

drop policy if exists "Allow inserts to rsd_logs" on public.rsd_logs;
create policy "Allow inserts to rsd_logs" on public.rsd_logs 
  for insert 
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Allow inserts to task_chunks" on public.task_chunks;
create policy "Allow inserts to task_chunks" on public.task_chunks 
  for insert 
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Allow inserts to vent_logs" on public.vent_logs;
create policy "Allow inserts to vent_logs" on public.vent_logs 
  for insert 
  with check (user_id is null or user_id = auth.uid());

drop policy if exists "Allow inserts to user_settings" on public.user_settings;
create policy "Allow inserts to user_settings" on public.user_settings 
  for insert 
  with check (user_id = auth.uid());

drop policy if exists "Allow insert suggestions" on public.suggestions;
create policy "Allow insert suggestions" on public.suggestions 
  for insert 
  with check (true);

-- ==========================================================
-- 6. SELECT POLICIES (Privacy Guarantee: Zero Public Read)
-- Guests (anon role where auth.uid() is null) have ZERO read access.
-- Authenticated users can ONLY read rows matching their own auth.uid().
-- ==========================================================

drop policy if exists "Allow select own rsd_logs" on public.rsd_logs;
create policy "Allow select own rsd_logs" on public.rsd_logs 
  for select 
  using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "Allow select own task_chunks" on public.task_chunks;
create policy "Allow select own task_chunks" on public.task_chunks 
  for select 
  using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "Allow select own vent_logs" on public.vent_logs;
create policy "Allow select own vent_logs" on public.vent_logs 
  for select 
  using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "Allow select own user_settings" on public.user_settings;
create policy "Allow select own user_settings" on public.user_settings 
  for select 
  using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "Allow select own suggestions" on public.suggestions;
create policy "Allow select own suggestions" on public.suggestions 
  for select 
  using (auth.uid() is not null and user_id = auth.uid());

-- ==========================================================
-- 7. UPDATE POLICIES
-- ==========================================================

drop policy if exists "Allow update own user_settings" on public.user_settings;
create policy "Allow update own user_settings" on public.user_settings 
  for update 
  using (auth.uid() is not null and user_id = auth.uid());

-- ==========================================================
-- 8. DELETE POLICIES (User Data Sovereignty)
-- ==========================================================

drop policy if exists "Allow delete own rsd_logs" on public.rsd_logs;
create policy "Allow delete own rsd_logs" on public.rsd_logs 
  for delete 
  using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "Allow delete own task_chunks" on public.task_chunks;
create policy "Allow delete own task_chunks" on public.task_chunks 
  for delete 
  using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists "Allow delete own vent_logs" on public.vent_logs;
create policy "Allow delete own vent_logs" on public.vent_logs 
  for delete 
  using (auth.uid() is not null and user_id = auth.uid());
