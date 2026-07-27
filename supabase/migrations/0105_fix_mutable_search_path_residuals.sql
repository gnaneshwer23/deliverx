-- Phase 7 - close remaining mutable search_path advisor residuals.
--
-- These functions are SECURITY INVOKER, but pinning search_path keeps Supabase
-- security advisors clean and makes name resolution explicit.

alter function public.match_project_memory_chunks(
  uuid,
  extensions.vector,
  integer,
  text[]
) set search_path = public;

alter function public.match_org_memory_chunks(
  extensions.vector,
  integer,
  text[]
) set search_path = public;

alter function public.pi_cf_version_is_immutable(uuid)
  set search_path = public;
