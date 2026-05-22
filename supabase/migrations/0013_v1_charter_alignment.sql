-- PR7 — Charter + alignment score (DeliverX differentiator)

create extension if not exists vector with schema extensions;
create table if not exists public.charters (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  title             text,
  content           text not null default '',
  extracted_goals   jsonb not null default '[]'::jsonb,
  success_criteria  jsonb not null default '[]'::jsonb,
  scope_summary     text,
  file_url          text,
  version           int not null default 1,
  is_active         boolean not null default true,
  created_by        uuid references public.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index if not exists charters_active_project_idx
  on public.charters(project_id)
  where is_active = true;

create index if not exists charters_org_idx on public.charters(organisation_id);
create index if not exists charters_project_idx on public.charters(project_id);

-- ===========================================================================
-- charter_chunks (semantic chunks — embeddings optional until pipeline added)
-- ===========================================================================
create table if not exists public.charter_chunks (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  charter_id      uuid not null references public.charters(id) on delete cascade,
  chunk_index     int not null default 0,
  content         text not null,
  embedding       extensions.vector(1536),
  created_at      timestamptz not null default now()
);

create index if not exists charter_chunks_charter_idx on public.charter_chunks(charter_id);

-- ===========================================================================
-- charter_alignment_scores
-- ===========================================================================
do $$ begin
  create type alignment_source as enum ('manual', 'scheduled', 'meeting', 'ai');
exception when duplicate_object then null; end $$;

create table if not exists public.charter_alignment_scores (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  charter_id      uuid not null references public.charters(id) on delete cascade,
  score           int not null check (score >= 0 and score <= 100),
  previous_score  int check (previous_score is null or (previous_score >= 0 and previous_score <= 100)),
  delta           int,
  meeting_id      uuid references public.meetings(id) on delete set null,
  source          alignment_source not null default 'ai',
  factors         jsonb not null default '[]'::jsonb,
  computed_at     timestamptz not null default now(),
  created_by      uuid references public.users(id) on delete set null
);

create index if not exists charter_scores_project_idx
  on public.charter_alignment_scores(project_id, computed_at desc);
create index if not exists charter_scores_org_idx
  on public.charter_alignment_scores(organisation_id);

-- ===========================================================================
-- updated_at triggers
-- ===========================================================================
drop trigger if exists charters_set_updated_at on public.charters;
create trigger charters_set_updated_at
  before update on public.charters
  for each row execute function public.set_updated_at();

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table public.charters enable row level security;
alter table public.charter_chunks enable row level security;
alter table public.charter_alignment_scores enable row level security;

drop policy if exists "charters_org_select" on public.charters;
create policy "charters_org_select" on public.charters
  for select using (organisation_id = public.current_org_id());

drop policy if exists "charters_org_insert" on public.charters;
create policy "charters_org_insert" on public.charters
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.organisation_id = public.current_org_id()
    )
  );

drop policy if exists "charters_org_update" on public.charters;
create policy "charters_org_update" on public.charters
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "charters_org_delete" on public.charters;
create policy "charters_org_delete" on public.charters
  for delete using (organisation_id = public.current_org_id());

drop policy if exists "charter_chunks_org_select" on public.charter_chunks;
create policy "charter_chunks_org_select" on public.charter_chunks
  for select using (organisation_id = public.current_org_id());

drop policy if exists "charter_chunks_org_insert" on public.charter_chunks;
create policy "charter_chunks_org_insert" on public.charter_chunks
  for insert with check (organisation_id = public.current_org_id());

drop policy if exists "charter_chunks_org_delete" on public.charter_chunks;
create policy "charter_chunks_org_delete" on public.charter_chunks
  for delete using (organisation_id = public.current_org_id());

drop policy if exists "charter_scores_org_select" on public.charter_alignment_scores;
create policy "charter_scores_org_select" on public.charter_alignment_scores
  for select using (organisation_id = public.current_org_id());

drop policy if exists "charter_scores_org_insert" on public.charter_alignment_scores;
create policy "charter_scores_org_insert" on public.charter_alignment_scores
  for insert with check (
    organisation_id = public.current_org_id()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.organisation_id = public.current_org_id()
    )
  );
