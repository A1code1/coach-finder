-- Adds player favorites (saved coaches for quick comparison).
-- Run this in the Supabase SQL Editor after database.sql has already been applied.

create table favorites (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references auth.users(id) on delete cascade,
  coach_id uuid not null references coaches(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (player_id, coach_id)
);

create index idx_favorites_player_id on favorites(player_id);
create index idx_favorites_coach_id on favorites(coach_id);

alter table favorites enable row level security;

create policy "Players can view their own favorites" on favorites
  for select using (player_id = auth.uid());

create policy "Players can add favorites" on favorites
  for insert with check (player_id = auth.uid());

create policy "Players can remove their own favorites" on favorites
  for delete using (player_id = auth.uid());
