-- BA persona — requirements, stories, clarifications, traceability

alter type user_role add value if not exists 'ba';

do $$ begin
  create type requirement_type as enum (
    'functional', 'non_functional', 'business_rule', 'assumption', 'constraint'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type requirement_status as enum (
    'draft', 'pending_clarification', 'approved', 'rejected'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type clarification_status as enum ('open', 'answered', 'deferred');
exception when duplicate_object then null; end $$;

create table if not exists public.ba_project_context (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade unique,
  project_type      text,
  context_sources   jsonb not null default '[]'::jsonb,
  business_context  jsonb not null default '{}'::jsonb,
  extraction_status text not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.requirements (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  req_code          text not null,
  type              requirement_type not null default 'functional',
  title             text not null,
  description       text not null default '',
  status            requirement_status not null default 'draft',
  quality           jsonb not null default '{}'::jsonb,
  owner_role        text,
  flags             jsonb not null default '[]'::jsonb,
  source            text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (project_id, req_code)
);

create index if not exists requirements_project_idx
  on public.requirements(project_id, status);

create table if not exists public.requirement_clarifications (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  requirement_id    uuid references public.requirements(id) on delete set null,
  question          text not null,
  answer            text,
  status            clarification_status not null default 'open',
  priority          text not null default 'medium',
  stakeholder_role  text,
  blocks            text,
  due_date          date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists clarifications_project_idx
  on public.requirement_clarifications(project_id, status);

create table if not exists public.user_stories (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references public.organisations(id) on delete cascade,
  project_id          uuid not null references public.projects(id) on delete cascade,
  requirement_id      uuid references public.requirements(id) on delete set null,
  story_code          text not null,
  title               text not null,
  story               text not null,
  acceptance_criteria jsonb not null default '[]'::jsonb,
  status              text not null default 'draft',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (project_id, story_code)
);

create index if not exists user_stories_project_idx
  on public.user_stories(project_id, status);

create table if not exists public.requirement_trace_links (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  requirement_id    uuid not null references public.requirements(id) on delete cascade,
  user_story_id     uuid references public.user_stories(id) on delete set null,
  task_id           uuid references public.tasks(id) on delete set null,
  benefit_id        uuid,
  link_type         text not null default 'implements',
  created_at        timestamptz not null default now()
);

create index if not exists trace_links_project_idx
  on public.requirement_trace_links(project_id);

alter table public.ba_project_context enable row level security;
alter table public.requirements enable row level security;
alter table public.requirement_clarifications enable row level security;
alter table public.user_stories enable row level security;
alter table public.requirement_trace_links enable row level security;

drop policy if exists "ba_context_org" on public.ba_project_context;
create policy "ba_context_org" on public.ba_project_context
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "requirements_org" on public.requirements;
create policy "requirements_org" on public.requirements
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "clarifications_org" on public.requirement_clarifications;
create policy "clarifications_org" on public.requirement_clarifications
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "user_stories_org" on public.user_stories;
create policy "user_stories_org" on public.user_stories
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "trace_links_org" on public.requirement_trace_links;
create policy "trace_links_org" on public.requirement_trace_links
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop trigger if exists ba_project_context_set_updated_at on public.ba_project_context;
create trigger ba_project_context_set_updated_at before update on public.ba_project_context
  for each row execute function public.set_updated_at();

drop trigger if exists requirements_set_updated_at on public.requirements;
create trigger requirements_set_updated_at before update on public.requirements
  for each row execute function public.set_updated_at();

drop trigger if exists clarifications_set_updated_at on public.requirement_clarifications;
create trigger clarifications_set_updated_at before update on public.requirement_clarifications
  for each row execute function public.set_updated_at();

drop trigger if exists user_stories_set_updated_at on public.user_stories;
create trigger user_stories_set_updated_at before update on public.user_stories
  for each row execute function public.set_updated_at();
