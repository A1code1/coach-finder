-- Adds multi-photo gallery support for coach profiles.
-- Run this in the Supabase SQL Editor after database.sql has already been applied.
-- photo_url is kept as-is (first photo, for backward compatibility with
-- existing code paths); photo_urls holds the full gallery.

alter table coaches add column if not exists photo_urls text[] default '{}';

-- Backfill existing single photos into the new array column.
update coaches
set photo_urls = array[photo_url]
where photo_url is not null and (photo_urls is null or photo_urls = '{}');
