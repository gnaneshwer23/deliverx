-- Remediation Batch 1 — DB trust-rail lockdown.
-- ScoreRuns are engine-only, Verified-bearing VPP columns are attestation-only,
-- and platform_verified transitions are privileged-only.
-- Additive hardening: no historical rows are rewritten or deleted.

-- ---------------------------------------------------------------------------
-- ScoreRuns: authenticated clients may read their own runs, never mutate them.
-- UPDATE/DELETE are append-only forbidden; privacy purge has the existing
-- transaction-local app.pi_privacy_delete bypass.
-- ---------------------------------------------------------------------------

drop policy if exists "pi_capability_score_runs_own"
  on public.pi_capability_score_runs;
drop policy if exists "pi_capability_score_runs_select_own"
  on public.pi_capability_score_runs;

create policy "pi_capability_score_runs_select_own"
  on public.pi_capability_score_runs
  for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke insert, update, delete, truncate
  on table public.pi_capability_score_runs
  from anon, authenticated;
grant select on table public.pi_capability_score_runs to authenticated;

create or replace function public.pi_forbid_score_run_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('app.pi_privacy_delete', true) = 'on'
     and tg_op = 'DELETE' then
    return old;
  end if;

  raise exception 'immutable capability ScoreRun: % does not allow %',
    tg_table_name, tg_op
    using errcode = '42501';
end;
$$;

revoke all on function public.pi_forbid_score_run_mutation()
  from public, anon, authenticated, service_role;

drop trigger if exists trg_pi_capability_score_runs_immutable
  on public.pi_capability_score_runs;
create trigger trg_pi_capability_score_runs_immutable
  before update or delete on public.pi_capability_score_runs
  for each row execute function public.pi_forbid_score_run_mutation();

-- ---------------------------------------------------------------------------
-- Verified Portfolio: retain normal owner CRUD explicitly, but protect the two
-- columns that can light deliverxVerified. Only the narrow service-role RPC can
-- transition into or out of a Verified-bearing state.
-- ---------------------------------------------------------------------------

drop policy if exists "vpp_entries_own" on public.vpp_entries;
drop policy if exists "vpp_entries_select_own" on public.vpp_entries;
drop policy if exists "vpp_entries_insert_own" on public.vpp_entries;
drop policy if exists "vpp_entries_update_own" on public.vpp_entries;
drop policy if exists "vpp_entries_delete_own" on public.vpp_entries;

create policy "vpp_entries_select_own"
  on public.vpp_entries
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "vpp_entries_insert_own"
  on public.vpp_entries
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy "vpp_entries_update_own"
  on public.vpp_entries
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "vpp_entries_delete_own"
  on public.vpp_entries
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.pi_guard_vpp_verified_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  privileged boolean :=
    current_setting('app.pi_attestation_write', true) = 'on';
begin
  if privileged then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.verifier_status = 'externally_attested'
       or new.evidence_strength = 'externally_verified' then
      raise exception
        'Verified-bearing portfolio columns require the attestation path'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if (
    new.verifier_status is distinct from old.verifier_status
    and (
      new.verifier_status = 'externally_attested'
      or old.verifier_status = 'externally_attested'
    )
  ) or (
    new.evidence_strength is distinct from old.evidence_strength
    and (
      new.evidence_strength = 'externally_verified'
      or old.evidence_strength = 'externally_verified'
    )
  ) then
    raise exception
      'Verified-bearing portfolio columns require the attestation path'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.pi_guard_vpp_verified_columns()
  from public, anon, authenticated, service_role;

drop trigger if exists trg_vpp_entries_verified_columns
  on public.vpp_entries;
create trigger trg_vpp_entries_verified_columns
  before insert or update on public.vpp_entries
  for each row execute function public.pi_guard_vpp_verified_columns();

create or replace function public.pi_apply_vpp_attestation_state(
  p_entry_id uuid,
  p_user_id uuid,
  p_verifier_status text,
  p_evidence_strength text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_id uuid;
begin
  if p_entry_id is null or p_user_id is null then
    raise exception 'entry and user are required'
      using errcode = '22023';
  end if;

  if p_verifier_status not in ('externally_attested', 'disputed') then
    raise exception 'attestation state is not privileged-write eligible'
      using errcode = '22023';
  end if;

  if p_verifier_status = 'externally_attested'
     and p_evidence_strength is distinct from 'externally_verified' then
    raise exception
      'external attestation requires externally_verified evidence strength'
      using errcode = '22023';
  end if;

  if p_evidence_strength is not null
     and p_evidence_strength <> 'externally_verified' then
    raise exception 'invalid privileged evidence strength'
      using errcode = '22023';
  end if;

  perform set_config('app.pi_attestation_write', 'on', true);

  update public.vpp_entries
  set verifier_status = p_verifier_status,
      evidence_strength = coalesce(p_evidence_strength, evidence_strength)
  where id = p_entry_id
    and user_id = p_user_id
  returning id into updated_id;

  if updated_id is null then
    raise exception 'portfolio entry not found'
      using errcode = 'P0002';
  end if;

  return updated_id;
end;
$$;

revoke all on function public.pi_apply_vpp_attestation_state(
  uuid, uuid, text, text
) from public, anon, authenticated;
grant execute on function public.pi_apply_vpp_attestation_state(
  uuid, uuid, text, text
) to service_role;

-- ---------------------------------------------------------------------------
-- Evidence status: normal users retain append access for ordinary lifecycle
-- transitions, but platform_verified is available only through the narrow,
-- service-role attestation RPC.
-- ---------------------------------------------------------------------------

drop policy if exists "pi_evidence_transitions_insert_own"
  on public.pi_evidence_status_transitions;

create policy "pi_evidence_transitions_insert_own"
  on public.pi_evidence_status_transitions
  for insert
  to authenticated
  with check (
    to_status <> 'platform_verified'::public.pi_evidence_status
    and exists (
      select 1
      from public.pi_evidence_records r
      where r.id = evidence_id
        and r.user_id = (select auth.uid())
    )
  );

create or replace function public.pi_guard_elevated_evidence_transition()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.to_status = 'platform_verified'::public.pi_evidence_status
     and current_setting('app.pi_privileged_evidence_transition', true)
       is distinct from 'on' then
    raise exception
      'platform_verified requires the privileged attestation path'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function public.pi_guard_elevated_evidence_transition()
  from public, anon, authenticated, service_role;

drop trigger if exists trg_pi_evidence_transitions_elevated_insert
  on public.pi_evidence_status_transitions;
create trigger trg_pi_evidence_transitions_elevated_insert
  before insert on public.pi_evidence_status_transitions
  for each row execute function public.pi_guard_elevated_evidence_transition();

create or replace function public.pi_append_platform_verified_transition(
  p_evidence_id uuid,
  p_user_id uuid,
  p_reason text default null,
  p_actor_type public.pi_actor_type default 'external_employer',
  p_actor_user_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  prior_status public.pi_evidence_status;
  transition_id uuid;
begin
  if p_actor_type not in (
    'external_employer'::public.pi_actor_type,
    'admin_attestor'::public.pi_actor_type,
    'system'::public.pi_actor_type
  ) then
    raise exception 'actor is not eligible to verify evidence'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.pi_evidence_records r
    where r.id = p_evidence_id
      and r.user_id = p_user_id
  ) then
    raise exception 'evidence not found'
      using errcode = 'P0002';
  end if;

  select t.to_status
    into prior_status
  from public.pi_evidence_status_transitions t
  where t.evidence_id = p_evidence_id
  order by t.created_at desc, t.id desc
  limit 1;

  if prior_status = 'platform_verified'::public.pi_evidence_status then
    return null;
  end if;

  perform set_config('app.pi_privileged_evidence_transition', 'on', true);

  insert into public.pi_evidence_status_transitions (
    evidence_id,
    from_status,
    to_status,
    reason,
    actor_type,
    actor_user_id
  )
  values (
    p_evidence_id,
    prior_status,
    'platform_verified'::public.pi_evidence_status,
    coalesce(p_reason, 'external_attestation'),
    p_actor_type,
    p_actor_user_id
  )
  returning id into transition_id;

  return transition_id;
end;
$$;

revoke all on function public.pi_append_platform_verified_transition(
  uuid, uuid, text, public.pi_actor_type, uuid
) from public, anon, authenticated;
grant execute on function public.pi_append_platform_verified_transition(
  uuid, uuid, text, public.pi_actor_type, uuid
) to service_role;

comment on function public.pi_apply_vpp_attestation_state(
  uuid, uuid, text, text
) is
  'Batch 1: service-role-only T8 state transition for Verified-bearing VPP columns.';
comment on function public.pi_append_platform_verified_transition(
  uuid, uuid, text, public.pi_actor_type, uuid
) is
  'Batch 1: service-role-only append of platform_verified evidence status.';
comment on policy "pi_capability_score_runs_select_own"
  on public.pi_capability_score_runs is
  'Batch 1: authenticated users can read own ScoreRuns; Capability Engine service role is the only writer.';
