-- Run this SQL in your Supabase SQL Editor

-- 1. Create table for Task Chunks (Overwhelmed feature)
create table public.task_chunks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade null,
  original_task text not null,
  steps jsonb not null
);

-- 2. Create table for RSD Logs (Triggered feature)
create table public.rsd_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade null,
  original_message text not null,
  neutral_translation text not null,
  distortions jsonb not null
);

-- 3. Create table for Vent Logs (Voice Journal)
create table public.vent_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade null,
  transcript text not null,
  ai_reply text not null
);

-- 4. Create table for User Settings
create table public.user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_name text default 'Friend',
  theme text default 'system',
  motion text default 'system',
  text_size text default 'default'
);

-- 5. Set up Row Level Security (RLS)
alter table public.task_chunks enable row level security;
alter table public.rsd_logs enable row level security;
alter table public.vent_logs enable row level security;
alter table public.user_settings enable row level security;

-- INSERT POLICIES
-- Allow anyone to insert if user_id is null (guests) OR if user_id matches their own auth.uid (logged in)
create policy "Allow inserts to task_chunks" on public.task_chunks for insert with check (user_id is null or user_id = auth.uid());
create policy "Allow inserts to rsd_logs" on public.rsd_logs for insert with check (user_id is null or user_id = auth.uid());
create policy "Allow inserts to vent_logs" on public.vent_logs for insert with check (user_id is null or user_id = auth.uid());
create policy "Allow inserts to user_settings" on public.user_settings for insert with check (user_id = auth.uid());

-- SELECT POLICIES
-- Users can only read their own data. Guests cannot read any data from DB.
create policy "Allow select own task_chunks" on public.task_chunks for select using (user_id = auth.uid());
create policy "Allow select own rsd_logs" on public.rsd_logs for select using (user_id = auth.uid());
create policy "Allow select own vent_logs" on public.vent_logs for select using (user_id = auth.uid());
create policy "Allow select own user_settings" on public.user_settings for select using (user_id = auth.uid());

-- UPDATE POLICIES
create policy "Allow update own user_settings" on public.user_settings for update using (user_id = auth.uid());

