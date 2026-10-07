-- Security fixes (2026-10-07)
-- 1. Coaches could set their own status (self-approve) on insert or update.
-- 2. Anyone could insert reviews (including status = 'approved') for any coach.
-- 3. Anyone could insert contact_reveals with a review token of their choosing.
-- Contact reveals and reviews are now written only by server routes using the
-- service role key (app/api/...), which bypasses RLS.

-- 1. Only admins, the service role, or direct DB sessions may change status.
create or replace function public.protect_coach_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Direct DB sessions (SQL editor, seed scripts; no JWT) and the service role are trusted.
  if auth.role() is null
     or auth.role() = 'service_role'
     or exists (select 1 from admins where admins.user_id = auth.uid()) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.rejection_reason := null;
  else
    new.status := old.status;
    new.rejection_reason := old.rejection_reason;
    new.user_id := old.user_id;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_coach_status() from public, anon, authenticated;

drop trigger if exists coaches_protect_status on coaches;
create trigger coaches_protect_status
  before insert or update on coaches
  for each row execute function public.protect_coach_status();

-- 2. No direct review inserts from the browser. One review per contact reveal.
drop policy if exists "Reviews can be inserted by anyone" on reviews;
create unique index if not exists idx_reviews_contact_reveal_unique
  on reviews(contact_reveal_id) where contact_reveal_id is not null;

-- 3. No direct contact_reveals inserts from the browser.
drop policy if exists "Contact reveals are insertable by anyone" on contact_reveals;
