-- T3 hotfix — lock down person-purge RPC to service_role only.
--
-- Supabase default privileges auto-grant EXECUTE on new public functions to the
-- `anon` and `authenticated` roles. `revoke all ... from public` (0086/0088)
-- does NOT remove those role-specific grants, so the SECURITY DEFINER purge
-- function `pi_privacy_purge_person_data` was callable via PostgREST RPC by
-- anonymous / signed-in users — which could delete another person's PI data.
--
-- Restore least privilege: only service_role (used by the delete orchestrator
-- via the admin client) may execute it. Idempotent.

revoke execute on function public.pi_privacy_purge_person_data(uuid, uuid)
  from anon, authenticated, public;

grant execute on function public.pi_privacy_purge_person_data(uuid, uuid)
  to service_role;

comment on function public.pi_privacy_purge_person_data(uuid, uuid) is
  'Service-role person PI purge. Never deletes pi_cf_* shared catalogue. Append-only bypass via app.pi_privacy_delete. EXECUTE revoked from anon/authenticated (T3 hotfix 0089).';
