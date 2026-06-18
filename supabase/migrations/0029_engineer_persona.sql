-- Engineer persona — specialisation, stack, and AI engineering plan per user

alter type user_role add value if not exists 'engineer';

create table if not exists public.engineer_context (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references public.organisations(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete cascade unique,
  specialisation      text,
  tech_stack          jsonb not null default '{}'::jsonb,
  engineering_plan    jsonb not null default '{}'::jsonb,
  ai_summary          text,
  extraction_status   text not null default 'pending',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.engineer_context enable row level security;

drop policy if exists "engineer_context_self" on public.engineer_context;
create policy "engineer_context_self" on public.engineer_context
  for all using (
    organisation_id = public.current_org_id()
    and user_id = auth.uid()
  )
  with check (
    organisation_id = public.current_org_id()
    and user_id = auth.uid()
  );

drop trigger if exists engineer_context_set_updated_at on public.engineer_context;
create trigger engineer_context_set_updated_at before update on public.engineer_context
  for each row execute function public.set_updated_at();
