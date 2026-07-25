-- Professional Intelligence progressive onboarding (person-level)
-- Additive; does not alter Experience/Launchpad/Team Co-pilot tables.

create table if not exists public.pi_onboarding_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade unique,
  current_step    text not null default 'identity'
    check (current_step in (
      'identity',
      'situation',
      'targets',
      'evidence',
      'consent',
      'path',
      'completed'
    )),
  status          text not null default 'started'
    check (status in ('started', 'completed')),
  payload         jsonb not null default '{}'::jsonb,
  recommended_path text
    check (recommended_path is null or recommended_path in (
      'experience',
      'launchpad',
      'hub'
    )),
  chosen_path     text
    check (chosen_path is null or chosen_path in (
      'experience',
      'launchpad',
      'hub'
    )),
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists pi_onboarding_sessions_status_idx
  on public.pi_onboarding_sessions(status);

alter table public.pi_onboarding_sessions enable row level security;

drop policy if exists "pi_onboarding_sessions_self" on public.pi_onboarding_sessions;
create policy "pi_onboarding_sessions_self" on public.pi_onboarding_sessions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop trigger if exists pi_onboarding_sessions_set_updated_at on public.pi_onboarding_sessions;
create trigger pi_onboarding_sessions_set_updated_at
  before update on public.pi_onboarding_sessions
  for each row execute function public.set_updated_at();
