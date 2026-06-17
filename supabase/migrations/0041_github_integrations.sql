-- Sprint C2 — GitHub integration (PR links, CI status, traceability)

do $$ begin
  create type public.integration_provider as enum ('github');
exception when duplicate_object then null; end $$;

create table if not exists public.org_integrations (
  organisation_id       uuid primary key references public.organisations(id) on delete cascade,
  provider              public.integration_provider not null default 'github',
  github_token          text,
  github_webhook_secret text,
  enabled               boolean not null default false,
  last_sync_at          timestamptz,
  updated_at            timestamptz not null default now()
);

create table if not exists public.project_integrations (
  project_id      uuid primary key references public.projects(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  github_owner    text,
  github_repo     text,
  enabled         boolean not null default true,
  last_sync_at    timestamptz,
  updated_at      timestamptz not null default now()
);

create table if not exists public.external_task_links (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  task_id         uuid references public.tasks(id) on delete set null,
  provider        public.integration_provider not null default 'github',
  link_type       text not null,
  external_id     text not null,
  external_url    text not null,
  title           text,
  status          text,
  metadata        jsonb not null default '{}',
  synced_at       timestamptz not null default now(),
  unique (project_id, provider, link_type, external_id)
);

create index if not exists external_task_links_project_idx
  on public.external_task_links(project_id, synced_at desc);

create index if not exists external_task_links_task_idx
  on public.external_task_links(task_id)
  where task_id is not null;

create table if not exists public.integration_sync_log (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete set null,
  provider        public.integration_provider not null default 'github',
  kind            text not null,
  status          text not null default 'ok',
  summary         jsonb not null default '{}',
  error           text,
  created_at      timestamptz not null default now()
);

alter table public.org_integrations enable row level security;
alter table public.project_integrations enable row level security;
alter table public.external_task_links enable row level security;
alter table public.integration_sync_log enable row level security;

drop policy if exists "org_integrations_org" on public.org_integrations;
create policy "org_integrations_org" on public.org_integrations
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "project_integrations_org" on public.project_integrations;
create policy "project_integrations_org" on public.project_integrations
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "external_task_links_org" on public.external_task_links;
create policy "external_task_links_org" on public.external_task_links
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "integration_sync_log_org" on public.integration_sync_log;
create policy "integration_sync_log_org" on public.integration_sync_log
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
