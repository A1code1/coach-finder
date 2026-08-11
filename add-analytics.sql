-- Adds profile view tracking for coach analytics (views, response rate, conversion).
-- Run this in the Supabase SQL Editor after database.sql has already been applied.

create table profile_views (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  viewer_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_profile_views_coach_id on profile_views(coach_id);

alter table profile_views enable row level security;

-- Any logged-in visitor can record a view
create policy "Anyone can record a profile view" on profile_views
  for insert with check (true);

-- Coaches can read the view stats for their own profile
create policy "Coaches can view their own profile view stats" on profile_views
  for select using (
    coach_id in (select id from coaches where user_id = auth.uid())
  );
