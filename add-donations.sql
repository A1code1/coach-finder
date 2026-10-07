-- Coach Finder Kids Fund (2026-10-07).
-- Ledger of money set aside for kids who can't afford a coach.
-- €1 is added by the server for every trial session a coach accepts
-- (app/api/trial-requests/[id]). The table is server-only; the public total
-- comes from donation_total().

create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  amount_eur numeric(10, 2) not null check (amount_eur > 0),
  source text not null check (source in ('initial', 'trial_session', 'manual')),
  trial_request_id uuid unique references trial_requests(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

alter table donations enable row level security;

create or replace function public.donation_total()
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(amount_eur), 0) from donations;
$$;

grant execute on function public.donation_total() to anon, authenticated;

-- Amount already donated before the counter went live.
insert into donations (amount_eur, source, note)
select 273, 'initial', 'Donated before the counter went live'
where not exists (select 1 from donations where source = 'initial');
