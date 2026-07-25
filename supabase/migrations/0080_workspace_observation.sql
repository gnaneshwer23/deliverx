-- Phase 4: Continuous observation — Workspace → Evidence Ledger under consent,
-- plus tracked development-loop interventions. Additive + idempotent.
-- Observer never writes capability; ScoreRun remains the only capability writer.
-- Default observation consent is OFF (no silent observation).

-- ---------------------------------------------------------------------------
-- Evidence source: workspace_observation
-- ---------------------------------------------------------------------------
alter type public.pi_evidence_source_type add value if not exists 'workspace_observation';

insert into public.pi_evidence_sources (code, label, default_category, description) values
  (
    'workspace_observation',
    'Workspace observation',
    'practice',
    'Consented behavioural sequence from Professional Workspace (context + behaviour + outcome). Observation only — Capability Engine interprets on ScoreRun.'
  )
on conflict (code) do nothing;

-- Optional back-link from contribution → ledger (nullable; never rewrites history)
alter table public.workspace_contributions
  add column if not exists evidence_id uuid;

create index if not exists workspace_contributions_evidence_idx
  on public.workspace_contributions (evidence_id)
  where evidence_id is not null;

-- ---------------------------------------------------------------------------
-- Observation consent (default OFF — no row means not consented)
-- scope: global (all projects) or project (project_kind + project_id)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_observation_consent (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users(id) on delete cascade,
  scope                   text not null default 'global'
    check (scope in ('global', 'project')),
  project_kind            text
    check (project_kind is null or project_kind in ('org', 'experience')),
  project_id              text,
  source                  text not null default 'workspace'
    check (source in ('workspace')),
  consented               boolean not null default false,
  plain_language_version  text not null default 'workspace-observation-v1',
  consented_at            timestamptz,
  revoked_at              timestamptz,
  metadata                jsonb not null default '{}'::jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint pi_observation_consent_project_scope_chk check (
    (scope = 'global' and project_kind is null and project_id is null)
    or (scope = 'project' and project_kind is not null and project_id is not null)
  )
);

-- One active global consent row per user+source
create unique index if not exists pi_observation_consent_global_uidx
  on public.pi_observation_consent (user_id, source)
  where scope = 'global';

-- One active project consent row per user+source+project
create unique index if not exists pi_observation_consent_project_uidx
  on public.pi_observation_consent (user_id, source, project_kind, project_id)
  where scope = 'project';

create index if not exists pi_observation_consent_user_idx
  on public.pi_observation_consent (user_id, updated_at desc);

alter table public.pi_observation_consent enable row level security;

drop policy if exists "pi_observation_consent_own" on public.pi_observation_consent;
create policy "pi_observation_consent_own" on public.pi_observation_consent
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Staging: behavioural sequence observations (context + behaviour + outcome)
-- Links contribution → evidence; never assigns capability levels.
-- ---------------------------------------------------------------------------
create table if not exists public.workspace_observations (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users(id) on delete cascade,
  contribution_id         uuid references public.workspace_contributions(id) on delete set null,
  evidence_id             uuid,
  module_id               text not null,
  project_kind            text not null check (project_kind in ('org', 'experience')),
  project_id              text not null,
  sequence_kind           text not null
    check (sequence_kind in ('decision', 'artefact', 'meeting_action', 'risk_response', 'reflection', 'other')),
  context                 jsonb not null default '{}'::jsonb,
  behaviour               jsonb not null default '{}'::jsonb,
  outcome                 jsonb not null default '{}'::jsonb,
  competency_hints        text[] not null default '{}',
  indicator_hints         text[] not null default '{}',
  ai_authored             boolean not null default false,
  capability_assigned     boolean not null default false,
  consent_id              uuid references public.pi_observation_consent(id) on delete set null,
  provenance              jsonb not null default '{}'::jsonb,
  created_at              timestamptz not null default now()
);

create index if not exists workspace_observations_user_idx
  on public.workspace_observations (user_id, created_at desc);

create index if not exists workspace_observations_evidence_idx
  on public.workspace_observations (evidence_id)
  where evidence_id is not null;

create index if not exists workspace_observations_contribution_idx
  on public.workspace_observations (contribution_id)
  where contribution_id is not null;

alter table public.workspace_observations enable row level security;

drop policy if exists "workspace_observations_own" on public.workspace_observations;
create policy "workspace_observations_own" on public.workspace_observations
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Development-loop interventions (recommend only — never auto-act)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_interventions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users(id) on delete cascade,
  kind                    text not null
    check (kind in ('reflection_prompt', 'scenario_suggestion', 'learning_pointer')),
  status                  text not null default 'offered'
    check (status in ('offered', 'accepted', 'dismissed', 'completed', 'expired')),
  title                   text not null,
  rationale               text not null default '',
  target_gap              text,
  competency_codes        text[] not null default '{}',
  href                    text,
  source_snapshot_id      uuid,
  source_score_run_id     uuid,
  triggering_evidence_ids uuid[] not null default '{}',
  payload                 jsonb not null default '{}'::jsonb,
  capability_assigned     boolean not null default false,
  offered_at              timestamptz not null default now(),
  accepted_at             timestamptz,
  completed_at            timestamptz,
  dismissed_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists pi_interventions_user_status_idx
  on public.pi_interventions (user_id, status, offered_at desc);

create index if not exists pi_interventions_user_gap_idx
  on public.pi_interventions (user_id, target_gap);

alter table public.pi_interventions enable row level security;

drop policy if exists "pi_interventions_own" on public.pi_interventions;
create policy "pi_interventions_own" on public.pi_interventions
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Outcomes: association with subsequent snapshot delta (not proven causation)
create table if not exists public.pi_intervention_outcomes (
  id                      uuid primary key default gen_random_uuid(),
  intervention_id         uuid not null references public.pi_interventions(id) on delete cascade,
  user_id                 uuid not null references public.users(id) on delete cascade,
  outcome_kind            text not null
    check (outcome_kind in ('accepted', 'completed', 'dismissed', 'snapshot_delta')),
  before_snapshot_id      uuid,
  after_snapshot_id       uuid,
  cited_evidence_ids      uuid[] not null default '{}',
  readiness_delta         int,
  gaps_closed             text[] not null default '{}',
  note                    text,
  association_only        boolean not null default true,
  payload                 jsonb not null default '{}'::jsonb,
  created_at              timestamptz not null default now()
);

create index if not exists pi_intervention_outcomes_intervention_idx
  on public.pi_intervention_outcomes (intervention_id, created_at desc);

create index if not exists pi_intervention_outcomes_user_idx
  on public.pi_intervention_outcomes (user_id, created_at desc);

alter table public.pi_intervention_outcomes enable row level security;

drop policy if exists "pi_intervention_outcomes_own" on public.pi_intervention_outcomes;
create policy "pi_intervention_outcomes_own" on public.pi_intervention_outcomes
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());
