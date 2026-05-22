-- Deliverx — gap closure: recommendation reviews + closure tracking
-- Apply after 0001–0006.

-- ===========================================================================
-- Phase 4 legacy recommendation reviews (accept / ignore)
-- ===========================================================================
create table if not exists public.ai_recommendation_reviews (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  recommendation_id text not null,
  action            text not null check (action in ('accept', 'ignore')),
  reviewed_by       uuid references public.users(id) on delete set null,
  reviewed_at       timestamptz not null default now(),
  unique (project_id, recommendation_id)
);

create index if not exists ai_rec_reviews_project_idx
  on public.ai_recommendation_reviews(project_id, reviewed_at desc);

alter table public.ai_recommendation_reviews enable row level security;

drop policy if exists "ai_rec_reviews_org_select" on public.ai_recommendation_reviews;
create policy "ai_rec_reviews_org_select" on public.ai_recommendation_reviews
  for select using (organisation_id = public.current_org_id());

drop policy if exists "ai_rec_reviews_org_insert" on public.ai_recommendation_reviews;
create policy "ai_rec_reviews_org_insert" on public.ai_recommendation_reviews
  for insert with check (
    organisation_id = public.current_org_id()
    and reviewed_by = auth.uid()
  );

drop policy if exists "ai_rec_reviews_org_update" on public.ai_recommendation_reviews;
create policy "ai_rec_reviews_org_update" on public.ai_recommendation_reviews
  for update using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

-- ===========================================================================
-- Auto-closure idempotency — set when insights/playbook are extracted
-- ===========================================================================
alter table public.projects
  add column if not exists closure_processed_at timestamptz;
