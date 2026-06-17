-- Scrum Master persona — agile framework, team config, and AI coaching plan

alter type user_role add value if not exists 'scrum_master';

create table if not exists public.scrum_context (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references public.organisations(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete cascade unique,
  agile_framework     text,
  team_config         text,
  sprint_plan         jsonb not null default '{}'::jsonb,
  ai_summary          text,
  extraction_status   text not null default 'pending',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.scrum_context enable row level security;

drop policy if exists "scrum_context_self" on public.scrum_context;
create policy "scrum_context_self" on public.scrum_context
  for all using (
    organisation_id = public.current_org_id()
    and user_id = auth.uid()
  )
  with check (
    organisation_id = public.current_org_id()
    and user_id = auth.uid()
  );

drop trigger if exists scrum_context_set_updated_at on public.scrum_context;
create trigger scrum_context_set_updated_at before update on public.scrum_context
  for each row execute function public.set_updated_at();
