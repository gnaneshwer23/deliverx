-- Capability Engine persistence (derived views only — never mutates evidence bodies)

create table if not exists public.pi_rubric_versions (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null,
  version         text not null,
  title           text not null,
  anchors         jsonb not null default '{}'::jsonb,
  status          text not null default 'published'
    check (status in ('draft', 'published', 'deprecated')),
  created_at      timestamptz not null default now(),
  unique (slug, version)
);

insert into public.pi_rubric_versions (slug, version, title, anchors, status)
values (
  'pm-core',
  '2026.1',
  'Product Manager core rubric',
  '{
    "levels": ["emerging", "developing", "proficient", "advanced"],
    "indicators": {
      "stakeholder_judgement": {
        "competency_id": "comp.stakeholder_management",
        "indicator_id": "ind.stakeholder_judgement",
        "anchors": {
          "emerging": "Identifies stakeholders with prompting",
          "developing": "Balances two stakeholder needs with trade-offs",
          "proficient": "Navigates conflicting priorities with clear rationale",
          "advanced": "Shapes multi-party alignment under ambiguity"
        }
      },
      "delivery_judgement": {
        "competency_id": "comp.delivery_execution",
        "indicator_id": "ind.delivery_judgement",
        "anchors": {
          "emerging": "Tracks tasks",
          "developing": "Sequences work with dependencies",
          "proficient": "Protects outcomes under constraint",
          "advanced": "Recovers delivery with systemic insight"
        }
      },
      "product_discovery": {
        "competency_id": "comp.product_discovery",
        "indicator_id": "ind.discovery_practice",
        "anchors": {
          "emerging": "Restates problems",
          "developing": "Forms testable hypotheses",
          "proficient": "Validates with evidence before build",
          "advanced": "Reframes problem space from outcomes"
        }
      }
    }
  }'::jsonb,
  'published'
)
on conflict (slug, version) do nothing;

create table if not exists public.pi_capability_score_runs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  rubric_version_id   uuid references public.pi_rubric_versions(id) on delete set null,
  rubric_slug         text not null,
  rubric_version      text not null,
  algorithm_version   text not null default 'capability-engine-v1',
  model_version       text,
  prompt_version      text,
  target_role         text,
  target_seniority    text,
  input_evidence_ids  uuid[] not null default '{}',
  input_hash          text not null,
  status              text not null default 'completed'
    check (status in ('running', 'completed', 'failed', 'needs_review')),
  result              jsonb not null default '{}'::jsonb,
  error_message       text,
  created_at          timestamptz not null default now()
);

create index if not exists pi_capability_score_runs_user_idx
  on public.pi_capability_score_runs(user_id, created_at desc);

create table if not exists public.pi_capability_judgements (
  id                  uuid primary key default gen_random_uuid(),
  score_run_id        uuid not null references public.pi_capability_score_runs(id) on delete cascade,
  user_id             uuid not null references public.users(id) on delete cascade,
  competency_id       text not null,
  indicator_id        text not null,
  level_proposed      text not null,
  evidence_refs       uuid[] not null default '{}',
  reasoning_summary   text not null,
  counter_evidence    text not null default '',
  confidence          numeric(4,3) not null check (confidence >= 0 and confidence <= 1),
  limitations         text not null default '',
  model_version       text not null,
  prompt_version      text not null,
  rubric_version      text not null,
  review_status       text not null default 'accepted'
    check (review_status in ('accepted', 'pending_review', 'rejected', 'superseded')),
  intelligence_kinds  text[] not null default '{}',
  created_at          timestamptz not null default now()
);

create index if not exists pi_capability_judgements_run_idx
  on public.pi_capability_judgements(score_run_id);

create table if not exists public.pi_capability_snapshots (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  score_run_id        uuid not null references public.pi_capability_score_runs(id) on delete cascade,
  schema_version      text not null default '1',
  profile             jsonb not null,
  captured_at         timestamptz not null default now()
);

create index if not exists pi_capability_snapshots_user_idx
  on public.pi_capability_snapshots(user_id, captured_at desc);

create table if not exists public.pi_capability_reviews (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  score_run_id        uuid references public.pi_capability_score_runs(id) on delete set null,
  judgement_id        uuid references public.pi_capability_judgements(id) on delete set null,
  reason              text not null,
  payload             jsonb not null default '{}'::jsonb,
  status              text not null default 'open'
    check (status in ('open', 'approved', 'rejected', 'dismissed')),
  created_at          timestamptz not null default now(),
  resolved_at         timestamptz
);

create index if not exists pi_capability_reviews_user_idx
  on public.pi_capability_reviews(user_id, status, created_at desc);

-- Append-only-ish: forbid UPDATE on judgements/score run results (new run instead)
create or replace function public.pi_forbid_capability_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'immutable capability artefact: %', tg_table_name;
end;
$$;

drop trigger if exists trg_pi_capability_judgements_immutable on public.pi_capability_judgements;
create trigger trg_pi_capability_judgements_immutable
  before update or delete on public.pi_capability_judgements
  for each row execute function public.pi_forbid_capability_mutation();

drop trigger if exists trg_pi_capability_snapshots_immutable on public.pi_capability_snapshots;
create trigger trg_pi_capability_snapshots_immutable
  before update or delete on public.pi_capability_snapshots
  for each row execute function public.pi_forbid_capability_mutation();

alter table public.pi_rubric_versions enable row level security;
alter table public.pi_capability_score_runs enable row level security;
alter table public.pi_capability_judgements enable row level security;
alter table public.pi_capability_snapshots enable row level security;
alter table public.pi_capability_reviews enable row level security;

drop policy if exists "pi_rubric_versions_read" on public.pi_rubric_versions;
create policy "pi_rubric_versions_read" on public.pi_rubric_versions
  for select to authenticated using (status = 'published' or status = 'deprecated');

drop policy if exists "pi_capability_score_runs_own" on public.pi_capability_score_runs;
create policy "pi_capability_score_runs_own" on public.pi_capability_score_runs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "pi_capability_judgements_own" on public.pi_capability_judgements;
create policy "pi_capability_judgements_own" on public.pi_capability_judgements
  for select using (user_id = auth.uid());

drop policy if exists "pi_capability_judgements_insert_own" on public.pi_capability_judgements;
create policy "pi_capability_judgements_insert_own" on public.pi_capability_judgements
  for insert with check (user_id = auth.uid());

drop policy if exists "pi_capability_snapshots_own" on public.pi_capability_snapshots;
create policy "pi_capability_snapshots_own" on public.pi_capability_snapshots
  for select using (user_id = auth.uid());

drop policy if exists "pi_capability_snapshots_insert_own" on public.pi_capability_snapshots;
create policy "pi_capability_snapshots_insert_own" on public.pi_capability_snapshots
  for insert with check (user_id = auth.uid());

drop policy if exists "pi_capability_reviews_own" on public.pi_capability_reviews;
create policy "pi_capability_reviews_own" on public.pi_capability_reviews
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
