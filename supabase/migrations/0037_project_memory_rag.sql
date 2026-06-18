-- Sprint B2 — RAG project memory (pgvector chunks per project)

do $$ begin
  create type project_memory_source as enum (
    'business_case',
    'charter',
    'requirement',
    'meeting',
    'decision',
    'raid',
    'lesson',
    'report'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.project_memory_chunks (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  project_id      uuid not null references public.projects(id) on delete cascade,
  source_type     project_memory_source not null,
  source_id       uuid,
  title           text,
  content         text not null,
  chunk_index     integer not null default 0,
  embedding       extensions.vector(1536),
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (project_id, source_type, source_id, chunk_index)
);

create index if not exists project_memory_chunks_project_idx
  on public.project_memory_chunks(project_id, source_type);

alter table public.project_memory_chunks enable row level security;

drop policy if exists "project_memory_chunks_org" on public.project_memory_chunks;
create policy "project_memory_chunks_org" on public.project_memory_chunks
  for all using (organisation_id = public.current_org_id())
  with check (organisation_id = public.current_org_id());

drop trigger if exists project_memory_chunks_set_updated_at on public.project_memory_chunks;
create trigger project_memory_chunks_set_updated_at before update on public.project_memory_chunks
  for each row execute function public.set_updated_at();

create or replace function public.match_project_memory_chunks(
  p_project_id uuid,
  p_query_embedding extensions.vector(1536),
  p_match_count int default 8,
  p_source_types text[] default null
)
returns table (
  id uuid,
  source_type text,
  source_id uuid,
  title text,
  content text,
  similarity float
)
language sql stable
security invoker
as $$
  select
    pmc.id,
    pmc.source_type::text,
    pmc.source_id,
    pmc.title,
    pmc.content,
    1 - (pmc.embedding <=> p_query_embedding) as similarity
  from public.project_memory_chunks pmc
  where pmc.project_id = p_project_id
    and pmc.organisation_id = public.current_org_id()
    and pmc.embedding is not null
    and (
      p_source_types is null
      or pmc.source_type::text = any (p_source_types)
    )
  order by pmc.embedding <=> p_query_embedding
  limit greatest(p_match_count, 1);
$$;
