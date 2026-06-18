-- Product Manager persona — vision, features, roadmap, customer insights

alter type user_role add value if not exists 'product_manager';

do $$ begin
  create type roadmap_horizon as enum ('now', 'next', 'later');
exception when duplicate_object then null; end $$;

do $$ begin
  create type product_feature_status as enum ('idea', 'planned', 'in_progress', 'shipped', 'deprecated');
exception when duplicate_object then null; end $$;

create table if not exists public.pm_product_context (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade unique,
  product_type      text,
  context_sources   jsonb not null default '[]'::jsonb,
  product_context   jsonb not null default '{}'::jsonb,
  analytics         jsonb not null default '{}'::jsonb,
  extraction_status text not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists public.product_features (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  feature_code      text not null,
  title             text not null,
  description       text not null default '',
  status            product_feature_status not null default 'idea',
  rice              jsonb not null default '{}'::jsonb,
  horizon           roadmap_horizon not null default 'later',
  priority_rank     int not null default 100,
  linked_stakeholders jsonb not null default '[]'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (project_id, feature_code)
);

create index if not exists product_features_project_idx
  on public.product_features(project_id, horizon);

create table if not exists public.customer_insights (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  theme             text not null default '',
  insight_type      text not null default 'pain_point',
  content           text not null,
  sentiment         text not null default 'neutral',
  priority          text not null default 'medium',
  source            text,
  created_at        timestamptz not null default now()
);

create index if not exists customer_insights_project_idx
  on public.customer_insights(project_id, insight_type);

create table if not exists public.customer_segments (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid references public.projects(id) on delete cascade,
  name              text not null,
  user_count        int not null default 0,
  revenue           numeric(12, 2) not null default 0,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists customer_segments_org_idx
  on public.customer_segments(organisation_id);

alter table public.pm_product_context enable row level security;
alter table public.product_features enable row level security;
alter table public.customer_insights enable row level security;
alter table public.customer_segments enable row level security;

drop policy if exists "pm_product_context_org" on public.pm_product_context;
create policy "pm_product_context_org" on public.pm_product_context
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "product_features_org" on public.product_features;
create policy "product_features_org" on public.product_features
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "customer_insights_org" on public.customer_insights;
create policy "customer_insights_org" on public.customer_insights
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "customer_segments_org" on public.customer_segments;
create policy "customer_segments_org" on public.customer_segments
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop trigger if exists pm_product_context_set_updated_at on public.pm_product_context;
create trigger pm_product_context_set_updated_at before update on public.pm_product_context
  for each row execute function public.set_updated_at();

drop trigger if exists product_features_set_updated_at on public.product_features;
create trigger product_features_set_updated_at before update on public.product_features
  for each row execute function public.set_updated_at();

drop trigger if exists customer_segments_set_updated_at on public.customer_segments;
create trigger customer_segments_set_updated_at before update on public.customer_segments
  for each row execute function public.set_updated_at();
