-- Fix "stack depth limit exceeded" during onboarding and other RLS checks.
--
-- Migration 0006 switched current_org_id() to SECURITY INVOKER. That causes
-- infinite recursion: current_org_id() reads public.users, users RLS policies
-- call current_org_id() again, and Postgres hits the stack depth limit.
--
-- SECURITY DEFINER is required here so the org lookup bypasses RLS. The function
-- only returns the caller's own organisation_id (scoped to auth.uid()).

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organisation_id from public.users where id = auth.uid()
$$;

revoke all on function public.current_org_id() from public;
grant execute on function public.current_org_id() to authenticated, service_role;

-- Onboarding: creator must read the org row before their users.organisation_id is set.
drop policy if exists "organisations_creator_select" on public.organisations;
create policy "organisations_creator_select" on public.organisations
  for select using (created_by = auth.uid());
