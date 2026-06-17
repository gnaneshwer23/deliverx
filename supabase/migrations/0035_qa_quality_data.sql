-- Sprint A4 — persist QA test cases, defects, and UAT sign-offs

do $$ begin
  create type qa_defect_severity as enum ('critical', 'high', 'medium', 'low');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qa_defect_status as enum ('open', 'fixing', 'closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qa_test_case_status as enum ('draft', 'ready', 'passed', 'failed', 'blocked');
exception when duplicate_object then null; end $$;

create table if not exists public.test_cases (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references public.organisations(id) on delete cascade,
  project_id          uuid not null references public.projects(id) on delete cascade,
  test_code           text not null,
  title               text not null,
  priority            text not null default 'medium',
  linked_story_code   text,
  user_story_id       uuid references public.user_stories(id) on delete set null,
  automation_candidate boolean not null default false,
  test_type           text not null default 'functional',
  status              qa_test_case_status not null default 'draft',
  ai_generated        boolean not null default false,
  review_status       artifact_review_status not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (project_id, test_code)
);

create index if not exists test_cases_project_idx
  on public.test_cases(project_id, status);

create table if not exists public.defects (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references public.organisations(id) on delete cascade,
  project_id          uuid not null references public.projects(id) on delete cascade,
  defect_code         text not null,
  title               text not null,
  severity            qa_defect_severity not null default 'medium',
  owner               text,
  status              qa_defect_status not null default 'open',
  linked_test_case_id uuid references public.test_cases(id) on delete set null,
  ai_generated        boolean not null default false,
  review_status       artifact_review_status not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (project_id, defect_code)
);

create index if not exists defects_project_idx
  on public.defects(project_id, status, severity);

create table if not exists public.uat_signoffs (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references public.organisations(id) on delete cascade,
  project_id          uuid not null references public.projects(id) on delete cascade,
  stakeholder_group   text not null,
  completion_pct      integer not null default 0 check (completion_pct between 0 and 100),
  signed_off          boolean not null default false,
  signed_off_at       timestamptz,
  notes               text,
  ai_generated        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (project_id, stakeholder_group)
);

create index if not exists uat_signoffs_project_idx
  on public.uat_signoffs(project_id);

alter table public.test_cases enable row level security;
alter table public.defects enable row level security;
alter table public.uat_signoffs enable row level security;

drop policy if exists "test_cases_org" on public.test_cases;
create policy "test_cases_org" on public.test_cases
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "defects_org" on public.defects;
create policy "defects_org" on public.defects
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "uat_signoffs_org" on public.uat_signoffs;
create policy "uat_signoffs_org" on public.uat_signoffs
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop trigger if exists test_cases_set_updated_at on public.test_cases;
create trigger test_cases_set_updated_at before update on public.test_cases
  for each row execute function public.set_updated_at();

drop trigger if exists defects_set_updated_at on public.defects;
create trigger defects_set_updated_at before update on public.defects
  for each row execute function public.set_updated_at();

drop trigger if exists uat_signoffs_set_updated_at on public.uat_signoffs;
create trigger uat_signoffs_set_updated_at before update on public.uat_signoffs
  for each row execute function public.set_updated_at();
