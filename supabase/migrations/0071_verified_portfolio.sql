-- Verified Professional Portfolio
-- Every claim links to Evidence Ledger records. Sharing is tokenised + revocable.

create table if not exists public.vpp_entries (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references public.users(id) on delete cascade,
  title                       text not null,
  target_role                 text,
  lifecycle                   text not null default 'draft'
    check (lifecycle in ('draft', 'compiling', 'reviewing', 'ready', 'shared', 'archived')),
  visibility                  text not null default 'private'
    check (visibility in ('private', 'link', 'role_version', 'public')),
  project_context             text not null default '',
  user_responsibility         text not null default '',
  challenge                   text not null default '',
  actions                     text not null default '',
  decisions                   text not null default '',
  artefacts                   text not null default '',
  outcomes                    text not null default '',
  competencies_demonstrated   jsonb not null default '[]'::jsonb,
  evidence_strength           text not null default 'self_reported'
    check (evidence_strength in (
      'self_reported',
      'document_supported',
      'observed',
      'repeatedly_demonstrated',
      'outcome_validated',
      'externally_verified'
    )),
  contribution_breakdown      jsonb not null default '{}'::jsonb,
  reflection                  text not null default '',
  verifier_status             text not null default 'none'
    check (verifier_status in (
      'none', 'self_attested', 'pending_external', 'externally_attested', 'disputed'
    )),
  ai_assistance_disclosure    text not null default '',
  ai_summary                  text,
  narrative                   text not null default '',
  hidden_fields               jsonb not null default '[]'::jsonb,
  migrated_from_type          text,
  migrated_from_id            uuid,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists vpp_entries_user_idx
  on public.vpp_entries(user_id, updated_at desc);

create table if not exists public.vpp_entry_evidence (
  id                uuid primary key default gen_random_uuid(),
  entry_id          uuid not null references public.vpp_entries(id) on delete cascade,
  evidence_id       uuid not null references public.pi_evidence_records(id) on delete restrict,
  claim_field       text not null default 'general',
  strength          text not null,
  title_snapshot    text not null,
  source_type       text not null,
  ledger_status     text not null,
  confidentiality   text not null default 'private',
  created_at        timestamptz not null default now(),
  unique (entry_id, evidence_id, claim_field)
);

create index if not exists vpp_entry_evidence_entry_idx
  on public.vpp_entry_evidence(entry_id);

create table if not exists public.vpp_versions (
  id            uuid primary key default gen_random_uuid(),
  entry_id      uuid not null references public.vpp_entries(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  role_label    text not null,
  snapshot      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists vpp_versions_entry_idx
  on public.vpp_versions(entry_id, created_at desc);

create table if not exists public.vpp_shares (
  id              uuid primary key default gen_random_uuid(),
  entry_id        uuid not null references public.vpp_entries(id) on delete cascade,
  version_id      uuid references public.vpp_versions(id) on delete set null,
  user_id         uuid not null references public.users(id) on delete cascade,
  token           text not null unique,
  label           text,
  status          text not null default 'active'
    check (status in ('active', 'revoked', 'expired')),
  expires_at      timestamptz,
  hidden_fields   jsonb not null default '[]'::jsonb,
  view_count      integer not null default 0,
  last_viewed_at  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists vpp_shares_token_idx on public.vpp_shares(token);
create index if not exists vpp_shares_user_idx on public.vpp_shares(user_id, created_at desc);

drop trigger if exists vpp_entries_set_updated_at on public.vpp_entries;
create trigger vpp_entries_set_updated_at
  before update on public.vpp_entries
  for each row execute function public.set_updated_at();

drop trigger if exists vpp_shares_set_updated_at on public.vpp_shares;
create trigger vpp_shares_set_updated_at
  before update on public.vpp_shares
  for each row execute function public.set_updated_at();

alter table public.vpp_entries enable row level security;
alter table public.vpp_entry_evidence enable row level security;
alter table public.vpp_versions enable row level security;
alter table public.vpp_shares enable row level security;

drop policy if exists "vpp_entries_own" on public.vpp_entries;
create policy "vpp_entries_own" on public.vpp_entries
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "vpp_entry_evidence_own" on public.vpp_entry_evidence;
create policy "vpp_entry_evidence_own" on public.vpp_entry_evidence
  for all using (
    exists (select 1 from public.vpp_entries e where e.id = entry_id and e.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.vpp_entries e where e.id = entry_id and e.user_id = auth.uid())
  );

drop policy if exists "vpp_versions_own" on public.vpp_versions;
create policy "vpp_versions_own" on public.vpp_versions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "vpp_shares_own" on public.vpp_shares;
create policy "vpp_shares_own" on public.vpp_shares
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

comment on table public.vpp_entries is
  'Verified Professional Portfolio entries. deliverxVerified is derived in app code — never set from heuristic scores.';
