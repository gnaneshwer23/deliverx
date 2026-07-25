-- Phase 5 (part B): final assessment, transfer tasks, and growth reports.
-- Additive + idempotent. Reuses pi_assessment_* ; ScoreRun remains the only capability writer.
-- Descriptive only (D9) — no pass/fail. Transfer industry must differ from Experience context.
-- Depends on 0081 enum values already committed.

insert into public.pi_evidence_sources (code, label, default_category, description) values
  (
    'final_assessment',
    'Final assessment',
    'practice',
    'Post-project interview, work sample and reflection after Experience — observed evidence only.'
  ),
  (
    'transfer_assessment',
    'Transfer assessment',
    'practice',
    'Novel-context transfer task in a different industry/context than practised Experience.'
  )
on conflict (code) do nothing;

-- ---------------------------------------------------------------------------
-- ScoreRun kinds: final + transfer (extend check constraint)
-- ---------------------------------------------------------------------------
alter table public.pi_capability_score_runs
  drop constraint if exists pi_capability_score_runs_run_kind_check;

alter table public.pi_capability_score_runs
  add constraint pi_capability_score_runs_run_kind_check
  check (run_kind in ('standard', 'baseline', 'final', 'transfer'));

-- ---------------------------------------------------------------------------
-- Assessment sessions: allow kind=final; link Experience plan / enrolment
-- ---------------------------------------------------------------------------
alter table public.pi_assessment_sessions
  drop constraint if exists pi_assessment_sessions_kind_check;

alter table public.pi_assessment_sessions
  add constraint pi_assessment_sessions_kind_check
  check (kind in ('baseline', 'final'));

alter table public.pi_assessment_sessions
  add column if not exists experience_plan_id uuid;

alter table public.pi_assessment_sessions
  add column if not exists experience_enrolment_id uuid;

alter table public.pi_assessment_sessions
  add column if not exists growth_report_id uuid;

create index if not exists pi_assessment_sessions_user_kind_idx
  on public.pi_assessment_sessions (user_id, kind, status);

-- ---------------------------------------------------------------------------
-- Assessment items: allow transfer item kind
-- ---------------------------------------------------------------------------
alter table public.pi_assessment_items
  drop constraint if exists pi_assessment_items_item_kind_check;

alter table public.pi_assessment_items
  add constraint pi_assessment_items_item_kind_check
  check (item_kind in (
    'interview', 'scenario', 'work_sample', 'reflection', 'decision', 'transfer'
  ));

-- ---------------------------------------------------------------------------
-- Growth reports — immutable citation-backed baseline → practice → final
-- ---------------------------------------------------------------------------
create table if not exists public.pi_growth_reports (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references public.users(id) on delete cascade,
  framework_version_id      uuid references public.pi_cf_framework_versions(id) on delete set null,
  framework_slug            text not null default 'pm-core',
  framework_version         text not null default '2026.1',
  baseline_snapshot_id      uuid references public.pi_capability_snapshots(id) on delete set null,
  practice_snapshot_id      uuid references public.pi_capability_snapshots(id) on delete set null,
  final_snapshot_id         uuid references public.pi_capability_snapshots(id) on delete set null,
  baseline_score_run_id     uuid references public.pi_capability_score_runs(id) on delete set null,
  practice_score_run_id     uuid references public.pi_capability_score_runs(id) on delete set null,
  final_score_run_id        uuid references public.pi_capability_score_runs(id) on delete set null,
  assessment_session_id     uuid references public.pi_assessment_sessions(id) on delete set null,
  experience_plan_id        uuid,
  experience_industry       text,
  transfer_industry         text,
  transfer_slug             text,
  status                    text not null default 'ready'
    check (status in ('insufficient_history', 'ready', 'blocked_cross_version')),
  report                    jsonb not null default '{}'::jsonb,
  evidence_ids              uuid[] not null default '{}',
  citation_count            int not null default 0,
  next_action_kind          text
    check (next_action_kind is null or next_action_kind in (
      'portfolio_eligibility', 'career_readiness', 'evidence', 'experience'
    )),
  capability_assigned       boolean not null default false,
  created_at                timestamptz not null default now()
);

create index if not exists pi_growth_reports_user_idx
  on public.pi_growth_reports (user_id, created_at desc);

create index if not exists pi_growth_reports_session_idx
  on public.pi_growth_reports (assessment_session_id)
  where assessment_session_id is not null;

alter table public.pi_growth_reports enable row level security;

drop policy if exists "pi_growth_reports_self" on public.pi_growth_reports;
create policy "pi_growth_reports_self" on public.pi_growth_reports
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Back-link from sessions (nullable FK after growth reports exist)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'pi_assessment_sessions_growth_report_id_fkey'
  ) then
    alter table public.pi_assessment_sessions
      add constraint pi_assessment_sessions_growth_report_id_fkey
      foreign key (growth_report_id) references public.pi_growth_reports(id)
      on delete set null;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Seed transfer_task assessment content into published pm-core (idempotent)
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
    raise notice '0082: no published pm-core@2026.1 — skip transfer content seed';
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
      v_id, 'question', 'final-interview-post-project',
      'Post-project reflection interview',
      'Looking back at your Experience project: what decision most changed the outcome, what evidence supported it, and what would you do differently under similar pressure?',
      '{"source":"pm-core-final","itemKind":"interview","phase":"final"}'::jsonb,
      array[comp_stake, comp_deliv], array[ind_stake, ind_deliv], 110
    ),
    (
      v_id, 'work_sample', 'final-work-sample-independent',
      'Independent work sample',
      'Paste a short decision record or one-pager from (or modelled on) your recent practice: problem, options, recommendation, risks, and how you would know you were wrong.',
      '{"source":"pm-core-final","itemKind":"work_sample","phase":"final","acceptsUpload":true}'::jsonb,
      array[comp_deliv, comp_disc], array[ind_deliv, ind_disc], 120
    ),
    (
      v_id, 'transfer_task', 'transfer-civic-budget-cut',
      'Transfer: civic budget cut trade-off',
      'You are advising a city digital services team (not your Experience industry). Mid-year budget cut forces choosing between accessibility remediation and a mayor-facing dashboard. Decide, name trade-offs, and how you communicate to elected officials and engineering.',
      '{"source":"pm-core-final","itemKind":"transfer","phase":"final","industry":"civic_tech","transfer":true}'::jsonb,
      array[comp_stake, comp_deliv], array[ind_stake, ind_deliv], 130
    ),
    (
      v_id, 'transfer_task', 'transfer-fintech-compliance-hold',
      'Transfer: fintech compliance hold',
      'You join a payments startup (unfamiliar context). Compliance flags a launch feature 10 days before go-live. Sales has demos booked. Decide whether to delay, ship with controls, or cut scope — and how you brief the founder.',
      '{"source":"pm-core-final","itemKind":"transfer","phase":"final","industry":"fintech","transfer":true}'::jsonb,
      array[comp_stake, comp_deliv, comp_disc], array[ind_stake, ind_deliv, ind_disc], 131
    ),
    (
      v_id, 'transfer_task', 'transfer-logistics-route-pivot',
      'Transfer: logistics route discovery pivot',
      'A freight logistics platform (new industry for you) sees pilot customers reject the core routing assumption. Decide whether to pivot discovery, dig deeper, or stay the course — and what evidence would change your mind.',
      '{"source":"pm-core-final","itemKind":"transfer","phase":"final","industry":"logistics","transfer":true}'::jsonb,
      array[comp_disc], array[ind_disc], 132
    ),
    (
      v_id, 'transfer_task', 'transfer-retail-omnishop-cut',
      'Transfer: retail omnichannel scope cut',
      'A national retailer (different context) cannot ship both click-and-collect and loyalty redesign this quarter. Decide what to cut, what to keep, and how you communicate to store ops and the CMO.',
      '{"source":"pm-core-final","itemKind":"transfer","phase":"final","industry":"retail","transfer":true}'::jsonb,
      array[comp_deliv, comp_stake], array[ind_deliv, ind_stake], 133
    ),
    (
      v_id, 'question', 'final-reflection-transfer-limits',
      'Reflection on transfer limits',
      'Which parts of your answer relied on Experience familiarity versus transferable judgement? Where is evidence still thin? This is self-report — not a verified level.',
      '{"source":"pm-core-final","itemKind":"reflection","phase":"final"}'::jsonb,
      array[comp_stake, comp_deliv, comp_disc], array[ind_stake, ind_deliv, ind_disc], 140
    )
  on conflict (framework_version_id, kind, slug) do update set
    title = excluded.title,
    body = excluded.body,
    payload = excluded.payload,
    competency_ids = excluded.competency_ids,
    indicator_ids = excluded.indicator_ids,
    sort_order = excluded.sort_order;

  alter table public.pi_cf_assessment_content enable trigger trg_pi_cf_assessment_content_immutable;

  raise notice '0082: seeded pm-core final/transfer assessment content on %', v_id;
exception
  when others then
    alter table public.pi_cf_assessment_content enable trigger trg_pi_cf_assessment_content_immutable;
    raise;
end $$;
