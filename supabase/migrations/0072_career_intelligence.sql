-- Career Intelligence (Launchpad pivot) — application tracker + activity log
-- Does not store capability scores.

create table if not exists public.career_applications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  company         text not null,
  role_title      text not null,
  status          text not null default 'saved'
    check (status in (
      'saved', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'
    )),
  opportunity_id  text,
  notes           text,
  gaps_noted      jsonb not null default '[]'::jsonb,
  evidence_cited  jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists career_applications_user_idx
  on public.career_applications(user_id, updated_at desc);

create table if not exists public.career_activities (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  module_id       text not null,
  activity_type   text not null,
  title           text not null,
  payload         jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists career_activities_user_idx
  on public.career_activities(user_id, created_at desc);

drop trigger if exists career_applications_set_updated_at on public.career_applications;
create trigger career_applications_set_updated_at
  before update on public.career_applications
  for each row execute function public.set_updated_at();

alter table public.career_applications enable row level security;
alter table public.career_activities enable row level security;

drop policy if exists "career_applications_own" on public.career_applications;
create policy "career_applications_own" on public.career_applications
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "career_activities_own" on public.career_activities;
create policy "career_activities_own" on public.career_activities
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
