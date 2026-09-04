-- Tempo V3: Database Schema & Row Level Security (RLS)
-- Run this SQL in your Supabase SQL Editor

-- 1. Create table for RSD Logs (Flagship RSD Communication Buffer)
-- user_id is nullable to allow zero-friction guest usage while keeping entries private.
-- distortions JSONB holds { emotion, pattern } for skill-building pattern insights.
create table if not exists public.rsd_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade null,
  original_message text not null,
  neutral_translation text not null,
  distortions jsonb not null default '{}'::jsonb
);

-- 2. Preserved tables for active modules (Task Chunker & Voice Journal)
create table if not exists public.task_chunks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade null,
  original_task text not null,
  steps jsonb not null
);

create table if not exists public.vent_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade null,
  transcript text not null,
  ai_reply text not null
);

-- 3. Table for User Settings
create table if not exists public.user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_name text default 'Friend',
  theme text default 'system',
  motion text default 'system',
  text_size text default 'default'
);

-- 4. Enable Row Level Security (RLS) on all tables
alter table public.rsd_logs enable row level security;
alter table public.task_chunks enable row level security;
alter table public.vent_logs enable row level security;
alter table public.user_settings enable row level security;

-- 5. INSERT POLICIES
-- Strict insert permissions: Allow inserts if user_id is null (ephemeral/guest save) OR matches auth.uid()
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

-- 6. SELECT POLICIES (Privacy Guarantee)
-- CRITICAL SECURITY RULE: No table has public read access. No 'select using (true)' exists.
-- Guests (anon role where auth.uid() is null) have ZERO read permissions.
-- Authenticated users can only read rows where user_id matches their own auth.uid().
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

-- 7. UPDATE POLICIES
drop policy if exists "Allow update own user_settings" on public.user_settings;
create policy "Allow update own user_settings" on public.user_settings 
  for update 
  using (auth.uid() is not null and user_id = auth.uid());

-- 8. DELETE POLICIES (User Data Sovereignty)
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
