-- T1 — Privacy requests + advisor hygiene (TD-004 / TD-005)
-- GDPR-style export / deletion job status for person PI.
-- Additive + idempotent. Does not expand P8/P9 or capability writes.

-- ---------------------------------------------------------------------------
-- Privacy request ledger (legal minimum retention of request tombstones)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_privacy_requests (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.users(id) on delete set null,
  request_type        text not null
    check (request_type in ('export', 'delete')),
  status              text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  -- Export: optional short-lived summary (never store another user's data here).
  export_summary      jsonb not null default '{}'::jsonb,
  -- Delete: confirmation phrase checked in app; never store raw password.
  confirmation_phrase text,
  error_message       text,
  retention_note      text not null default
    'Legal minimum: request tombstone retained after person PI purge.',
  tables_touched      text[] not null default '{}',
  requested_at        timestamptz not null default now(),
  completed_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  metadata            jsonb not null default '{}'::jsonb
);

create index if not exists pi_privacy_requests_user_idx
  on public.pi_privacy_requests (user_id, requested_at desc);

create index if not exists pi_privacy_requests_status_idx
  on public.pi_privacy_requests (status, request_type);

drop trigger if exists pi_privacy_requests_set_updated_at on public.pi_privacy_requests;
create trigger pi_privacy_requests_set_updated_at
  before update on public.pi_privacy_requests
  for each row execute function public.set_updated_at();

alter table public.pi_privacy_requests enable row level security;

drop policy if exists "pi_privacy_requests_own_select" on public.pi_privacy_requests;
create policy "pi_privacy_requests_own_select" on public.pi_privacy_requests
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "pi_privacy_requests_own_insert" on public.pi_privacy_requests;
create policy "pi_privacy_requests_own_insert" on public.pi_privacy_requests
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "pi_privacy_requests_own_update" on public.pi_privacy_requests;
create policy "pi_privacy_requests_own_update" on public.pi_privacy_requests
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- TD-004: lock search_path on forbid_* trigger functions
-- ---------------------------------------------------------------------------
create or replace function public.pi_forbid_evidence_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_setting('app.pi_privacy_delete', true) = 'on' and tg_op = 'DELETE' then
    return old;
  end if;
  raise exception 'append-only: % does not allow %', tg_table_name, tg_op;
end;
$$;

create or replace function public.pi_forbid_capability_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_setting('app.pi_privacy_delete', true) = 'on' and tg_op = 'DELETE' then
    return old;
  end if;
  raise exception 'append-only: % does not allow %', tg_table_name, tg_op;
end;
$$;

create or replace function public.pi_forbid_review_event_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_setting('app.pi_privacy_delete', true) = 'on' and tg_op = 'DELETE' then
    return old;
  end if;
  raise exception 'append-only: pi_review_events does not allow %', tg_op;
end;
$$;

create or replace function public.experience_sim_forbid_event_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_setting('app.pi_privacy_delete', true) = 'on' and tg_op = 'DELETE' then
    return old;
  end if;
  raise exception 'append-only: experience_sim_events';
end;
$$;

create or replace function public.pi_cf_forbid_immutable_content_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  version_id uuid;
begin
  -- Privacy purge never mutates shared framework catalogue content.
  version_id := coalesce(
    case when tg_op = 'DELETE' then old.framework_version_id else new.framework_version_id end,
    null
  );
  if version_id is not null and public.pi_cf_version_is_immutable(version_id) then
    raise exception
      'immutable framework version content: cannot % on % when status is published/deprecated/archived',
      lower(tg_op), tg_table_name;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.pi_cf_forbid_immutable_version_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status in ('published', 'deprecated', 'archived') then
    if new.version is distinct from old.version
       or new.framework_id is distinct from old.framework_id
       or new.content_hash is distinct from old.content_hash
       or new.title is distinct from old.title
       or new.changelog is distinct from old.changelog
       or new.rubric_version_id is distinct from old.rubric_version_id then
      raise exception
        'immutable framework version: content fields locked after publish (create a new version instead)';
    end if;
    if old.status = 'published' and new.status not in ('published', 'deprecated') then
      raise exception 'invalid status transition from published to %', new.status;
    end if;
    if old.status = 'deprecated' and new.status not in ('deprecated', 'archived') then
      raise exception 'invalid status transition from deprecated to %', new.status;
    end if;
    if old.status = 'archived' and new.status is distinct from 'archived' then
      raise exception 'archived framework versions cannot change status';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.pi_cf_forbid_audit_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Shared CF audit is never subject to person privacy purge.
  raise exception 'immutable audit event: %', tg_table_name;
end;
$$;

-- ---------------------------------------------------------------------------
-- TD-005: explicit deny-all for authenticated on pi_cf_audit_events
-- (service role bypasses RLS; intentional lockout for clients)
-- ---------------------------------------------------------------------------
drop policy if exists "pi_cf_audit_events_deny" on public.pi_cf_audit_events;
drop policy if exists "pi_cf_audit_events_authenticated_deny" on public.pi_cf_audit_events;
create policy "pi_cf_audit_events_authenticated_deny" on public.pi_cf_audit_events
  for all to authenticated
  using (false)
  with check (false);

-- ---------------------------------------------------------------------------
-- Person PI purge (security definer). Never touches pi_cf_* catalogue.
-- Sets app.pi_privacy_delete so append-only forbid_* allow DELETE only.
-- ---------------------------------------------------------------------------
create or replace function public.pi_privacy_purge_person_data(p_user_id uuid, p_request_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  touched text[] := '{}';
  n bigint;
begin
  if p_user_id is null then
    raise exception 'p_user_id required';
  end if;

  perform set_config('app.pi_privacy_delete', 'on', true);

  -- Child / leaf person tables first (order matters for FKs without cascade).
  delete from public.pi_intervention_outcomes where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_intervention_outcomes:' || n);

  delete from public.pi_interventions where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_interventions:' || n);

  delete from public.workspace_observations where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'workspace_observations:' || n);

  delete from public.pi_observation_consent where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_observation_consent:' || n);

  delete from public.pi_calibration_findings where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_calibration_findings:' || n);

  delete from public.pi_outcome_events where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_outcome_events:' || n);

  delete from public.pi_learning_items where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_learning_items:' || n);

  delete from public.pi_learning_paths where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_learning_paths:' || n);

  delete from public.pi_growth_reports where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_growth_reports:' || n);

  delete from public.pi_assessment_sessions where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_assessment_sessions:' || n);

  delete from public.pi_review_notifications where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_review_notifications:' || n);

  delete from public.pi_review_events where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_review_events:' || n);

  delete from public.pi_review_cases where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_review_cases:' || n);

  delete from public.pi_capability_reviews where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_capability_reviews:' || n);

  delete from public.pi_capability_judgements where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_capability_judgements:' || n);

  delete from public.pi_capability_snapshots where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_capability_snapshots:' || n);

  delete from public.pi_capability_score_runs where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_capability_score_runs:' || n);

  -- Portfolio evidence links RESTRICT on ledger rows — clear before evidence purge.
  delete from public.vpp_shares where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'vpp_shares:' || n);

  delete from public.vpp_versions where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'vpp_versions:' || n);

  delete from public.vpp_entry_evidence
    where entry_id in (select id from public.vpp_entries where user_id = p_user_id);
  get diagnostics n = row_count; touched := array_append(touched, 'vpp_entry_evidence:' || n);

  delete from public.vpp_entries where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'vpp_entries:' || n);

  delete from public.pi_evidence_challenges where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_evidence_challenges:' || n);

  delete from public.pi_evidence_competency_links
    where evidence_id in (select id from public.pi_evidence_records where user_id = p_user_id);
  get diagnostics n = row_count; touched := array_append(touched, 'pi_evidence_competency_links:' || n);

  delete from public.pi_evidence_interpretations
    where evidence_id in (select id from public.pi_evidence_records where user_id = p_user_id);
  get diagnostics n = row_count; touched := array_append(touched, 'pi_evidence_interpretations:' || n);

  delete from public.pi_evidence_status_transitions
    where evidence_id in (select id from public.pi_evidence_records where user_id = p_user_id);
  get diagnostics n = row_count; touched := array_append(touched, 'pi_evidence_status_transitions:' || n);

  delete from public.pi_evidence_processing_jobs
    where evidence_id in (select id from public.pi_evidence_records where user_id = p_user_id);
  get diagnostics n = row_count; touched := array_append(touched, 'pi_evidence_processing_jobs:' || n);

  delete from public.pi_evidence_provenance
    where evidence_id in (select id from public.pi_evidence_records where user_id = p_user_id);
  get diagnostics n = row_count; touched := array_append(touched, 'pi_evidence_provenance:' || n);

  delete from public.pi_evidence_records where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_evidence_records:' || n);

  delete from public.pi_onboarding_sessions where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'pi_onboarding_sessions:' || n);

  delete from public.experience_plans where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'experience_plans:' || n);

  delete from public.experience_sim_events where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'experience_sim_events:' || n);

  delete from public.xperience_evidence where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'xperience_evidence:' || n);

  delete from public.xperience_decisions where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'xperience_decisions:' || n);

  delete from public.xperience_enrolments where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'xperience_enrolments:' || n);

  delete from public.xperience_profiles where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'xperience_profiles:' || n);

  delete from public.launchpad_artefacts where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'launchpad_artefacts:' || n);

  delete from public.launchpad_progress where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'launchpad_progress:' || n);

  delete from public.launchpad_profiles where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'launchpad_profiles:' || n);

  delete from public.workspace_contributions where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'workspace_contributions:' || n);

  delete from public.career_activities where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'career_activities:' || n);

  delete from public.career_applications where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'career_applications:' || n);

  -- Domain events: remove person events except this privacy request's tombstones.
  delete from public.pi_domain_events
    where user_id = p_user_id
      and not (
        event_type like 'privacy.%'
        and (p_request_id is null or aggregate_id = p_request_id)
      );
  get diagnostics n = row_count; touched := array_append(touched, 'pi_domain_events:' || n);

  if p_request_id is not null then
    update public.pi_privacy_requests
      set tables_touched = touched,
          updated_at = now()
      where id = p_request_id;
  end if;

  return jsonb_build_object(
    'user_id', p_user_id,
    'request_id', p_request_id,
    'tables_touched', to_jsonb(touched)
  );
end;
$$;

revoke all on function public.pi_privacy_purge_person_data(uuid, uuid) from public;
grant execute on function public.pi_privacy_purge_person_data(uuid, uuid) to service_role;

comment on table public.pi_privacy_requests is
  'T1 privacy export/delete job status. Tombstones retained as legal minimum after purge.';
comment on function public.pi_privacy_purge_person_data(uuid, uuid) is
  'Service-role person PI purge. Never deletes pi_cf_* shared catalogue. Append-only bypass via app.pi_privacy_delete.';
comment on policy "pi_cf_audit_events_authenticated_deny" on public.pi_cf_audit_events is
  'TD-005: explicit deny-all for authenticated; service role only for CF audit.';
