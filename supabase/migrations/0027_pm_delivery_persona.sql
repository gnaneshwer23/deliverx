-- Project Manager (delivery) persona — budget context and AI plan snapshots

create table if not exists public.pm_delivery_context (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade unique,
  project_type      text,
  budget            jsonb not null default '{"approved":750000,"spent":0,"forecast":720000,"currency":"GBP"}'::jsonb,
  delivery_plan     jsonb not null default '{}'::jsonb,
  ai_summary        text,
  go_live_probability numeric(4, 3),
  extraction_status text not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.pm_delivery_context enable row level security;

drop policy if exists "pm_delivery_context_org" on public.pm_delivery_context;
create policy "pm_delivery_context_org" on public.pm_delivery_context
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop trigger if exists pm_delivery_context_set_updated_at on public.pm_delivery_context;
create trigger pm_delivery_context_set_updated_at before update on public.pm_delivery_context
  for each row execute function public.set_updated_at();
