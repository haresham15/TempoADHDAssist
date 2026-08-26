-- Run this SQL in your Supabase SQL Editor

-- 1. Create table for Task Chunks (Overwhelmed feature)
create table public.task_chunks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  original_task text not null,
  steps jsonb not null
);

-- 2. Create table for RSD Logs (Triggered feature)
create table public.rsd_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  original_message text not null,
  neutral_translation text not null,
  distortions jsonb not null
);

-- 3. Set up Row Level Security (RLS)
-- For a public-facing anonymous tool, we allow inserts from anon users.
-- WARNING: If you add authentication later, you should restrict this!
alter table public.task_chunks enable row level security;
alter table public.rsd_logs enable row level security;

create policy "Allow anonymous inserts to task_chunks"
  on public.task_chunks
  for insert
  to anon
  with check (true);

create policy "Allow anonymous inserts to rsd_logs"
  on public.rsd_logs
  for insert
  to anon
  with check (true);

-- The previous anonymous select policies have been removed for data privacy.
-- Wait until Authentication is fully implemented, then scope SELECT to auth.uid() = user_id.
