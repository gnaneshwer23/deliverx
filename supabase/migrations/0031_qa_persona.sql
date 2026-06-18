-- QA / Test Manager persona — specialisation, tools, and AI quality plan

alter type user_role add value if not exists 'qa';

create table if not exists public.qa_context (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references public.organisations(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete cascade unique,
  specialisation      text,
  testing_tools       text[] not null default '{}'::text[],
  quality_plan        jsonb not null default '{}'::jsonb,
  ai_summary          text,
  extraction_status   text not null default 'pending',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.qa_context enable row level security;

drop policy if exists "qa_context_self" on public.qa_context;
create policy "qa_context_self" on public.qa_context
  for all using (
    organisation_id = public.current_org_id()
    and user_id = auth.uid()
  )
  with check (
    organisation_id = public.current_org_id()
    and user_id = auth.uid()
  );

drop trigger if exists qa_context_set_updated_at on public.qa_context;
create trigger qa_context_set_updated_at before update on public.qa_context
  for each row execute function public.set_updated_at();
