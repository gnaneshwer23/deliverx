-- Architecture OS — milestones, benefits, governance approvals, closure, reporting pipeline

do $$ begin
  create type milestone_status as enum ('planned', 'at_risk', 'completed', 'slipped');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_level as enum ('pm', 'sponsor', 'steering');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_review_status as enum ('draft', 'reviewed', 'published');
exception when duplicate_object then null; end $$;

-- Milestones
create table if not exists public.milestones (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  workstream_id   uuid references public.workstreams(id) on delete set null,
  title           text not null,
  description     text,
  target_date     date,
  confidence_score int not null default 80 check (confidence_score between 0 and 100),
  status          milestone_status not null default 'planned',
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists milestones_project_idx on public.milestones(project_id);

-- Benefits realisation
create table if not exists public.benefit_hypotheses (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  title           text not null,
  description     text,
  kpi_name        text,
  baseline_value  numeric,
  target_value    numeric,
  current_value   numeric,
  unit            text,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists benefit_hypotheses_project_idx on public.benefit_hypotheses(project_id);

-- Steering / sponsor approval trail
create table if not exists public.governance_approvals (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  entity_type     text not null check (entity_type in ('decision', 'change', 'risk')),
  entity_id       uuid not null,
  approval_level  approval_level not null default 'steering',
  status          approval_status not null default 'pending',
  notes           text,
  decided_by      uuid references public.users(id) on delete set null,
  decided_at      timestamptz,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists governance_approvals_project_idx on public.governance_approvals(project_id);
create index if not exists governance_approvals_status_idx on public.governance_approvals(status);

-- Project lifecycle extensions
alter table public.projects
  add column if not exists baseline_confirmed_at timestamptz,
  add column if not exists published_at timestamptz,
  add column if not exists closure_package jsonb;

alter table public.reports
  add column if not exists review_status report_review_status not null default 'draft',
  add column if not exists published_at timestamptz,
  add column if not exists stakeholder_emails jsonb;

-- RLS
alter table public.milestones enable row level security;
alter table public.benefit_hypotheses enable row level security;
alter table public.governance_approvals enable row level security;

drop policy if exists "milestones_org" on public.milestones;
create policy "milestones_org" on public.milestones
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "benefits_org" on public.benefit_hypotheses;
create policy "benefits_org" on public.benefit_hypotheses
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "approvals_org" on public.governance_approvals;
create policy "approvals_org" on public.governance_approvals
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop trigger if exists milestones_set_updated_at on public.milestones;
create trigger milestones_set_updated_at before update on public.milestones
  for each row execute function public.set_updated_at();

drop trigger if exists benefit_hypotheses_set_updated_at on public.benefit_hypotheses;
create trigger benefit_hypotheses_set_updated_at before update on public.benefit_hypotheses
  for each row execute function public.set_updated_at();

drop trigger if exists governance_approvals_set_updated_at on public.governance_approvals;
create trigger governance_approvals_set_updated_at before update on public.governance_approvals
  for each row execute function public.set_updated_at();
