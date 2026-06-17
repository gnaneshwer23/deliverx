-- Sprint C4 — voice project updates and RAG-backed Q&A log

create table if not exists public.voice_project_logs (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  created_by      uuid references public.users(id) on delete set null,
  kind            text not null check (kind in ('question', 'update')),
  transcript      text not null,
  summary         text,
  answer          text,
  rag_sources     jsonb not null default '[]',
  metadata        jsonb not null default '{}',
  created_at      timestamptz not null default now()
);

create index if not exists voice_project_logs_project_idx
  on public.voice_project_logs(project_id, created_at desc);

alter table public.voice_project_logs enable row level security;

drop policy if exists "voice_project_logs_org" on public.voice_project_logs;
create policy "voice_project_logs_org" on public.voice_project_logs
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());
