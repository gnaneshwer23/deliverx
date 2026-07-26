-- B9 follow-up — atomic PI API rate-limit increment (concurrency hole fix).
-- Replaces read→compute→update last-writer-wins with a single upsert that
-- returns the post-increment count for allow/deny decisions.
-- Service-role only (mirrors 0089 / 0092 SECURITY DEFINER grant posture).

create or replace function public.pi_api_rate_limit_increment(
  p_user_id uuid,
  p_window_bucket timestamptz
)
returns integer
language sql
security definer
set search_path = public
as $$
  insert into public.pi_api_rate_limits as t (user_id, window_bucket, request_count)
  values (p_user_id, p_window_bucket, 1)
  on conflict (user_id, window_bucket)
  do update set request_count = t.request_count + 1
  returning t.request_count;
$$;

comment on function public.pi_api_rate_limit_increment(uuid, timestamptz) is
  'Atomic per-user PI API rate-limit counter. Returns post-increment request_count. Service-role only.';

revoke all on function public.pi_api_rate_limit_increment(uuid, timestamptz)
  from public, anon, authenticated;
grant execute on function public.pi_api_rate_limit_increment(uuid, timestamptz)
  to service_role;

-- Optional prune helper: delete buckets older than p_before (ops / scheduled job).
-- Full cron is optional; call periodically to bound table growth.
create or replace function public.pi_api_rate_limit_prune_before(
  p_before timestamptz
)
returns integer
language sql
security definer
set search_path = public
as $$
  with deleted as (
    delete from public.pi_api_rate_limits
    where window_bucket < p_before
    returning 1
  )
  select count(*)::integer from deleted;
$$;

comment on function public.pi_api_rate_limit_prune_before(timestamptz) is
  'Deletes pi_api_rate_limits rows with window_bucket older than p_before. Service-role only. Optional scheduled prune — no required cron.';

revoke all on function public.pi_api_rate_limit_prune_before(timestamptz)
  from public, anon, authenticated;
grant execute on function public.pi_api_rate_limit_prune_before(timestamptz)
  to service_role;
