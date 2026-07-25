-- Phase 3 WP 3.1 (MVP): experience scenario catalogue + personalised plans.
-- Additive + idempotent. Plans recommend / emphasise MediFlow scenarios from ScoreRun gaps.
-- Planner never assigns capability — Experience → ledger → ScoreRun remains the write path.

-- ---------------------------------------------------------------------------
-- Scenario catalogue (versioned, framework-pinned)
-- ---------------------------------------------------------------------------
create table if not exists public.experience_scenarios (
  id                      uuid primary key default gen_random_uuid(),
  slug                    text not null,
  title                   text not null,
  company_key             text not null default 'mediflow',
  project_key             text not null default 'trustcare',
  emphasis                text not null
    check (emphasis in ('stakeholder', 'delivery', 'discovery', 'balanced')),
  framework_slug          text not null default 'pm-core',
  framework_version       text not null default '2026.1',
  framework_version_id    uuid references public.pi_cf_framework_versions(id) on delete set null,
  competency_codes        text[] not null default '{}',
  prompt_version          text not null default 'experience-plan-v1',
  summary                 text not null default '',
  coaching_focus          text not null default '',
  decision_emphasis       jsonb not null default '[]'::jsonb,
  status                  text not null default 'published'
    check (status in ('draft', 'published', 'retired')),
  metadata                jsonb not null default '{}'::jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (slug)
);

create index if not exists experience_scenarios_emphasis_idx
  on public.experience_scenarios (emphasis, status);

create index if not exists experience_scenarios_framework_idx
  on public.experience_scenarios (framework_version_id);

-- ---------------------------------------------------------------------------
-- Personalised plans (gap-ranked recommendation records)
-- ---------------------------------------------------------------------------
create table if not exists public.experience_plans (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users(id) on delete cascade,
  status                  text not null default 'active'
    check (status in ('active', 'accepted', 'completed', 'superseded')),
  scenario_id             uuid references public.experience_scenarios(id) on delete set null,
  scenario_slug           text not null,
  emphasis                text not null
    check (emphasis in ('stakeholder', 'delivery', 'discovery', 'balanced')),
  target_role             text,
  target_seniority        text,
  snapshot_id             uuid,
  score_run_id            uuid,
  framework_version_id    uuid references public.pi_cf_framework_versions(id) on delete set null,
  ranked_gaps             jsonb not null default '[]'::jsonb,
  targeted_competencies   text[] not null default '{}',
  rationale               text not null default '',
  evidence_links          jsonb not null default '[]'::jsonb,
  enrolment_id            uuid references public.xperience_enrolments(id) on delete set null,
  planner_version         text not null default 'experience-plan-v1',
  metadata                jsonb not null default '{}'::jsonb,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  accepted_at             timestamptz,
  completed_at            timestamptz
);

create index if not exists experience_plans_user_status_idx
  on public.experience_plans (user_id, status, created_at desc);

create index if not exists experience_plans_scenario_idx
  on public.experience_plans (scenario_slug);

-- ---------------------------------------------------------------------------
-- RLS — scenarios readable by authenticated; plans self-only
-- ---------------------------------------------------------------------------
alter table public.experience_scenarios enable row level security;
alter table public.experience_plans enable row level security;

drop policy if exists "experience_scenarios_read" on public.experience_scenarios;
create policy "experience_scenarios_read" on public.experience_scenarios
  for select
  using (auth.role() = 'authenticated' and status = 'published');

drop policy if exists "experience_plans_self" on public.experience_plans;
create policy "experience_plans_self" on public.experience_plans
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop trigger if exists experience_scenarios_set_updated_at on public.experience_scenarios;
create trigger experience_scenarios_set_updated_at
  before update on public.experience_scenarios
  for each row execute function public.set_updated_at();

drop trigger if exists experience_plans_set_updated_at on public.experience_plans;
create trigger experience_plans_set_updated_at
  before update on public.experience_plans
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed MediFlow emphasis variants (idempotent)
-- ---------------------------------------------------------------------------
do $$
declare
  v_id uuid;
begin
  select fv.id into v_id
  from public.pi_cf_framework_versions fv
  join public.pi_cf_frameworks f on f.id = fv.framework_id
  where f.slug = 'pm-core'
    and fv.version = '2026.1'
    and fv.status in ('published', 'deprecated')
  limit 1;

  insert into public.experience_scenarios (
    slug, title, company_key, project_key, emphasis,
    framework_slug, framework_version, framework_version_id,
    competency_codes, prompt_version, summary, coaching_focus,
    decision_emphasis, status, metadata
  ) values
    (
      'mediflow-trustcare-stakeholder',
      'MediFlow TrustCare — stakeholder alignment',
      'mediflow', 'trustcare', 'stakeholder',
      'pm-core', '2026.1', v_id,
      array['comp.stakeholder_management'],
      'experience-plan-v1',
      'Practice TrustCare Day 1 with emphasis on executive and sales stakeholder judgement.',
      'Prioritise clarifying commitments with Sarah and James before locking a date.',
      '["discuss_options","make_decision"]'::jsonb,
      'published',
      '{"experienceKey":"mediflow_trustcare_v1","day":1}'::jsonb
    ),
    (
      'mediflow-trustcare-delivery',
      'MediFlow TrustCare — delivery under constraint',
      'mediflow', 'trustcare', 'delivery',
      'pm-core', '2026.1', v_id,
      array['comp.delivery_execution'],
      'experience-plan-v1',
      'Practice TrustCare Day 1 with emphasis on engineering capacity and scope realism.',
      'Prioritise Maya''s capacity signal and what can actually ship before any commit.',
      '["review_context","make_decision"]'::jsonb,
      'published',
      '{"experienceKey":"mediflow_trustcare_v1","day":1}'::jsonb
    ),
    (
      'mediflow-trustcare-discovery',
      'MediFlow TrustCare — discovery before commit',
      'mediflow', 'trustcare', 'discovery',
      'pm-core', '2026.1', v_id,
      array['comp.product_discovery'],
      'experience-plan-v1',
      'Practice TrustCare Day 1 with emphasis on clarifying the problem and evidence before deciding.',
      'Prioritise reviewing the brief and customer pulse before answering Sales.',
      '["review_context","discuss_options"]'::jsonb,
      'published',
      '{"experienceKey":"mediflow_trustcare_v1","day":1}'::jsonb
    ),
    (
      'mediflow-trustcare-balanced',
      'MediFlow TrustCare — balanced Day 1',
      'mediflow', 'trustcare', 'balanced',
      'pm-core', '2026.1', v_id,
      array['comp.stakeholder_management','comp.delivery_execution','comp.product_discovery'],
      'experience-plan-v1',
      'Default MediFlow TrustCare Day 1 when gaps are thin or mixed.',
      'Balance fact-gathering, facilitation, and a clear commit-or-renegotiate decision.',
      '["review_context","discuss_options","make_decision"]'::jsonb,
      'published',
      '{"experienceKey":"mediflow_trustcare_v1","day":1,"fallback":true}'::jsonb
    )
  on conflict (slug) do update set
    title = excluded.title,
    emphasis = excluded.emphasis,
    framework_version_id = coalesce(excluded.framework_version_id, experience_scenarios.framework_version_id),
    competency_codes = excluded.competency_codes,
    summary = excluded.summary,
    coaching_focus = excluded.coaching_focus,
    decision_emphasis = excluded.decision_emphasis,
    status = excluded.status,
    metadata = excluded.metadata,
    updated_at = now();

  raise notice '0078: seeded MediFlow experience scenario emphases (framework_version_id=%)', v_id;
end $$;
