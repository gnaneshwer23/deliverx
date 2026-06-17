-- Sprint D1 — Continuous learning (Stage 15)

do $$ begin
  create type lesson_category as enum (
    'estimation',
    'governance',
    'technical',
    'stakeholder',
    'process',
    'quality',
    'general'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type defect_leakage_category as enum (
    'req_ambiguity',
    'code_defect',
    'env_config',
    'process_gap',
    'unknown'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.structured_lessons (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  category        lesson_category not null default 'general',
  lesson          text not null,
  source          text not null default 'closure',
  confidence      numeric(3, 2) not null default 0.80 check (confidence >= 0 and confidence <= 1),
  created_at      timestamptz not null default now(),
  unique (project_id, lesson)
);

create index if not exists structured_lessons_org_idx
  on public.structured_lessons(organisation_id, category);

create table if not exists public.estimate_variance_records (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  role            text not null,
  planned_days    numeric(8, 2) not null,
  actual_days     numeric(8, 2) not null,
  variance_days   numeric(8, 2) not null,
  variance_pct    numeric(6, 2),
  recorded_at     timestamptz not null default now(),
  unique (project_id, role)
);

create index if not exists estimate_variance_project_idx
  on public.estimate_variance_records(project_id);

create table if not exists public.defect_leakage_records (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  defect_id         uuid references public.defects(id) on delete cascade,
  defect_code       text,
  title             text not null,
  leakage_category  defect_leakage_category not null default 'unknown',
  severity          text,
  classified_at     timestamptz not null default now(),
  unique (defect_id)
);

create index if not exists defect_leakage_project_idx
  on public.defect_leakage_records(project_id, leakage_category);

create table if not exists public.proposal_quality_scores (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  proposal_id     uuid not null references public.proposed_actions(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  source          text not null,
  action_type     text not null,
  quality_score   integer not null check (quality_score between 0 and 100),
  signals         jsonb not null default '{}'::jsonb,
  computed_at     timestamptz not null default now(),
  unique (proposal_id)
);

create index if not exists proposal_quality_org_idx
  on public.proposal_quality_scores(organisation_id, computed_at desc);

alter table public.structured_lessons enable row level security;
alter table public.estimate_variance_records enable row level security;
alter table public.defect_leakage_records enable row level security;
alter table public.proposal_quality_scores enable row level security;

drop policy if exists "structured_lessons_org" on public.structured_lessons;
create policy "structured_lessons_org" on public.structured_lessons
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "estimate_variance_org" on public.estimate_variance_records;
create policy "estimate_variance_org" on public.estimate_variance_records
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "defect_leakage_org" on public.defect_leakage_records;
create policy "defect_leakage_org" on public.defect_leakage_records
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "proposal_quality_org" on public.proposal_quality_scores;
create policy "proposal_quality_org" on public.proposal_quality_scores
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
