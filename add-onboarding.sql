-- Adds player preferences for the onboarding quiz and personalized match suggestions.
-- Run this in the Supabase SQL Editor after database.sql has already been applied.

create table player_preferences (
  player_id uuid primary key references auth.users(id) on delete cascade,
  city text,
  radius_km integer not null default 25,
  budget_max numeric,
  age_group text,
  specialties text[] not null default '{}',
  gender_preference text,
  updated_at timestamptz not null default now()
);

alter table player_preferences enable row level security;

-- Players can view their own preferences
create policy "Players can view their own preferences" on player_preferences
  for select using (player_id = auth.uid());

-- Players can create their own preferences
create policy "Players can insert their own preferences" on player_preferences
  for insert with check (player_id = auth.uid());

-- Players can update their own preferences
create policy "Players can update their own preferences" on player_preferences
  for update using (player_id = auth.uid());
