-- T2 — Rubric resolve provenance on ScoreRuns (observability for DB vs in-code fallback).
-- Additive only. Does not change scoring logic.

alter table public.pi_capability_score_runs
  add column if not exists rubric_resolve_source text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pi_capability_score_runs_rubric_resolve_source_check'
      and conrelid = 'public.pi_capability_score_runs'::regclass
  ) then
    alter table public.pi_capability_score_runs
      add constraint pi_capability_score_runs_rubric_resolve_source_check
      check (
        rubric_resolve_source is null
        or rubric_resolve_source in ('db', 'in_code_fallback')
      );
  end if;
end $$;

comment on column public.pi_capability_score_runs.rubric_resolve_source is
  'T2: how the rubric was resolved for this ScoreRun — db (pi_cf_* graph) or in_code_fallback (labelled).';

create index if not exists pi_capability_score_runs_rubric_resolve_source_idx
  on public.pi_capability_score_runs (rubric_resolve_source)
  where rubric_resolve_source is not null;
