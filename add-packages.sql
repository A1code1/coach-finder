-- Session packages and group rates (2026-10-07).
-- Each entry is either
--   {"kind": "bundle", "sessions": 5, "price": 200}    -- total price for N sessions
--   {"kind": "group", "group_size": 4, "price": 15}    -- price per person per session
alter table coaches add column if not exists packages jsonb not null default '[]'::jsonb;
