-- Deliverx Phase 9 — Distributed Coordination Intelligence
-- Apply after 0001–0007.

-- ===========================================================================
-- Enums
-- ===========================================================================
do $$ begin
  create type partner_type as enum ('client', 'vendor', 'consulting_partner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type marketplace_asset_type as enum (
    'playbook',
    'governance_template',
    'risk_library',
    'delivery_framework'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type ecosystem_link_type as enum ('shared_project', 'shared_dependency');
exception when duplicate_object then null; end $$;

-- ===========================================================================
-- ecosystem_partners — cross-organisation coordination layer
-- ===========================================================================
create table if not exists public.ecosystem_partners (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  name            text not null,
  partner_type    partner_type not null default 'vendor',
  status          text not null default 'active',
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists ecosystem_partners_org_idx
  on public.ecosystem_partners(organisation_id);

-- ===========================================================================
-- ecosystem_shared_links — shared projects / dependencies across partners
-- ===========================================================================
create table if not exists public.ecosystem_shared_links (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  partner_id      uuid not null references public.ecosystem_partners(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete set null,
  label           text not null,
  link_type       ecosystem_link_type not null default 'shared_project',
  meta            jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists ecosystem_links_org_idx
  on public.ecosystem_shared_links(organisation_id);
create index if not exists ecosystem_links_partner_idx
  on public.ecosystem_shared_links(partner_id);

-- ===========================================================================
-- marketplace_assets — playbooks, templates, frameworks (network effects)
-- ===========================================================================
create table if not exists public.marketplace_assets (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  asset_type      marketplace_asset_type not null,
  title           text not null,
  description     text,
  content         jsonb not null default '{}'::jsonb,
  is_public       boolean not null default false,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists marketplace_assets_org_idx
  on public.marketplace_assets(organisation_id);
create index if not exists marketplace_assets_type_idx
  on public.marketplace_assets(asset_type, is_public);

-- ===========================================================================
-- coordination_runs — persisted agent orchestration snapshots
-- ===========================================================================
create table if not exists public.coordination_runs (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  captured_at     timestamptz not null default now(),
  snapshot        jsonb not null,
  captured_by     uuid references public.users(id) on delete set null
);

create index if not exists coordination_runs_org_time_idx
  on public.coordination_runs(organisation_id, captured_at desc);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.ecosystem_partners     enable row level security;
alter table public.ecosystem_shared_links enable row level security;
alter table public.marketplace_assets     enable row level security;
alter table public.coordination_runs      enable row level security;

-- ecosystem_partners
drop policy if exists "partners_org_select" on public.ecosystem_partners;
create policy "partners_org_select" on public.ecosystem_partners
  for select using (organisation_id = public.current_org_id());

drop policy if exists "partners_org_insert" on public.ecosystem_partners;
create policy "partners_org_insert" on public.ecosystem_partners
  for insert with check (
    organisation_id = public.current_org_id()
    and created_by = auth.uid()
  );

drop policy if exists "partners_org_update" on public.ecosystem_partners;
create policy "partners_org_update" on public.ecosystem_partners
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

-- ecosystem_shared_links
drop policy if exists "ecosystem_links_org_select" on public.ecosystem_shared_links;
create policy "ecosystem_links_org_select" on public.ecosystem_shared_links
  for select using (organisation_id = public.current_org_id());

drop policy if exists "ecosystem_links_org_insert" on public.ecosystem_shared_links;
create policy "ecosystem_links_org_insert" on public.ecosystem_shared_links
  for insert with check (organisation_id = public.current_org_id());

drop policy if exists "ecosystem_links_org_delete" on public.ecosystem_shared_links;
create policy "ecosystem_links_org_delete" on public.ecosystem_shared_links
  for delete using (organisation_id = public.current_org_id());

-- marketplace_assets — org members see own; public assets visible to all authenticated orgs
drop policy if exists "marketplace_org_select" on public.marketplace_assets;
create policy "marketplace_org_select" on public.marketplace_assets
  for select using (
    organisation_id = public.current_org_id()
    or is_public = true
  );

drop policy if exists "marketplace_org_insert" on public.marketplace_assets;
create policy "marketplace_org_insert" on public.marketplace_assets
  for insert with check (
    organisation_id = public.current_org_id()
    and created_by = auth.uid()
  );

drop policy if exists "marketplace_org_update" on public.marketplace_assets;
create policy "marketplace_org_update" on public.marketplace_assets
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

-- coordination_runs
drop policy if exists "coordination_runs_org_select" on public.coordination_runs;
create policy "coordination_runs_org_select" on public.coordination_runs
  for select using (organisation_id = public.current_org_id());

drop policy if exists "coordination_runs_org_insert" on public.coordination_runs;
create policy "coordination_runs_org_insert" on public.coordination_runs
  for insert with check (organisation_id = public.current_org_id());
