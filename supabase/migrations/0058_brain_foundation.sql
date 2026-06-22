-- Brief v2 Phase 2 — Delivery Brain foundation tables

create table if not exists public.brain_documents (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  title           text not null,
  source_type     text not null default 'upload',
  status          text not null default 'pending',
  classification  jsonb not null default '{}'::jsonb,
  storage_path    text,
  created_by      uuid references public.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists brain_documents_org_idx
  on public.brain_documents(organisation_id, status, created_at desc);

create table if not exists public.playbooks (
  id                uuid primary key default gen_random_uuid(),
  organisation_id   uuid not null references public.organisations(id) on delete cascade,
  name              text not null,
  content           jsonb not null default '{}'::jsonb,
  source_document_id uuid references public.brain_documents(id) on delete set null,
  created_by        uuid references public.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists playbooks_org_idx
  on public.playbooks(organisation_id, created_at desc);

create table if not exists public.brain_patterns (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  document_id     uuid references public.brain_documents(id) on delete cascade,
  pattern_type    text not null,
  payload         jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists brain_patterns_org_doc_idx
  on public.brain_patterns(organisation_id, document_id);

alter table public.brain_documents enable row level security;
alter table public.playbooks enable row level security;
alter table public.brain_patterns enable row level security;

drop policy if exists "brain_documents_org" on public.brain_documents;
create policy "brain_documents_org" on public.brain_documents
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "playbooks_org" on public.playbooks;
create policy "playbooks_org" on public.playbooks
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop policy if exists "brain_patterns_org" on public.brain_patterns;
create policy "brain_patterns_org" on public.brain_patterns
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
