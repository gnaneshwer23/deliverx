-- Sprint G1 — sponsor gateway onboarding spine (persist step + draft project / BC review)

create table if not exists public.gateway_sessions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users(id) on delete cascade,
  organisation_id         uuid not null references public.organisations(id) on delete cascade,
  step                    text not null default 'project'
    check (step in ('account', 'project', 'business_case', 'ai_review', 'team', 'complete')),
  draft_project_id        uuid references public.projects(id) on delete set null,
  business_case_review_id uuid references public.business_case_reviews(id) on delete set null,
  draft_payload           jsonb not null default '{}'::jsonb,
  completed_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (user_id)
);

create index if not exists gateway_sessions_org_idx on public.gateway_sessions(organisation_id);
create index if not exists gateway_sessions_step_idx on public.gateway_sessions(step);

alter table public.gateway_sessions enable row level security;

drop policy if exists "gateway_sessions_own" on public.gateway_sessions;
create policy "gateway_sessions_own" on public.gateway_sessions
  for all using (
    user_id = auth.uid()
    and organisation_id = public.current_org_id()
  )
  with check (
    user_id = auth.uid()
    and organisation_id = public.current_org_id()
  );
