-- Sprint C5 — org-wide semantic memory search

create or replace function public.match_org_memory_chunks(
  p_query_embedding extensions.vector(1536),
  p_match_count int default 8,
  p_source_types text[] default null
)
returns table (
  id uuid,
  project_id uuid,
  project_name text,
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
    pmc.project_id,
    p.name as project_name,
    pmc.source_type::text,
    pmc.source_id,
    pmc.title,
    pmc.content,
    1 - (pmc.embedding <=> p_query_embedding) as similarity
  from public.project_memory_chunks pmc
  inner join public.projects p on p.id = pmc.project_id
  where pmc.organisation_id = public.current_org_id()
    and pmc.embedding is not null
    and (
      p_source_types is null
      or pmc.source_type::text = any (p_source_types)
    )
  order by pmc.embedding <=> p_query_embedding
  limit greatest(p_match_count, 1);
$$;
