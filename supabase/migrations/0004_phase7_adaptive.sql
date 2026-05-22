-- Deliverx Phase 7 — Adaptive intelligence audit trail
-- Apply after 0001/0002/0003.
-- Paste into Supabase Dashboard → SQL Editor → New query → Run.

-- ===========================================================================
-- Enum
-- ===========================================================================
do $$ begin
  create type adaptive_review_action as enum (
    'approved', 'approved_with_edit', 'rejected', 'ignored'
  );
exception when duplicate_object then null; end $$;

-- ===========================================================================
-- adaptive_recommendation_reviews
--
-- Phase 7 recommendations are recomputed on every loop run (pure engine), so
-- we never persist the recommendation itself. We DO persist the human review
-- — keyed by (project_id, recommendation_key) — so the UI can mark a rec as
-- already actioned and analytics can trace PM decisions over time.
-- ===========================================================================
create table if not exists public.adaptive_recommendation_reviews (
  id                    uuid primary key default gen_random_uuid(),
  organisation_id       uuid not null references public.organisations(id) on delete cascade,
  project_id            uuid not null references public.projects(id) on delete cascade,
  recommendation_key    text not null,
  action                adaptive_review_action not null,
  original_action_text  text,
  edited_action_text    text,
  rationale             text,
  reviewed_by           uuid references public.users(id) on delete set null,
  reviewed_at           timestamptz not null default now()
);

create index if not exists adaptive_reviews_project_idx
  on public.adaptive_recommendation_reviews(project_id, reviewed_at desc);
create index if not exists adaptive_reviews_key_idx
  on public.adaptive_recommendation_reviews(project_id, recommendation_key);

-- ===========================================================================
-- RLS
-- ===========================================================================
alter table public.adaptive_recommendation_reviews enable row level security;

drop policy if exists "adaptive_reviews_org_select"
  on public.adaptive_recommendation_reviews;
create policy "adaptive_reviews_org_select"
  on public.adaptive_recommendation_reviews
  for select using (organisation_id = public.current_org_id());

drop policy if exists "adaptive_reviews_org_insert"
  on public.adaptive_recommendation_reviews;
create policy "adaptive_reviews_org_insert"
  on public.adaptive_recommendation_reviews
  for insert with check (
    organisation_id = public.current_org_id()
    and reviewed_by = auth.uid()
  );
