-- Phase 2 WP 2.1: assessment domain for baseline / adaptive interview / work sample.
-- Additive + idempotent. Sessions pin framework_version_id at start (mirrors ScoreRun).
-- Also seeds pm-core baseline assessment content and adds run_kind on score runs.

-- ---------------------------------------------------------------------------
-- ScoreRun kind (baseline vs standard) — no immutability trigger on this table
-- ---------------------------------------------------------------------------
alter table public.pi_capability_score_runs
  add column if not exists run_kind text not null default 'standard';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pi_capability_score_runs_run_kind_check'
  ) then
    alter table public.pi_capability_score_runs
      add constraint pi_capability_score_runs_run_kind_check
      check (run_kind in ('standard', 'baseline'));
  end if;
end $$;

create index if not exists pi_capability_score_runs_user_kind_idx
  on public.pi_capability_score_runs (user_id, run_kind);

-- ---------------------------------------------------------------------------
-- Assessment sessions
-- ---------------------------------------------------------------------------
create table if not exists public.pi_assessment_sessions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users(id) on delete cascade,
  kind                    text not null default 'baseline'
    check (kind in ('baseline')),
  status                  text not null default 'started'
    check (status in ('started', 'in_progress', 'completed', 'abandoned')),
  framework_version_id    uuid references public.pi_cf_framework_versions(id) on delete set null,
  framework_slug          text not null default 'pm-core',
  framework_version       text not null default '2026.1',
  target_role             text,
  target_seniority        text,
  prompt_version          text not null default 'baseline-select-v1',
  model_id                text,
  model_version           text,
  max_items               int not null default 6,
  score_run_id            uuid references public.pi_capability_score_runs(id) on delete set null,
  metadata                jsonb not null default '{}'::jsonb,
  started_at              timestamptz not null default now(),
  completed_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists pi_assessment_sessions_user_status_idx
  on public.pi_assessment_sessions (user_id, status);

create index if not exists pi_assessment_sessions_framework_idx
  on public.pi_assessment_sessions (framework_version_id);

-- ---------------------------------------------------------------------------
-- Session items (selected from catalog / adaptive selection)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_assessment_items (
  id                      uuid primary key default gen_random_uuid(),
  session_id              uuid not null references public.pi_assessment_sessions(id) on delete cascade,
  sort_order              int not null default 0,
  item_kind               text not null
    check (item_kind in ('interview', 'scenario', 'work_sample', 'reflection', 'decision')),
  slug                    text not null,
  title                   text not null,
  prompt                  text not null default '',
  competency_codes        text[] not null default '{}',
  indicator_codes         text[] not null default '{}',
  catalog_ref             text,
  payload                 jsonb not null default '{}'::jsonb,
  selection_reason        text,
  status                  text not null default 'pending'
    check (status in ('pending', 'presented', 'answered', 'skipped')),
  presented_at            timestamptz,
  created_at              timestamptz not null default now(),
  unique (session_id, slug)
);

create index if not exists pi_assessment_items_session_idx
  on public.pi_assessment_items (session_id, sort_order);

-- ---------------------------------------------------------------------------
-- Responses (append-friendly; one active response per item for MVP)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_assessment_responses (
  id                      uuid primary key default gen_random_uuid(),
  session_id              uuid not null references public.pi_assessment_sessions(id) on delete cascade,
  item_id                 uuid not null references public.pi_assessment_items(id) on delete cascade,
  user_id                 uuid not null references public.users(id) on delete cascade,
  response_text           text not null default '',
  response_payload        jsonb not null default '{}'::jsonb,
  user_contribution       jsonb not null default '{}'::jsonb,
  ai_contribution         jsonb not null default '{}'::jsonb,
  evidence_id             uuid,
  created_at              timestamptz not null default now(),
  unique (item_id)
);

create index if not exists pi_assessment_responses_session_idx
  on public.pi_assessment_responses (session_id);

-- ---------------------------------------------------------------------------
-- Work samples (optional upload metadata; text lives on the response)
-- ---------------------------------------------------------------------------
create table if not exists public.pi_work_samples (
  id                      uuid primary key default gen_random_uuid(),
  session_id              uuid not null references public.pi_assessment_sessions(id) on delete cascade,
  item_id                 uuid references public.pi_assessment_items(id) on delete set null,
  user_id                 uuid not null references public.users(id) on delete cascade,
  filename                text,
  extract_kind            text,
  char_count              int,
  storage_ref             text,
  extracted_text          text,
  response_id             uuid references public.pi_assessment_responses(id) on delete set null,
  created_at              timestamptz not null default now()
);

create index if not exists pi_work_samples_session_idx
  on public.pi_work_samples (session_id);

-- ---------------------------------------------------------------------------
-- RLS — self-only
-- ---------------------------------------------------------------------------
alter table public.pi_assessment_sessions enable row level security;
alter table public.pi_assessment_items enable row level security;
alter table public.pi_assessment_responses enable row level security;
alter table public.pi_work_samples enable row level security;

drop policy if exists "pi_assessment_sessions_self" on public.pi_assessment_sessions;
create policy "pi_assessment_sessions_self" on public.pi_assessment_sessions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "pi_assessment_items_self" on public.pi_assessment_items;
create policy "pi_assessment_items_self" on public.pi_assessment_items
  for all
  using (
    exists (
      select 1 from public.pi_assessment_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pi_assessment_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "pi_assessment_responses_self" on public.pi_assessment_responses;
create policy "pi_assessment_responses_self" on public.pi_assessment_responses
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "pi_work_samples_self" on public.pi_work_samples;
create policy "pi_work_samples_self" on public.pi_work_samples
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop trigger if exists pi_assessment_sessions_set_updated_at on public.pi_assessment_sessions;
create trigger pi_assessment_sessions_set_updated_at
  before update on public.pi_assessment_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed baseline assessment content into published pm-core (idempotent upserts).
-- Published versions are immutable — temporarily disable the content trigger.
-- ---------------------------------------------------------------------------
do $$
declare
  v_id uuid;
  comp_stake uuid;
  comp_deliv uuid;
  comp_disc uuid;
  ind_stake uuid;
  ind_deliv uuid;
  ind_disc uuid;
begin
  select fv.id into v_id
  from public.pi_cf_framework_versions fv
  join public.pi_cf_frameworks f on f.id = fv.framework_id
  where f.slug = 'pm-core'
    and fv.version = '2026.1'
    and fv.status in ('published', 'deprecated')
  limit 1;

  if v_id is null then
    raise notice '0077: no published pm-core@2026.1 — skip assessment content seed';
    return;
  end if;

  select id into comp_stake from public.pi_cf_competencies
    where framework_version_id = v_id and code = 'comp.stakeholder_management' limit 1;
  select id into comp_deliv from public.pi_cf_competencies
    where framework_version_id = v_id and code = 'comp.delivery_execution' limit 1;
  select id into comp_disc from public.pi_cf_competencies
    where framework_version_id = v_id and code = 'comp.product_discovery' limit 1;
  select id into ind_stake from public.pi_cf_indicators
    where framework_version_id = v_id and code = 'ind.stakeholder_judgement' limit 1;
  select id into ind_deliv from public.pi_cf_indicators
    where framework_version_id = v_id and code = 'ind.delivery_judgement' limit 1;
  select id into ind_disc from public.pi_cf_indicators
    where framework_version_id = v_id and code = 'ind.discovery_practice' limit 1;

  alter table public.pi_cf_assessment_content disable trigger trg_pi_cf_assessment_content_immutable;

  insert into public.pi_cf_assessment_content (
    framework_version_id, kind, slug, title, body, payload,
    competency_ids, indicator_ids, sort_order
  ) values
    (
      v_id, 'question', 'interview-stakeholder-tradeoff',
      'Stakeholder trade-off interview',
      'Describe a time you had to choose between two important stakeholder needs. What did you decide, and why?',
      '{"source":"pm-core-baseline","itemKind":"interview","phase":"baseline"}'::jsonb,
      array[comp_stake], array[ind_stake], 10
    ),
    (
      v_id, 'question', 'interview-delivery-constraint',
      'Delivery under constraint interview',
      'A critical launch date slips by two weeks. Walk through how you would re-plan scope, communication, and risk.',
      '{"source":"pm-core-baseline","itemKind":"interview","phase":"baseline"}'::jsonb,
      array[comp_deliv], array[ind_deliv], 11
    ),
    (
      v_id, 'question', 'interview-discovery-hypothesis',
      'Discovery hypothesis interview',
      'You suspect users abandon onboarding because of unclear value. How would you form and test a hypothesis before building?',
      '{"source":"pm-core-baseline","itemKind":"interview","phase":"baseline"}'::jsonb,
      array[comp_disc], array[ind_disc], 12
    ),
    (
      v_id, 'scenario', 'scope-cut-under-pressure',
      'Scope cut under executive pressure',
      'Engineering says the committed feature set cannot ship. Sales has already promised it. Decide what to cut, what to keep, and how you communicate.',
      '{"source":"pm-core-baseline","itemKind":"scenario","phase":"baseline"}'::jsonb,
      array[comp_deliv, comp_stake], array[ind_deliv, ind_stake], 20
    ),
    (
      v_id, 'scenario', 'discovery-pivot-signal',
      'Discovery pivot signal',
      'Five customer interviews contradict the roadmap assumption. Decide whether to pivot, dig deeper, or stay the course — and what evidence would change your mind.',
      '{"source":"pm-core-baseline","itemKind":"scenario","phase":"baseline"}'::jsonb,
      array[comp_disc], array[ind_disc], 21
    ),
    (
      v_id, 'work_sample', 'one-pager-decision',
      'Decision one-pager work sample',
      'Paste or upload a short decision record / one-pager (problem, options, recommendation, risks). If you do not have one, draft a concise sample for a product decision you know well.',
      '{"source":"pm-core-baseline","itemKind":"work_sample","phase":"baseline","acceptsUpload":true}'::jsonb,
      array[comp_deliv, comp_disc], array[ind_deliv, ind_disc], 30
    ),
    (
      v_id, 'question', 'reflection-evidence-limits',
      'Reflection on evidence limits',
      'Looking back at your answers: which claims feel strongest, which are thin, and what practice would produce better evidence? This is self-report — not a verified level.',
      '{"source":"pm-core-baseline","itemKind":"reflection","phase":"baseline"}'::jsonb,
      array[comp_stake, comp_deliv, comp_disc], array[ind_stake, ind_deliv, ind_disc], 40
    )
  on conflict (framework_version_id, kind, slug) do update set
    title = excluded.title,
    body = excluded.body,
    payload = excluded.payload,
    competency_ids = excluded.competency_ids,
    indicator_ids = excluded.indicator_ids,
    sort_order = excluded.sort_order;

  -- Refresh the existing conflicting-stakeholders scenario payload for baseline tagging
  update public.pi_cf_assessment_content
  set payload = coalesce(payload, '{}'::jsonb) || '{"itemKind":"scenario","phase":"baseline"}'::jsonb
  where framework_version_id = v_id
    and kind = 'scenario'
    and slug = 'conflicting-stakeholders';

  alter table public.pi_cf_assessment_content enable trigger trg_pi_cf_assessment_content_immutable;

  raise notice '0077: seeded pm-core baseline assessment content on %', v_id;
exception
  when others then
    alter table public.pi_cf_assessment_content enable trigger trg_pi_cf_assessment_content_immutable;
    raise;
end $$;
