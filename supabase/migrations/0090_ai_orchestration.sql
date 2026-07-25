-- T4 — AI orchestration trust layer
-- Agent registry + immutable prompt versions + interaction cost/latency log.
-- Agents never write capability or verified evidence. Additive + idempotent.

-- ---------------------------------------------------------------------------
-- Catalogue: AI agents (platform-owned; not person PI)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_agents (
  slug                text primary key,
  role                text not null
    check (role in ('line_manager', 'stakeholder', 'observer', 'coach')),
  display_name        text not null,
  description         text not null default '',
  wraps               jsonb not null default '[]'::jsonb,
  authority           jsonb not null default '{}'::jsonb,
  default_prompt_slug text not null,
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

drop trigger if exists ai_agents_set_updated_at on public.ai_agents;
create trigger ai_agents_set_updated_at
  before update on public.ai_agents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Immutable prompt versions
-- ---------------------------------------------------------------------------
create table if not exists public.ai_prompt_versions (
  id                  uuid primary key default gen_random_uuid(),
  agent_slug          text not null references public.ai_agents(slug) on delete cascade,
  prompt_slug         text not null,
  version             text not null,
  system_template     text not null,
  user_template       text,
  output_contract     text not null,
  prompt_hash         text not null,
  created_at          timestamptz not null default now(),
  unique (agent_slug, prompt_slug, version)
);

create index if not exists ai_prompt_versions_agent_idx
  on public.ai_prompt_versions (agent_slug, prompt_slug);

-- ---------------------------------------------------------------------------
-- Person interactions (cost / latency / provenance)
-- ---------------------------------------------------------------------------
create table if not exists public.ai_interactions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(id) on delete cascade,
  agent_slug            text not null references public.ai_agents(slug) on delete restrict,
  prompt_slug           text not null,
  prompt_version        text not null,
  prompt_hash           text not null default '',
  model                 text not null default '',
  provider              text,
  status                text not null
    check (status in ('ok', 'validation_failed', 'blocked', 'error', 'fallback')),
  bound_surface         text not null default 'other'
    check (bound_surface in (
      'project', 'task', 'meeting', 'evidence', 'observation', 'career_goal',
      'experience', 'interview', 'workspace', 'artefact', 'assessment', 'other'
    )),
  bound_ref             jsonb not null default '{}'::jsonb,
  context_sources       jsonb not null default '[]'::jsonb,
  input_hash            text not null default '',
  output_hash           text,
  input_tokens          int,
  output_tokens         int,
  latency_ms            int,
  cost_estimate_usd     numeric(12, 8),
  output                jsonb,
  error_message         text,
  requires_confirmation boolean not null default true,
  confirmation_granted  boolean not null default false,
  guardrail_flags       jsonb not null default '[]'::jsonb,
  created_at            timestamptz not null default now()
);

create index if not exists ai_interactions_user_idx
  on public.ai_interactions (user_id, created_at desc);

create index if not exists ai_interactions_agent_idx
  on public.ai_interactions (agent_slug, created_at desc);

create index if not exists ai_interactions_status_idx
  on public.ai_interactions (status, created_at desc);

-- Prompt versions are immutable (catalogue integrity).
create or replace function public.ai_forbid_prompt_version_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'immutable ai prompt version: % does not allow %', tg_table_name, tg_op;
end;
$$;

drop trigger if exists trg_ai_prompt_versions_immutable on public.ai_prompt_versions;
create trigger trg_ai_prompt_versions_immutable
  before update or delete on public.ai_prompt_versions
  for each row execute function public.ai_forbid_prompt_version_mutation();

-- Interactions are append-only for person audit (purge bypass for T1 delete).
create or replace function public.ai_forbid_interaction_mutation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_setting('app.pi_privacy_delete', true) = 'on' and tg_op = 'DELETE' then
    return old;
  end if;
  raise exception 'immutable ai interaction log: % does not allow %', tg_table_name, tg_op;
end;
$$;

drop trigger if exists trg_ai_interactions_immutable on public.ai_interactions;
create trigger trg_ai_interactions_immutable
  before update or delete on public.ai_interactions
  for each row execute function public.ai_forbid_interaction_mutation();

-- ---------------------------------------------------------------------------
-- Seed catalogue (matches src/lib/ai-orchestration agents + prompts)
-- ---------------------------------------------------------------------------
insert into public.ai_agents (slug, role, display_name, description, wraps, authority, default_prompt_slug, active)
values
  (
    'line_manager', 'line_manager', 'AI Line Manager',
    'Contextual professional colleague that briefs priorities for a bound project. Never writes capability or verified evidence.',
    '["services/aiDeliveryPm","services/helmCopilot(pm-mission)"]'::jsonb,
    '{"mayWriteCapability":false,"mayModifyVerifiedEvidence":false,"mayDraftObservation":false,"maySuggestIntervention":true,"requiresUserConfirmationForActions":true,"maxTokensPerCall":2048}'::jsonb,
    'line_manager_briefing', true
  ),
  (
    'stakeholder', 'stakeholder', 'AI Stakeholder',
    'Stakeholder pressure and questions grounded in project context. Consolidates experience-sim stakeholder personas for LLM turns.',
    '["experience-sim personas","lib/ai/prompts/product-manager"]'::jsonb,
    '{"mayWriteCapability":false,"mayModifyVerifiedEvidence":false,"mayDraftObservation":false,"maySuggestIntervention":false,"requiresUserConfirmationForActions":true,"maxTokensPerCall":2048}'::jsonb,
    'stakeholder_perspective', true
  ),
  (
    'observer', 'observer', 'AI Observer',
    'Drafts workspace observations under consent. Observation is not evidence; never auto-verifies.',
    '["lib/workspace-observation","pi_interventions drafts"]'::jsonb,
    '{"mayWriteCapability":false,"mayModifyVerifiedEvidence":false,"mayDraftObservation":true,"maySuggestIntervention":true,"requiresUserConfirmationForActions":true,"maxTokensPerCall":2048}'::jsonb,
    'observer_draft', true
  ),
  (
    'experience_coach', 'coach', 'Experience Coach',
    'Registry entry for Experience simulation coaching. Deterministic engines remain primary.',
    '["lib/experience-sim","lib/experience-planner"]'::jsonb,
    '{"mayWriteCapability":false,"mayModifyVerifiedEvidence":false,"mayDraftObservation":false,"maySuggestIntervention":true,"requiresUserConfirmationForActions":true,"maxTokensPerCall":1024}'::jsonb,
    'experience_coach_hint', true
  ),
  (
    'workspace_coach', 'coach', 'Workspace Coach',
    'Consolidates delivery coach suggestions and Helm persona copilots.',
    '["services/deliveryCoach","services/helmCopilot"]'::jsonb,
    '{"mayWriteCapability":false,"mayModifyVerifiedEvidence":false,"mayDraftObservation":false,"maySuggestIntervention":true,"requiresUserConfirmationForActions":true,"maxTokensPerCall":2048}'::jsonb,
    'workspace_coach_hint', true
  ),
  (
    'interview_lab', 'coach', 'Interview Lab Coach',
    'Career Intelligence interview rehearsal coach — evidence-cited STAR practice.',
    '["lib/career-intelligence","/launchpad/app/interview"]'::jsonb,
    '{"mayWriteCapability":false,"mayModifyVerifiedEvidence":false,"mayDraftObservation":false,"maySuggestIntervention":true,"requiresUserConfirmationForActions":true,"maxTokensPerCall":1536}'::jsonb,
    'interview_lab_hint', true
  )
on conflict (slug) do update set
  role = excluded.role,
  display_name = excluded.display_name,
  description = excluded.description,
  wraps = excluded.wraps,
  authority = excluded.authority,
  default_prompt_slug = excluded.default_prompt_slug,
  active = excluded.active,
  updated_at = now();

-- Prompt version rows: system templates are short stubs in DB; app registry is SoT for full text.
-- Hash values are placeholders updated by app on first use if needed; uniqueness is (agent, slug, version).
insert into public.ai_prompt_versions (
  agent_slug, prompt_slug, version, system_template, user_template, output_contract, prompt_hash
)
values
  ('line_manager', 'line_manager_briefing', 'v1',
   'T4 line_manager_briefing@v1 — full template in src/lib/ai-orchestration/prompt-registry.ts',
   null, 'line_manager_briefing_v1', 'seed-lm-v1'),
  ('stakeholder', 'stakeholder_perspective', 'v1',
   'T4 stakeholder_perspective@v1 — full template in src/lib/ai-orchestration/prompt-registry.ts',
   null, 'stakeholder_perspective_v1', 'seed-st-v1'),
  ('observer', 'observer_draft', 'v1',
   'T4 observer_draft@v1 — full template in src/lib/ai-orchestration/prompt-registry.ts',
   null, 'observer_draft_v1', 'seed-ob-v1'),
  ('experience_coach', 'experience_coach_hint', 'v1',
   'T4 experience_coach_hint@v1 — full template in src/lib/ai-orchestration/prompt-registry.ts',
   null, 'coach_hint_v1', 'seed-ec-v1'),
  ('workspace_coach', 'workspace_coach_hint', 'v1',
   'T4 workspace_coach_hint@v1 — full template in src/lib/ai-orchestration/prompt-registry.ts',
   null, 'coach_hint_v1', 'seed-wc-v1'),
  ('interview_lab', 'interview_lab_hint', 'v1',
   'T4 interview_lab_hint@v1 — full template in src/lib/ai-orchestration/prompt-registry.ts',
   null, 'coach_hint_v1', 'seed-il-v1')
on conflict (agent_slug, prompt_slug, version) do nothing;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.ai_agents enable row level security;
alter table public.ai_prompt_versions enable row level security;
alter table public.ai_interactions enable row level security;

-- Catalogue readable by authenticated (no writes from clients).
drop policy if exists "ai_agents_authenticated_select" on public.ai_agents;
create policy "ai_agents_authenticated_select" on public.ai_agents
  for select to authenticated using (true);

drop policy if exists "ai_prompt_versions_authenticated_select" on public.ai_prompt_versions;
create policy "ai_prompt_versions_authenticated_select" on public.ai_prompt_versions
  for select to authenticated using (true);

-- Interactions: self-only read + insert (service role for orchestration writes also OK via bypass).
drop policy if exists "ai_interactions_own_select" on public.ai_interactions;
create policy "ai_interactions_own_select" on public.ai_interactions
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "ai_interactions_own_insert" on public.ai_interactions;
create policy "ai_interactions_own_insert" on public.ai_interactions
  for insert to authenticated with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Extend person PI purge to include ai_interactions (not catalogue tables).
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

  delete from public.artefact_status_transitions where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'artefact_status_transitions:' || n);

  update public.artefacts set current_version_id = null where user_id = p_user_id;

  delete from public.artefact_versions where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'artefact_versions:' || n);

  delete from public.artefacts where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'artefacts:' || n);

  -- T4: person AI interaction log (catalogue ai_agents / ai_prompt_versions retained)
  delete from public.ai_interactions where user_id = p_user_id;
  get diagnostics n = row_count; touched := array_append(touched, 'ai_interactions:' || n);

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
revoke all on function public.pi_privacy_purge_person_data(uuid, uuid) from anon, authenticated;
grant execute on function public.pi_privacy_purge_person_data(uuid, uuid) to service_role;

comment on table public.ai_agents is
  'T4 AI agent catalogue (Manager/Stakeholder/Observer/Coach). Platform-owned; not person PI.';
comment on table public.ai_prompt_versions is
  'T4 immutable prompt versions. App registry is runtime SoT; DB rows for audit/ops.';
comment on table public.ai_interactions is
  'T4 person AI interaction log — model, prompt version, context sources, tokens, latency, cost.';
