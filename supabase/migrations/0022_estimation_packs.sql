-- Phase 2 — role-native estimation packs + delivery success score snapshots

do $$ begin
  create type estimation_pack_role as enum ('pm', 'ba', 'engineering', 'qa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estimation_pack_status as enum ('draft', 'pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.estimation_packs (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  role              estimation_pack_role not null,
  line_items        jsonb not null default '[]'::jsonb,
  total_days        numeric(8, 2) not null default 0 check (total_days >= 0),
  confidence        int not null default 70 check (confidence between 0 and 100),
  rationale         text not null default '',
  status            estimation_pack_status not null default 'draft',
  reviewer_notes    text,
  decided_by        uuid references public.users(id) on delete set null,
  decided_at        timestamptz,
  created_by        uuid references public.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (project_id, role)
);

create index if not exists estimation_packs_project_idx
  on public.estimation_packs(project_id);

create table if not exists public.delivery_success_scores (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  score             int not null check (score between 0 and 100),
  tier              text not null check (tier in ('healthy', 'watch', 'at-risk')),
  components        jsonb not null default '{}'::jsonb,
  factors           jsonb not null default '[]'::jsonb,
  computed_at       timestamptz not null default now()
);

create index if not exists delivery_success_scores_project_idx
  on public.delivery_success_scores(project_id, computed_at desc);

alter table public.estimation_packs enable row level security;
alter table public.delivery_success_scores enable row level security;

drop policy if exists "estimation_packs_org" on public.estimation_packs;
create policy "estimation_packs_org" on public.estimation_packs
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "delivery_success_scores_org" on public.delivery_success_scores;
create policy "delivery_success_scores_org" on public.delivery_success_scores
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop trigger if exists estimation_packs_set_updated_at on public.estimation_packs;
create trigger estimation_packs_set_updated_at before update on public.estimation_packs
  for each row execute function public.set_updated_at();
