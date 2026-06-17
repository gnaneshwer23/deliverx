-- Founder / Sponsor persona — org-level strategic context and financials

create table if not exists public.founder_context (
  id                  uuid primary key default gen_random_uuid(),
  organisation_id     uuid not null references public.organisations(id) on delete cascade unique,
  company_type        text,
  business_goals      jsonb not null default '[]'::jsonb,
  financials          jsonb not null default '{"cashInBank":620000,"monthlyBurn":45000,"runwayMonths":14,"mrr":25000,"arr":300000,"growthPct":12,"currency":"GBP","nextRaise":"Q2 2027"}'::jsonb,
  strategic_objectives jsonb not null default '[]'::jsonb,
  company_summary     jsonb not null default '{}'::jsonb,
  investor_snapshot   jsonb not null default '{}'::jsonb,
  ai_summary          text,
  extraction_status   text not null default 'pending',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.founder_context enable row level security;

drop policy if exists "founder_context_org" on public.founder_context;
create policy "founder_context_org" on public.founder_context
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop trigger if exists founder_context_set_updated_at on public.founder_context;
create trigger founder_context_set_updated_at before update on public.founder_context
  for each row execute function public.set_updated_at();
