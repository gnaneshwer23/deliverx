-- Deliverx Phase 6 — Portfolios, Programmes, Dependencies, Forecasts
-- Apply after 0001_init.sql and 0002_phase5_memory.sql.
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.

-- ===========================================================================
-- Enums
-- ===========================================================================
do $$ begin
  create type programme_status as enum (
    'planning', 'active', 'paused', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type dependency_type as enum (
    'blocks', 'depends_on', 'shares_resource', 'data_handoff'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type dependency_severity as enum (
    'low', 'medium', 'high', 'critical'
  );
exception when duplicate_object then null; end $$;

-- ===========================================================================
-- portfolios
-- ===========================================================================
create table if not exists public.portfolios (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name            text not null,
  description     text,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists portfolios_org_idx on public.portfolios(organisation_id);

-- ===========================================================================
-- programmes
-- ===========================================================================
create table if not exists public.programmes (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  portfolio_id    uuid not null references public.portfolios(id) on delete cascade,
  name            text not null,
  strategic_goal  text,
  status          programme_status not null default 'active',
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists programmes_org_idx       on public.programmes(organisation_id);
create index if not exists programmes_portfolio_idx on public.programmes(portfolio_id);

-- ===========================================================================
-- projects.programme_id
-- ===========================================================================
alter table public.projects
  add column if not exists programme_id uuid
    references public.programmes(id) on delete set null;
create index if not exists projects_programme_idx on public.projects(programme_id);

-- ===========================================================================
-- cross_project_dependencies
-- ===========================================================================
create table if not exists public.cross_project_dependencies (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  source_project_id uuid not null references public.projects(id) on delete cascade,
  target_project_id uuid not null references public.projects(id) on delete cascade,
  dependency_type   dependency_type     not null default 'depends_on',
  severity          dependency_severity not null default 'medium',
  description       text,
  created_by        uuid references public.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  check (source_project_id <> target_project_id)
);
create index if not exists deps_org_idx    on public.cross_project_dependencies(organisation_id);
create index if not exists deps_source_idx on public.cross_project_dependencies(source_project_id);
create index if not exists deps_target_idx on public.cross_project_dependencies(target_project_id);

-- ===========================================================================
-- delivery_forecasts
-- ===========================================================================
create table if not exists public.delivery_forecasts (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  prediction      text not null,
  confidence      numeric(3, 2) not null check (confidence >= 0 and confidence <= 1),
  generated_at    timestamptz not null default now()
);
create index if not exists forecasts_project_idx
  on public.delivery_forecasts(project_id, generated_at desc);

-- ===========================================================================
-- Row Level Security (org-scoped via current_org_id() from 0001)
-- ===========================================================================
alter table public.portfolios                  enable row level security;
alter table public.programmes                  enable row level security;
alter table public.cross_project_dependencies  enable row level security;
alter table public.delivery_forecasts          enable row level security;

-- portfolios
drop policy if exists "portfolios_org_select" on public.portfolios;
create policy "portfolios_org_select" on public.portfolios
  for select using (organisation_id = public.current_org_id());

drop policy if exists "portfolios_org_insert" on public.portfolios;
create policy "portfolios_org_insert" on public.portfolios
  for insert with check (
    organisation_id = public.current_org_id()
    and created_by  = auth.uid()
  );

drop policy if exists "portfolios_org_update" on public.portfolios;
create policy "portfolios_org_update" on public.portfolios
  for update using (organisation_id = public.current_org_id())
  with check  (organisation_id = public.current_org_id());

-- programmes
drop policy if exists "programmes_org_select" on public.programmes;
create policy "programmes_org_select" on public.programmes
  for select using (organisation_id = public.current_org_id());

drop policy if exists "programmes_org_insert" on public.programmes;
create policy "programmes_org_insert" on public.programmes
  for insert with check (
    organisation_id = public.current_org_id()
    and created_by  = auth.uid()
  );

drop policy if exists "programmes_org_update" on public.programmes;
create policy "programmes_org_update" on public.programmes
  for update using (organisation_id = public.current_org_id())
  with check  (organisation_id = public.current_org_id());

-- cross_project_dependencies
drop policy if exists "deps_org_select" on public.cross_project_dependencies;
create policy "deps_org_select" on public.cross_project_dependencies
  for select using (organisation_id = public.current_org_id());

drop policy if exists "deps_org_insert" on public.cross_project_dependencies;
create policy "deps_org_insert" on public.cross_project_dependencies
  for insert with check (
    organisation_id = public.current_org_id()
    and created_by  = auth.uid()
  );

drop policy if exists "deps_org_delete" on public.cross_project_dependencies;
create policy "deps_org_delete" on public.cross_project_dependencies
  for delete using (organisation_id = public.current_org_id());

-- delivery_forecasts
drop policy if exists "forecasts_org_select" on public.delivery_forecasts;
create policy "forecasts_org_select" on public.delivery_forecasts
  for select using (organisation_id = public.current_org_id());

drop policy if exists "forecasts_org_insert" on public.delivery_forecasts;
create policy "forecasts_org_insert" on public.delivery_forecasts
  for insert with check (organisation_id = public.current_org_id());
