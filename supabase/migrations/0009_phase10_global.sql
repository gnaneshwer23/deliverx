-- Deliverx Phase 10 — Global Intelligence Infrastructure
-- Apply after 0001–0008.
-- Pattern-level learning only — no raw enterprise data in global tables.

-- ===========================================================================
-- global_pattern_contributions — anonymized pattern signals (per org, private)
-- ===========================================================================
create table if not exists public.global_pattern_contributions (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  pattern_key       text not null,
  pattern_text      text not null,
  industry_bucket   text,
  project_type_bucket text,
  impact            numeric(5, 2) not null check (impact >= -100 and impact <= 100),
  confidence        numeric(3, 2) not null check (confidence >= 0 and confidence <= 1),
  contributed_at    timestamptz not null default now()
);

create index if not exists global_pattern_contrib_key_idx
  on public.global_pattern_contributions(pattern_key);
create index if not exists global_pattern_contrib_org_idx
  on public.global_pattern_contributions(organisation_id, contributed_at desc);

-- ===========================================================================
-- global_benchmark_contributions — anonymized metric values (per org, private)
-- ===========================================================================
create table if not exists public.global_benchmark_contributions (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  metric_key        text not null,
  value             numeric not null,
  industry_bucket   text,
  contributed_at    timestamptz not null default now()
);

create index if not exists global_benchmark_metric_idx
  on public.global_benchmark_contributions(metric_key);
create index if not exists global_benchmark_org_idx
  on public.global_benchmark_contributions(organisation_id, contributed_at desc);

-- ===========================================================================
-- global_copilot_runs — org-scoped strategic simulation audit log
-- ===========================================================================
create table if not exists public.global_copilot_runs (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  scenario_id     text not null,
  input           jsonb not null default '{}'::jsonb,
  output          jsonb not null,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists global_copilot_org_idx
  on public.global_copilot_runs(organisation_id, created_at desc);

-- ===========================================================================
-- Row Level Security — contributions are org-private; never cross-leaked via API
-- ===========================================================================
alter table public.global_pattern_contributions enable row level security;
alter table public.global_benchmark_contributions enable row level security;
alter table public.global_copilot_runs enable row level security;

drop policy if exists "global_pattern_contrib_org_insert" on public.global_pattern_contributions;
create policy "global_pattern_contrib_org_insert" on public.global_pattern_contributions
  for insert with check (organisation_id = public.current_org_id());

drop policy if exists "global_pattern_contrib_org_select" on public.global_pattern_contributions;
create policy "global_pattern_contrib_org_select" on public.global_pattern_contributions
  for select using (organisation_id = public.current_org_id());

drop policy if exists "global_benchmark_contrib_org_insert" on public.global_benchmark_contributions;
create policy "global_benchmark_contrib_org_insert" on public.global_benchmark_contributions
  for insert with check (organisation_id = public.current_org_id());

drop policy if exists "global_benchmark_contrib_org_select" on public.global_benchmark_contributions;
create policy "global_benchmark_contrib_org_select" on public.global_benchmark_contributions
  for select using (organisation_id = public.current_org_id());

drop policy if exists "global_copilot_org_select" on public.global_copilot_runs;
create policy "global_copilot_org_select" on public.global_copilot_runs
  for select using (organisation_id = public.current_org_id());

drop policy if exists "global_copilot_org_insert" on public.global_copilot_runs;
create policy "global_copilot_org_insert" on public.global_copilot_runs
  for insert with check (
    organisation_id = public.current_org_id()
    and created_by = auth.uid()
  );
