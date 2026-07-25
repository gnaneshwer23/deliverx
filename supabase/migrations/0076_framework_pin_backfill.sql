-- Phase 0 WP 0.5: pin existing ScoreRuns to published pm-core framework version.
-- Idempotent and null-only — never overwrites an existing framework_version_id.

-- Optional column for durable content hash (also mirrored in result jsonb).
alter table public.pi_capability_score_runs
  add column if not exists framework_content_hash text;

do $$
declare
  v_id uuid;
  v_hash text;
  updated_count int;
begin
  select fv.id, fv.content_hash
    into v_id, v_hash
  from public.pi_cf_framework_versions fv
  join public.pi_cf_frameworks f on f.id = fv.framework_id
  where f.slug = 'pm-core'
    and fv.version = '2026.1'
    and fv.status in ('published', 'deprecated')
  limit 1;

  if v_id is null then
    raise notice '0076: no published pm-core@2026.1 — skip score-run backfill';
    return;
  end if;

  update public.pi_capability_score_runs
  set
    framework_version_id = v_id,
    framework_content_hash = coalesce(framework_content_hash, v_hash)
  where framework_version_id is null
    and rubric_slug = 'pm-core'
    and rubric_version = '2026.1';

  get diagnostics updated_count = row_count;
  raise notice '0076: pinned % score runs to pm-core@2026.1 (%)', updated_count, v_id;
end $$;
