-- Universal approval — artifact reviews + audit trail (Stage 12 / FR-65)

do $$ begin
  create type artifact_review_status as enum (
    'draft', 'needs_review', 'approved', 'rejected', 'updated'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type artifact_entity_type as enum (
    'requirement',
    'user_story',
    'product_feature',
    'raid_item',
    'task',
    'report',
    'structure_bundle',
    'estimation',
    'decision',
    'change_request',
    'customer_insight'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.artifact_reviews (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  entity_type       artifact_entity_type not null,
  entity_id         uuid,
  entity_ids        uuid[] not null default '{}',
  title             text not null,
  summary           text not null default '',
  payload           jsonb not null default '{}'::jsonb,
  status            artifact_review_status not null default 'needs_review',
  source            text not null default 'ai',
  reviewer_notes    text,
  decided_by        uuid references public.users(id) on delete set null,
  decided_at        timestamptz,
  created_by        uuid references public.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists artifact_reviews_project_idx
  on public.artifact_reviews(project_id, status, created_at desc);

create index if not exists artifact_reviews_status_idx
  on public.artifact_reviews(status, created_at desc);

alter table public.artifact_reviews enable row level security;

drop policy if exists "artifact_reviews_org" on public.artifact_reviews;
create policy "artifact_reviews_org" on public.artifact_reviews
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop trigger if exists artifact_reviews_set_updated_at on public.artifact_reviews;
create trigger artifact_reviews_set_updated_at before update on public.artifact_reviews
  for each row execute function public.set_updated_at();

create table if not exists public.audit_events (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid references public.projects(id) on delete set null,
  actor_id          uuid references public.users(id) on delete set null,
  event_type        text not null,
  entity_type       text not null,
  entity_id         uuid,
  artifact_review_id uuid references public.artifact_reviews(id) on delete set null,
  proposal_id       uuid references public.proposed_actions(id) on delete set null,
  metadata          jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists audit_events_org_idx on public.audit_events(organisation_id, created_at desc);
create index if not exists audit_events_project_idx on public.audit_events(project_id, created_at desc);

alter table public.audit_events enable row level security;

drop policy if exists "audit_events_org" on public.audit_events;
create policy "audit_events_org" on public.audit_events
  for select using (organisation_id = public.current_org_id());

drop policy if exists "audit_events_insert" on public.audit_events;
create policy "audit_events_insert" on public.audit_events
  for insert with check (organisation_id = public.current_org_id());

-- Flag AI-generated rows pending human approval
alter table public.requirements
  add column if not exists ai_generated boolean not null default false,
  add column if not exists review_status artifact_review_status not null default 'draft';

alter table public.user_stories
  add column if not exists ai_generated boolean not null default false,
  add column if not exists review_status artifact_review_status not null default 'draft';

alter table public.product_features
  add column if not exists ai_generated boolean not null default false,
  add column if not exists review_status artifact_review_status not null default 'draft';

alter table public.tasks
  add column if not exists ai_generated boolean not null default false,
  add column if not exists review_status artifact_review_status not null default 'draft';

alter table public.raid_items
  add column if not exists ai_generated boolean not null default false,
  add column if not exists review_status artifact_review_status not null default 'draft';

-- Extend proposal sources for bootstrap / persona flows
alter type proposal_source add value if not exists 'bootstrap';
alter type proposal_source add value if not exists 'ba';
alter type proposal_source add value if not exists 'product';
alter type proposal_source add value if not exists 'report';
alter type proposal_source add value if not exists 'structure';

alter type proposal_action_type add value if not exists 'create_requirement';
alter type proposal_action_type add value if not exists 'create_feature';
alter type proposal_action_type add value if not exists 'apply_structure';
