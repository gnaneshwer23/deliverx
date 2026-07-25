-- T3 — Artefact versioning & submission coherence
-- First-class artefact + immutable artefact_version model. Wires evidence
-- provenance to a specific artefact version (never a mutable blob).
-- Additive + idempotent. No capability writes; observation != evidence.

-- ---------------------------------------------------------------------------
-- Logical artefact (mutable envelope: title, status, current version pointer)
-- ---------------------------------------------------------------------------
create table if not exists public.artefacts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  kind                text not null default 'other'
    check (kind in (
      'cv', 'portfolio_case', 'work_sample', 'design_doc', 'decision_record',
      'presentation', 'report', 'star_story', 'launchpad_artefact', 'other'
    )),
  title               text not null,
  summary             text not null default '',
  status              text not null default 'draft'
    check (status in ('draft', 'active', 'submitted', 'archived')),
  confidentiality     public.pi_confidentiality not null default 'private',
  -- Optional linkage to work items / activities / source surface (no hard FK to
  -- pre-pivot delivery tables; keep PI modular monolith boundary honest).
  source_surface      text
    check (source_surface is null or source_surface in (
      'launchpad', 'workspace', 'experience', 'portfolio', 'manual', 'career'
    )),
  work_item_ref       text,
  activity_ref        text,
  project_ref         jsonb not null default '{}'::jsonb,
  current_version_id  uuid,
  current_version_number int not null default 0,
  metadata            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists artefacts_user_idx
  on public.artefacts (user_id, created_at desc);

create index if not exists artefacts_user_status_idx
  on public.artefacts (user_id, status);

drop trigger if exists artefacts_set_updated_at on public.artefacts;
create trigger artefacts_set_updated_at
  before update on public.artefacts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Immutable artefact version (content hash + provenance user vs AI)
-- ---------------------------------------------------------------------------
create table if not exists public.artefact_versions (
  id                  uuid primary key default gen_random_uuid(),
  artefact_id         uuid not null references public.artefacts(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete cascade,
  version_number      int not null,
  title               text not null,
  content             jsonb not null default '{}'::jsonb,
  storage_ref         text,
  content_hash        text not null,
  -- Provenance: who/what produced this version.
  contribution_source text not null default 'user'
    check (contribution_source in ('user', 'ai', 'mixed')),
  actor_type          public.pi_actor_type not null default 'user',
  user_contribution   jsonb not null default '{}'::jsonb,
  ai_contribution     jsonb not null default '{}'::jsonb,
  model_id            text,
  model_version       text,
  prompt_slug         text,
  prompt_version      text,
  prompt_hash         text,
  change_note         text,
  created_by          uuid references public.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  -- intentionally no updated_at — versions are immutable
  unique (artefact_id, version_number),
  unique (artefact_id, content_hash)
);

create index if not exists artefact_versions_artefact_idx
  on public.artefact_versions (artefact_id, version_number desc);

create index if not exists artefact_versions_user_idx
  on public.artefact_versions (user_id, created_at desc);

-- Point artefacts.current_version_id at the versions table (deferred FK to break cycle).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'artefacts_current_version_fk'
      and conrelid = 'public.artefacts'::regclass
  ) then
    alter table public.artefacts
      add constraint artefacts_current_version_fk
      foreign key (current_version_id)
      references public.artefact_versions(id) on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Submission / state transition audit (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.artefact_status_transitions (
  id              uuid primary key default gen_random_uuid(),
  artefact_id     uuid not null references public.artefacts(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  from_status     text,
  to_status       text not null
    check (to_status in ('draft', 'active', 'submitted', 'archived')),
  version_id      uuid references public.artefact_versions(id) on delete set null,
  reason          text,
  actor_type      public.pi_actor_type not null default 'user',
  actor_user_id   uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists artefact_status_transitions_artefact_idx
  on public.artefact_status_transitions (artefact_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Evidence citation: provenance must cite a specific artefact version,
-- never a mutable artefact envelope alone.
-- ---------------------------------------------------------------------------
alter table public.pi_evidence_provenance
  add column if not exists artefact_id uuid
    references public.artefacts(id) on delete restrict;

alter table public.pi_evidence_provenance
  add column if not exists artefact_version_id uuid
    references public.artefact_versions(id) on delete restrict;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pi_evidence_provenance_artefact_version_check'
      and conrelid = 'public.pi_evidence_provenance'::regclass
  ) then
    alter table public.pi_evidence_provenance
      add constraint pi_evidence_provenance_artefact_version_check
      check (artefact_id is null or artefact_version_id is not null);
  end if;
end $$;

create index if not exists pi_evidence_provenance_artefact_version_idx
  on public.pi_evidence_provenance (artefact_version_id)
  where artefact_version_id is not null;

-- ---------------------------------------------------------------------------
-- Immutability enforcement (prior versions + transitions are append-only).
-- Privacy purge bypass: allow DELETE only when app.pi_privacy_delete = on.
-- ---------------------------------------------------------------------------
create or replace function public.artefact_forbid_version_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_setting('app.pi_privacy_delete', true) = 'on' and tg_op = 'DELETE' then
    return old;
  end if;
  raise exception 'immutable artefact history: % does not allow %', tg_table_name, tg_op;
end;
$$;

drop trigger if exists trg_artefact_versions_immutable on public.artefact_versions;
create trigger trg_artefact_versions_immutable
  before update or delete on public.artefact_versions
  for each row execute function public.artefact_forbid_version_mutation();

drop trigger if exists trg_artefact_transitions_immutable on public.artefact_status_transitions;
create trigger trg_artefact_transitions_immutable
  before update or delete on public.artefact_status_transitions
  for each row execute function public.artefact_forbid_version_mutation();

-- ---------------------------------------------------------------------------
-- RLS — self-only, private by default
-- ---------------------------------------------------------------------------
alter table public.artefacts enable row level security;
alter table public.artefact_versions enable row level security;
alter table public.artefact_status_transitions enable row level security;

drop policy if exists "artefacts_own_select" on public.artefacts;
create policy "artefacts_own_select" on public.artefacts
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "artefacts_own_insert" on public.artefacts;
create policy "artefacts_own_insert" on public.artefacts
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "artefacts_own_update" on public.artefacts;
create policy "artefacts_own_update" on public.artefacts
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "artefacts_own_delete" on public.artefacts;
create policy "artefacts_own_delete" on public.artefacts
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "artefact_versions_own_select" on public.artefact_versions;
create policy "artefact_versions_own_select" on public.artefact_versions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "artefact_versions_own_insert" on public.artefact_versions;
create policy "artefact_versions_own_insert" on public.artefact_versions
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "artefact_transitions_own_select" on public.artefact_status_transitions;
create policy "artefact_transitions_own_select" on public.artefact_status_transitions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "artefact_transitions_own_insert" on public.artefact_status_transitions;
create policy "artefact_transitions_own_insert" on public.artefact_status_transitions
  for insert to authenticated with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Extend person PI purge (T1) to include artefact tables.
-- Deleted AFTER evidence (provenance FK to versions is RESTRICT; evidence
-- deletion cascades provenance first). Never touches pi_cf_* catalogue.
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

  -- Artefacts: after evidence (provenance RESTRICT already cleared above).
  delete from public.artefact_status_transitions where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'artefact_status_transitions:' || n);

  -- Break current_version_id FK before deleting versions.
  update public.artefacts set current_version_id = null where user_id = p_user_id;

  delete from public.artefact_versions where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'artefact_versions:' || n);

  delete from public.artefacts where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'artefacts:' || n);

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

-- ---------------------------------------------------------------------------
-- Comments (contracts)
-- ---------------------------------------------------------------------------
comment on table public.artefacts is
  'T3 logical artefact envelope. Mutable metadata + pointer to immutable current version. Self-only RLS, private by default.';
comment on table public.artefact_versions is
  'T3 immutable artefact version. Prior versions never mutate (append-only trigger). Provenance separates user vs AI contribution.';
comment on table public.artefact_status_transitions is
  'T3 append-only audit of artefact submissions / state changes.';
comment on column public.pi_evidence_provenance.artefact_version_id is
  'T3: evidence citing an artefact MUST reference a specific immutable version (never a mutable envelope).';
comment on constraint pi_evidence_provenance_artefact_version_check on public.pi_evidence_provenance is
  'T3: artefact citation requires a version id.';
