-- Phase A — profile avatar URL on users

alter table public.users
  add column if not exists avatar_url text;
