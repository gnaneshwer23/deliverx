-- Persistent Experience simulation event log (append-only)
-- State remains on xperience_enrolments.state (schemaVersion 2+)

create table if not exists public.experience_sim_events (
  id              uuid primary key default gen_random_uuid(),
  enrolment_id    uuid not null references public.xperience_enrolments(id) on delete cascade,
  user_id         uuid not null references public.users(id) on delete cascade,
  event_type      text not null,
  payload         jsonb not null default '{}'::jsonb,
  user_contribution jsonb not null default '{}'::jsonb,
  ai_contribution   jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists experience_sim_events_enrolment_idx
  on public.experience_sim_events(enrolment_id, created_at desc);

create index if not exists experience_sim_events_user_idx
  on public.experience_sim_events(user_id, created_at desc);

alter table public.experience_sim_events enable row level security;

drop policy if exists "experience_sim_events_own" on public.experience_sim_events;
create policy "experience_sim_events_own" on public.experience_sim_events
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Lifecycle phase on enrolment (additive)
alter table public.xperience_enrolments
  add column if not exists lifecycle_phase text not null default 'active'
    check (lifecycle_phase in (
      'draft', 'active', 'reflecting', 'assessing', 'completed', 'failed', 'paused'
    ));

create or replace function public.experience_sim_forbid_event_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'append-only: experience_sim_events';
end;
$$;

drop trigger if exists trg_experience_sim_events_immutable on public.experience_sim_events;
create trigger trg_experience_sim_events_immutable
  before update or delete on public.experience_sim_events
  for each row execute function public.experience_sim_forbid_event_mutation();
