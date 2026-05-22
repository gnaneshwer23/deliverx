-- PR4 — V1 governance: RAID, decisions, meetings, documents, changes, reports

-- ===========================================================================
-- Enums
-- ===========================================================================
do $$ begin
  create type raid_item_type as enum ('risk', 'assumption', 'issue', 'dependency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type raid_status as enum ('open', 'mitigated', 'closed', 'accepted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type raid_severity as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type decision_status as enum ('proposed', 'approved', 'rejected', 'superseded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type meeting_status as enum ('scheduled', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type change_status as enum ('draft', 'submitted', 'approved', 'rejected', 'implemented');
exception when duplicate_object then null; end $$;

-- ===========================================================================
-- meetings (before raid/decisions FK references)
-- ===========================================================================
create table if not exists public.meetings (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  title           text not null,
  scheduled_at    timestamptz,
  notes           text,
  summary         text,
  ai_summary      text,
  status          meeting_status not null default 'scheduled',
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists meetings_org_idx on public.meetings(organisation_id);
create index if not exists meetings_project_idx on public.meetings(project_id);

-- ===========================================================================
-- raid_items
-- ===========================================================================
create table if not exists public.raid_items (
  id                 uuid primary key default gen_random_uuid(),
  organisation_id    uuid not null references public.organisations(id) on delete cascade,
  project_id         uuid not null references public.projects(id) on delete cascade,
  type               raid_item_type not null,
  title              text not null,
  description        text,
  status             raid_status not null default 'open',
  severity           raid_severity not null default 'medium',
  owner_id           uuid references public.users(id) on delete set null,
  due_date           date,
  mitigation         text,
  source_meeting_id  uuid references public.meetings(id) on delete set null,
  created_by         uuid references public.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists raid_items_org_idx on public.raid_items(organisation_id);
create index if not exists raid_items_project_idx on public.raid_items(project_id);
create index if not exists raid_items_type_status_idx on public.raid_items(project_id, type, status);

-- ===========================================================================
-- decisions
-- ===========================================================================
create table if not exists public.decisions (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  title           text not null,
  context         text,
  outcome         text,
  status          decision_status not null default 'proposed',
  decided_by      uuid references public.users(id) on delete set null,
  decided_at      timestamptz,
  meeting_id      uuid references public.meetings(id) on delete set null,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists decisions_org_idx on public.decisions(organisation_id);
create index if not exists decisions_project_idx on public.decisions(project_id);

-- ===========================================================================
-- documents
-- ===========================================================================
create table if not exists public.documents (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  title           text not null,
  file_url        text,
  content_text    text,
  doc_type        text not null default 'general',
  uploaded_by     uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists documents_org_idx on public.documents(organisation_id);
create index if not exists documents_project_idx on public.documents(project_id);

-- ===========================================================================
-- change_requests
-- ===========================================================================
create table if not exists public.change_requests (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  title           text not null,
  description     text,
  impact          text,
  status          change_status not null default 'draft',
  requested_by    uuid references public.users(id) on delete set null,
  approved_by     uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists change_requests_org_idx on public.change_requests(organisation_id);
create index if not exists change_requests_project_idx on public.change_requests(project_id);

-- ===========================================================================
-- reports
-- ===========================================================================
create table if not exists public.reports (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  title           text not null,
  report_type     text not null default 'status',
  content         text not null default '',
  generated_at    timestamptz not null default now(),
  generated_by    uuid references public.users(id) on delete set null,
  ai_generated    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists reports_org_idx on public.reports(organisation_id);
create index if not exists reports_project_idx on public.reports(project_id);

-- ===========================================================================
-- updated_at triggers
-- ===========================================================================
drop trigger if exists meetings_set_updated_at on public.meetings;
create trigger meetings_set_updated_at before update on public.meetings
  for each row execute function public.set_updated_at();

drop trigger if exists raid_items_set_updated_at on public.raid_items;
create trigger raid_items_set_updated_at before update on public.raid_items
  for each row execute function public.set_updated_at();

drop trigger if exists decisions_set_updated_at on public.decisions;
create trigger decisions_set_updated_at before update on public.decisions
  for each row execute function public.set_updated_at();

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

drop trigger if exists change_requests_set_updated_at on public.change_requests;
create trigger change_requests_set_updated_at before update on public.change_requests
  for each row execute function public.set_updated_at();

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at before update on public.reports
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.meetings enable row level security;
alter table public.raid_items enable row level security;
alter table public.decisions enable row level security;
alter table public.documents enable row level security;
alter table public.change_requests enable row level security;
alter table public.reports enable row level security;

-- Helper macro pattern: org-scoped CRUD for project-linked tables
drop policy if exists "meetings_org_select" on public.meetings;
create policy "meetings_org_select" on public.meetings
  for select using (organisation_id = public.current_org_id());

drop policy if exists "meetings_org_insert" on public.meetings;
create policy "meetings_org_insert" on public.meetings
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.organisation_id = public.current_org_id()
    )
  );

drop policy if exists "meetings_org_update" on public.meetings;
create policy "meetings_org_update" on public.meetings
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "meetings_org_delete" on public.meetings;
create policy "meetings_org_delete" on public.meetings
  for delete using (organisation_id = public.current_org_id());

drop policy if exists "raid_items_org_select" on public.raid_items;
create policy "raid_items_org_select" on public.raid_items
  for select using (organisation_id = public.current_org_id());

drop policy if exists "raid_items_org_insert" on public.raid_items;
create policy "raid_items_org_insert" on public.raid_items
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.organisation_id = public.current_org_id()
    )
  );

drop policy if exists "raid_items_org_update" on public.raid_items;
create policy "raid_items_org_update" on public.raid_items
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "raid_items_org_delete" on public.raid_items;
create policy "raid_items_org_delete" on public.raid_items
  for delete using (organisation_id = public.current_org_id());

drop policy if exists "decisions_org_select" on public.decisions;
create policy "decisions_org_select" on public.decisions
  for select using (organisation_id = public.current_org_id());

drop policy if exists "decisions_org_insert" on public.decisions;
create policy "decisions_org_insert" on public.decisions
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.organisation_id = public.current_org_id()
    )
  );

drop policy if exists "decisions_org_update" on public.decisions;
create policy "decisions_org_update" on public.decisions
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "decisions_org_delete" on public.decisions;
create policy "decisions_org_delete" on public.decisions
  for delete using (organisation_id = public.current_org_id());

drop policy if exists "documents_org_select" on public.documents;
create policy "documents_org_select" on public.documents
  for select using (organisation_id = public.current_org_id());

drop policy if exists "documents_org_insert" on public.documents;
create policy "documents_org_insert" on public.documents
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.organisation_id = public.current_org_id()
    )
  );

drop policy if exists "documents_org_update" on public.documents;
create policy "documents_org_update" on public.documents
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "documents_org_delete" on public.documents;
create policy "documents_org_delete" on public.documents
  for delete using (organisation_id = public.current_org_id());

drop policy if exists "change_requests_org_select" on public.change_requests;
create policy "change_requests_org_select" on public.change_requests
  for select using (organisation_id = public.current_org_id());

drop policy if exists "change_requests_org_insert" on public.change_requests;
create policy "change_requests_org_insert" on public.change_requests
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.organisation_id = public.current_org_id()
    )
  );

drop policy if exists "change_requests_org_update" on public.change_requests;
create policy "change_requests_org_update" on public.change_requests
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "change_requests_org_delete" on public.change_requests;
create policy "change_requests_org_delete" on public.change_requests
  for delete using (organisation_id = public.current_org_id());

drop policy if exists "reports_org_select" on public.reports;
create policy "reports_org_select" on public.reports
  for select using (organisation_id = public.current_org_id());

drop policy if exists "reports_org_insert" on public.reports;
create policy "reports_org_insert" on public.reports
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.organisation_id = public.current_org_id()
    )
  );

drop policy if exists "reports_org_update" on public.reports;
create policy "reports_org_update" on public.reports
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "reports_org_delete" on public.reports;
create policy "reports_org_delete" on public.reports
  for delete using (organisation_id = public.current_org_id());
