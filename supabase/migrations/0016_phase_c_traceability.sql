-- Phase D — stakeholders + standups (traceability & team)

do $$ begin
  create type stakeholder_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stakeholder_sentiment as enum ('champion', 'neutral', 'skeptic', 'blocker');
exception when duplicate_object then null; end $$;

create table if not exists public.stakeholders (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  name              text not null,
  role_label        text,
  organisation_name text,
  email             text,
  influence         stakeholder_level not null default 'medium',
  interest          stakeholder_level not null default 'medium',
  sentiment         stakeholder_sentiment not null default 'neutral',
  notes             text,
  created_by        uuid references public.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists stakeholders_org_idx on public.stakeholders(organisation_id);
create index if not exists stakeholders_project_idx on public.stakeholders(project_id);

create table if not exists public.standups (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  standup_date    date not null default (timezone('utc', now()))::date,
  yesterday       text not null default '',
  today           text not null default '',
  blockers        text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (project_id, user_id, standup_date)
);

create index if not exists standups_org_idx on public.standups(organisation_id);
create index if not exists standups_project_date_idx on public.standups(project_id, standup_date desc);
create index if not exists standups_user_idx on public.standups(user_id);

drop trigger if exists stakeholders_set_updated_at on public.stakeholders;
create trigger stakeholders_set_updated_at before update on public.stakeholders
  for each row execute function public.set_updated_at();

drop trigger if exists standups_set_updated_at on public.standups;
create trigger standups_set_updated_at before update on public.standups
  for each row execute function public.set_updated_at();

alter table public.stakeholders enable row level security;
alter table public.standups enable row level security;

drop policy if exists "stakeholders_org_select" on public.stakeholders;
create policy "stakeholders_org_select" on public.stakeholders
  for select using (organisation_id = public.current_org_id());

drop policy if exists "stakeholders_org_insert" on public.stakeholders;
create policy "stakeholders_org_insert" on public.stakeholders
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.organisation_id = public.current_org_id()
    )
  );

drop policy if exists "stakeholders_org_update" on public.stakeholders;
create policy "stakeholders_org_update" on public.stakeholders
  for update using (organisation_id = public.current_org_id());

drop policy if exists "stakeholders_org_delete" on public.stakeholders;
create policy "stakeholders_org_delete" on public.stakeholders
  for delete using (organisation_id = public.current_org_id());

drop policy if exists "standups_org_select" on public.standups;
create policy "standups_org_select" on public.standups
  for select using (organisation_id = public.current_org_id());

drop policy if exists "standups_org_insert" on public.standups;
create policy "standups_org_insert" on public.standups
  for insert with check (
    organisation_id = public.current_org_id()
    and user_id = auth.uid()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.organisation_id = public.current_org_id()
    )
  );

drop policy if exists "standups_org_update" on public.standups;
create policy "standups_org_update" on public.standups
  for update using (
    organisation_id = public.current_org_id()
    and user_id = auth.uid()
  );

drop policy if exists "standups_org_delete" on public.standups;
create policy "standups_org_delete" on public.standups
  for delete using (
    organisation_id = public.current_org_id()
    and user_id = auth.uid()
  );
