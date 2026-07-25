-- TD-016 — close residual SECURITY DEFINER EXECUTE exposure.
--
-- Production inventory and RLS dependency inspection (2026-07-25) found six
-- DeliverX-owned SECURITY DEFINER functions in public:
--
-- RLS-critical read helpers (retain authenticated + service_role):
--   * current_org_id() is referenced by organisation RLS policies.
--   * is_workspace_project_member(uuid) is referenced by requirements RLS.
--   * pi_cf_version_is_readable(uuid) is referenced by pi_cf_* read policies.
--   These helpers are caller-scoped through auth.uid() or return only framework
--   publication state. Anonymous/PUBLIC RPC execution is not required.
--
-- Privileged/internal functions (no client execution):
--   * pi_privacy_purge_person_data(uuid, uuid) remains service_role only.
--   * pi_privacy_purge_person_data_t4(uuid, uuid) remains owner-only; it is an
--     internal implementation called by the service-role-only wrapper.
--   * handle_new_auth_user() remains trigger/service_role only.
--
-- All six functions already have an explicit `search_path = public`; this
-- migration changes grants only. Statements are idempotent.

revoke execute on function public.current_org_id()
  from public, anon;
grant execute on function public.current_org_id()
  to authenticated, service_role;

revoke execute on function public.is_workspace_project_member(uuid)
  from public, anon;
grant execute on function public.is_workspace_project_member(uuid)
  to authenticated, service_role;

revoke execute on function public.pi_cf_version_is_readable(uuid)
  from public, anon;
grant execute on function public.pi_cf_version_is_readable(uuid)
  to authenticated, service_role;

revoke execute on function public.handle_new_auth_user()
  from public, anon, authenticated;
grant execute on function public.handle_new_auth_user()
  to service_role;

revoke execute on function public.pi_privacy_purge_person_data(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.pi_privacy_purge_person_data(uuid, uuid)
  to service_role;

revoke execute on function public.pi_privacy_purge_person_data_t4(uuid, uuid)
  from public, anon, authenticated, service_role;
