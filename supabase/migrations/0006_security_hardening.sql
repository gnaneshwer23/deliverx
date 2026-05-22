-- Deliverx — security hardening (advisor follow-up)
-- Apply after 0001/0002/0003/0004/0005.
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.

-- ===========================================================================
-- 1. Lock down set_updated_at()'s search_path
-- ===========================================================================
alter function public.set_updated_at() set search_path = public;

-- ===========================================================================
-- 2. current_org_id() → SECURITY INVOKER
--
-- The caller can already read their own users row via the users_self_select
-- RLS policy, so DEFINER privilege isn't needed. Switching to INVOKER closes
-- the supabase advisor "executable security_definer function" warning while
-- keeping RLS policies that reference current_org_id() working.
-- ===========================================================================
create or replace function public.current_org_id()
returns uuid
language sql
stable
security invoker
set search_path = public
as $$
  select organisation_id from public.users where id = auth.uid()
$$;

-- ===========================================================================
-- 3. handle_new_auth_user() — keep SECURITY DEFINER (must privilege-elevate
--    to insert into public.users on signup), but revoke from PUBLIC/anon/
--    authenticated so it isn't reachable as an HTTP RPC.
-- ===========================================================================
revoke execute on function public.handle_new_auth_user() from public;
revoke execute on function public.handle_new_auth_user() from anon, authenticated;
