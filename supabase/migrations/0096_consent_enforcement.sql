-- Remediation R-P1-11 / DB-P1-01 — observation consent at the Postgres boundary.
-- Consent defaults OFF (missing row = deny). Project override wins when present.
-- Blocks NEW workspace_observations and workspace_observation ledger rows without
-- active consent. Does not delete or rewrite historical observations/evidence.
-- No service-role GUC bypass: consent is a product invariant for observation creation.
-- Observation ≠ evidence ≠ capability; capability_assigned stays false.

-- ---------------------------------------------------------------------------
-- Effective consent helper (mirrors src/lib/workspace-observation/consent.ts)
-- ---------------------------------------------------------------------------

create or replace function public.pi_workspace_observation_consent_allows(
  p_user_id uuid,
  p_project_kind text,
  p_project_id text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  project_consented boolean;
  global_consented boolean;
begin
  if p_user_id is null
     or p_project_kind is null
     or p_project_id is null
     or length(btrim(p_project_kind)) = 0
     or length(btrim(p_project_id)) = 0 then
    return false;
  end if;

  select c.consented
    into project_consented
  from public.pi_observation_consent c
  where c.user_id = p_user_id
    and c.source = 'workspace'
    and c.scope = 'project'
    and c.project_kind = p_project_kind
    and c.project_id = p_project_id
  limit 1;

  if found then
    return coalesce(project_consented, false);
  end if;

  select c.consented
    into global_consented
  from public.pi_observation_consent c
  where c.user_id = p_user_id
    and c.source = 'workspace'
    and c.scope = 'global'
  limit 1;

  return coalesce(global_consented, false);
end;
$$;

revoke all on function public.pi_workspace_observation_consent_allows(uuid, text, text)
  from public, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- workspace_observations: INSERT requires active consent; never capability.
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workspace_observations_no_capability_chk'
      and conrelid = 'public.workspace_observations'::regclass
  ) then
    alter table public.workspace_observations
      add constraint workspace_observations_no_capability_chk
      check (capability_assigned = false);
  end if;
end;
$$;

create or replace function public.pi_guard_workspace_observation_consent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.pi_workspace_observation_consent_allows(
    new.user_id,
    new.project_kind,
    new.project_id
  ) then
    raise exception
      'observation consent required: workspace observation insert denied without active consent'
      using errcode = '42501';
  end if;

  if new.capability_assigned is distinct from false then
    raise exception
      'workspace observations cannot assign capability'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.pi_guard_workspace_observation_consent()
  from public, anon, authenticated, service_role;

drop trigger if exists trg_workspace_observations_consent
  on public.workspace_observations;
create trigger trg_workspace_observations_consent
  before insert on public.workspace_observations
  for each row execute function public.pi_guard_workspace_observation_consent();

-- ---------------------------------------------------------------------------
-- Derived ledger path: workspace_observation evidence requires the same consent.
-- Other source types (Experience, baseline, reflection, …) are untouched.
-- Project refs are read from raw_content.context (camelCase or snake_case).
-- ---------------------------------------------------------------------------

create or replace function public.pi_guard_workspace_observation_evidence_consent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  project_kind text;
  project_id text;
begin
  if new.source_type is distinct from 'workspace_observation'::public.pi_evidence_source_type then
    return new;
  end if;

  project_kind := coalesce(
    nullif(btrim(new.raw_content #>> '{context,projectKind}'), ''),
    nullif(btrim(new.raw_content #>> '{context,project_kind}'), '')
  );
  project_id := coalesce(
    nullif(btrim(new.raw_content #>> '{context,projectId}'), ''),
    nullif(btrim(new.raw_content #>> '{context,project_id}'), '')
  );

  if project_kind is null or project_id is null then
    raise exception
      'observation consent required: workspace_observation evidence needs project context'
      using errcode = '42501';
  end if;

  if not public.pi_workspace_observation_consent_allows(
    new.user_id,
    project_kind,
    project_id
  ) then
    raise exception
      'observation consent required: workspace_observation evidence insert denied without active consent'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.pi_guard_workspace_observation_evidence_consent()
  from public, anon, authenticated, service_role;

drop trigger if exists trg_pi_evidence_workspace_observation_consent
  on public.pi_evidence_records;
create trigger trg_pi_evidence_workspace_observation_consent
  before insert on public.pi_evidence_records
  for each row execute function public.pi_guard_workspace_observation_evidence_consent();
