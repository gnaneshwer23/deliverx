-- Deliverx Phase 5 — Memory + Playbooks
-- Apply after 0001_init.sql.
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.

create extension if not exists pg_trgm;

-- ===========================================================================
-- Enums
-- ===========================================================================
do $$ begin
  create type memory_insight_type as enum (
    'risk_pattern',
    'lesson',
    'success_pattern',
    'governance'
  );
exception when duplicate_object then null; end $$;

-- ===========================================================================
-- organisational_memory
-- ===========================================================================
create table if not exists public.organisational_memory (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete set null,
  type            memory_insight_type not null,
  insight         text not null,
  confidence      numeric(3, 2) not null check (confidence >= 0 and confidence <= 1),
  tags            text[] not null default '{}',
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists org_memory_org_idx
  on public.organisational_memory(organisation_id);
create index if not exists org_memory_tags_idx
  on public.organisational_memory using gin (tags);
create index if not exists org_memory_insight_trgm
  on public.organisational_memory using gin (insight gin_trgm_ops);

-- ===========================================================================
-- playbooks
-- ===========================================================================
create table if not exists public.playbooks (
  id                 uuid primary key default gen_random_uuid(),
  organisation_id    uuid not null references public.organisations(id) on delete cascade,
  name               text not null,
  description        text,
  industry           text,
  delivery_type      text,
  structure          jsonb not null default '{}'::jsonb,
  governance         text[] not null default '{}',
  source_project_ids uuid[] not null default '{}',
  created_by         uuid references public.users(id) on delete set null,
  created_at         timestamptz not null default now()
);

create index if not exists playbooks_org_idx on public.playbooks(organisation_id);

-- ===========================================================================
-- projects: applied playbook reference
-- ===========================================================================
alter table public.projects
  add column if not exists applied_playbook_id uuid
    references public.playbooks(id) on delete set null;

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.organisational_memory enable row level security;
alter table public.playbooks             enable row level security;

drop policy if exists "memory_org_select" on public.organisational_memory;
create policy "memory_org_select" on public.organisational_memory
  for select using (organisation_id = public.current_org_id());

drop policy if exists "memory_org_insert" on public.organisational_memory;
create policy "memory_org_insert" on public.organisational_memory
  for insert with check (
    organisation_id = public.current_org_id()
    and created_by = auth.uid()
  );

drop policy if exists "playbooks_org_select" on public.playbooks;
create policy "playbooks_org_select" on public.playbooks
  for select using (organisation_id = public.current_org_id());

drop policy if exists "playbooks_org_insert" on public.playbooks;
create policy "playbooks_org_insert" on public.playbooks
  for insert with check (
    organisation_id = public.current_org_id()
    and created_by = auth.uid()
  );

drop policy if exists "playbooks_org_update" on public.playbooks;
create policy "playbooks_org_update" on public.playbooks
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
