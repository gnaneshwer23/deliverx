-- Sponsor gateway — persist business case intelligence reports and GO decisions

create table if not exists public.business_case_reviews (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references public.organisations(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete cascade,
  project_id          uuid references public.projects(id) on delete set null,
  brief_excerpt       text,
  report              jsonb not null default '{}'::jsonb,
  recommendation      text not null,
  recommendation_confidence integer,
  go_decision         text check (go_decision in ('accepted', 'rejected', 'deferred')),
  decided_at          timestamptz,
  created_at          timestamptz not null default now()
);

create index if not exists business_case_reviews_org_idx on public.business_case_reviews(organisation_id);
create index if not exists business_case_reviews_project_idx on public.business_case_reviews(project_id);

alter table public.business_case_reviews enable row level security;

drop policy if exists "business_case_reviews_org" on public.business_case_reviews;
create policy "business_case_reviews_org" on public.business_case_reviews
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
