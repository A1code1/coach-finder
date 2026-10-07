-- Trial session requests (2026-10-07).
-- A player picks a date + time slot from the coach's availability; the coach accepts or declines.
-- Inserts and status changes go through server routes (app/api/trial-requests) using the
-- service role key, so there are no insert/update policies here.

create table if not exists trial_requests (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  player_id uuid references auth.users(id) on delete set null,
  player_name text not null,
  player_email text not null,
  player_phone text,
  session_date date not null,
  time_slot text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_trial_requests_coach_id on trial_requests(coach_id);
create index if not exists idx_trial_requests_player_id on trial_requests(player_id);

alter table trial_requests enable row level security;

create policy "Coaches can view their trial requests" on trial_requests
  for select using (coach_id in (select id from coaches where user_id = auth.uid()));

create policy "Players can view their own trial requests" on trial_requests
  for select using (player_id = auth.uid());
